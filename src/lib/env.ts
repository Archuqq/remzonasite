import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET должен быть не короче 32 символов"),
  ADMIN_LOGIN: z.string().min(1, "Задайте ADMIN_LOGIN").optional(),
  ADMIN_PASSWORD: z.string().min(1, "Задайте ADMIN_PASSWORD").optional(),
  DATA_DIR: z.string().min(1, "Задайте DATA_DIR").default("./data"),
  UPLOADS_DIR: z.string().min(1, "Задайте UPLOADS_DIR").default("./uploads"),
  SITE_URL: z.string().url("SITE_URL должен быть абсолютным URL"),
});

export type Env = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.join(".") || "(корень)";
    return `  • ${path}: ${issue.message}`;
  });
  return [
    "Не заданы или некорректны переменные окружения.",
    "Скопируйте .env.example в .env и заполните значения.",
    ...lines,
  ].join("\n");
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_LOGIN: process.env.ADMIN_LOGIN,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    DATA_DIR: process.env.DATA_DIR,
    UPLOADS_DIR: process.env.UPLOADS_DIR,
    SITE_URL: process.env.SITE_URL,
  });

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}

/** Типобезопасные переменные окружения. Падает при старте, если чего-то нет. */
export const env = loadEnv();
