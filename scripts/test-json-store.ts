import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import {
  readJsonFile,
  updateJsonFile,
  writeJsonFile,
} from "@/lib/json-store";

async function main(): Promise<void> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "remzona-store-test-"));
  const filePath = path.join(directory, "counter.json");
  const schema = z.array(z.number().int());

  try {
    assert.deepEqual(await readJsonFile(filePath, schema, [0]), [0]);
    await writeJsonFile(filePath, [1]);
    assert.deepEqual(await readJsonFile(filePath, schema, [0]), [1]);
    await writeJsonFile(filePath, [0]);
    const updates = Array.from({ length: 40 }, () =>
      updateJsonFile(filePath, schema, [0], async (current) => {
        await Promise.resolve();
        return { data: [current[0] + 1], result: undefined };
      }),
    );
    await Promise.all(updates);
    assert.deepEqual(await readJsonFile(filePath, schema, [0]), [40]);

    await writeFile(filePath, "{invalid", "utf8");
    await assert.rejects(
      readJsonFile(filePath, schema, [0]),
      /Некорректный JSON в файле/,
    );

    const stored = await readFile(filePath, "utf8");
    assert.equal(stored, "{invalid");
    console.log("PASS missing-file fallback, serialized updates and corruption errors");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});