import bcrypt from "bcryptjs";
import { access } from "node:fs/promises";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  getDataFilePath,
  readJsonFile,
} from "@/lib/json-store";

export const adminFileSchema = z.object({
  login: z.string().min(1),
  passwordHash: z.string().min(1),
});

export type AdminRecord = z.infer<typeof adminFileSchema>;

async function createAdminFromEnvironment(): Promise<AdminRecord> {
  const login = env.ADMIN_LOGIN?.trim();
  const password = env.ADMIN_PASSWORD;
  if (!login || !password) {
    throw new Error(
      "Для первого создания администратора задайте ADMIN_LOGIN и ADMIN_PASSWORD.",
    );
  }

  return {
    login,
    passwordHash: await bcrypt.hash(password, 12),
  };
}

export async function getAdminFilePath(): Promise<string> {
  return getDataFilePath("admin.json");
}

export async function seedAdminFileIfMissing(): Promise<boolean> {
  const filePath = await getAdminFilePath();
  try {
    await access(filePath);
    return false;
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }

  await readJsonFile(
    filePath,
    adminFileSchema,
    await createAdminFromEnvironment(),
  );
  return true;
}

export async function getAdminRecord(): Promise<AdminRecord> {
  await seedAdminFileIfMissing();
  const fallback: AdminRecord = {
    login: env.ADMIN_LOGIN ?? "admin",
    passwordHash: "invalid-admin-record",
  };
  return readJsonFile(await getAdminFilePath(), adminFileSchema, fallback);
}
