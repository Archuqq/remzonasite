import "dotenv/config";
import { access } from "node:fs/promises";
import { createDefaultServices } from "@/lib/service-store";
import { DEFAULT_STORED_SETTINGS } from "@/lib/settings";
import { getDataFilePath, writeJsonFile } from "@/lib/json-store";
import { seedAdminFileIfMissing } from "@/lib/admin-store";

async function seedFileIfMissing(
  fileName: string,
  data: unknown,
): Promise<void> {
  const filePath = await getDataFilePath(fileName);
  try {
    await access(filePath);
    console.log(`${fileName} уже существует — оставляем без изменений.`);
    return;
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

  await writeJsonFile(filePath, data);
  console.log(`Создан ${fileName}.`);
}

async function main(): Promise<void> {
  await seedFileIfMissing("services.json", createDefaultServices());
  await seedFileIfMissing("settings.json", DEFAULT_STORED_SETTINGS);
  const adminCreated = await seedAdminFileIfMissing();
  console.log(
    adminCreated
      ? "Создан admin.json из ADMIN_LOGIN и ADMIN_PASSWORD."
      : "admin.json уже существует — оставляем без изменений.",
  );
}

main().catch((error: unknown) => {
  console.error("Не удалось подготовить JSON-данные приложения.", error);
  process.exitCode = 1;
});