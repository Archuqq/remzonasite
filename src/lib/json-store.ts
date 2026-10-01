import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";

const writeQueues = new Map<string, Promise<void>>();

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function parseJson<T>(filePath: string, contents: string, schema: ZodType<T>): T {
  let value: unknown;
  try {
    value = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Некорректный JSON в файле ${filePath}.`, { cause: error });
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Данные в файле ${filePath} не прошли проверку: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

async function writeAtomically<T>(filePath: string, data: T): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.tmp-${randomUUID()}`;

  try {
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

async function withFileLock<T>(
  filePath: string,
  operation: (resolvedPath: string) => Promise<T>,
): Promise<T> {
  const resolvedPath = path.resolve(filePath);
  const previous = writeQueues.get(resolvedPath) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queued = previous.catch(() => undefined).then(() => current);
  writeQueues.set(resolvedPath, queued);

  await previous.catch(() => undefined);
  try {
    return await operation(resolvedPath);
  } finally {
    release();
    if (writeQueues.get(resolvedPath) === queued) {
      writeQueues.delete(resolvedPath);
    }
  }
}

async function readOrCreate<T>(
  filePath: string,
  schema: ZodType<T>,
  fallback: T,
): Promise<T> {
  try {
    return parseJson(filePath, await readFile(filePath, "utf8"), schema);
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    await writeAtomically(filePath, fallback);
    return fallback;
  }
}

export async function getDataDirectory(): Promise<string> {
  const configuredDirectory = process.env.DATA_DIR?.trim() || "./data";
  const directory = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    configuredDirectory,
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  return directory;
}

export async function getDataFilePath(fileName: string): Promise<string> {
  return path.join(
    /* turbopackIgnore: true */ await getDataDirectory(),
    fileName,
  );
}

export async function readJsonFile<T>(
  filePath: string,
  schema: ZodType<T>,
  fallback: T,
): Promise<T> {
  const resolvedPath = path.resolve(filePath);
  try {
    return parseJson(resolvedPath, await readFile(resolvedPath, "utf8"), schema);
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    return withFileLock(resolvedPath, (lockedPath) =>
      readOrCreate(lockedPath, schema, fallback),
    );
  }
}

export async function writeJsonFile<T>(
  filePath: string,
  data: T,
): Promise<void> {
  await withFileLock(filePath, (resolvedPath) =>
    writeAtomically(resolvedPath, data),
  );
}

/** Queues the complete read-modify-write cycle so parallel requests cannot lose updates. */
export async function updateJsonFile<T, R>(
  filePath: string,
  schema: ZodType<T>,
  fallback: T,
  update: (current: T) => { data: T; result: R } | Promise<{ data: T; result: R }>,
): Promise<R> {
  return withFileLock(filePath, async (resolvedPath) => {
    const current = await readOrCreate(resolvedPath, schema, fallback);
    const next = await update(current);
    await writeAtomically(resolvedPath, next.data);
    return next.result;
  });
}