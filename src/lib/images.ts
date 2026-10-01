import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "sharp";
import sharp from "sharp";
import {
  SERVICE_IMAGE_MAX_BYTES,
  SERVICE_IMAGE_MAX_PIXELS,
  SERVICE_IMAGE_PLACEHOLDER_URL,
} from "@/lib/image-constants";

export {
  SERVICE_IMAGE_MAX_BYTES,
  SERVICE_IMAGE_MAX_PIXELS,
  SERVICE_IMAGE_PLACEHOLDER_URL,
};

const IMAGE_SIZES = [1200, 600] as const;
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ServiceImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceImageError";
  }
}

function getServiceImagesDirectory(): string {
  const uploadsDirectory = process.env.UPLOADS_DIR?.trim() || "./uploads";
  return path.resolve(process.cwd(), uploadsDirectory, "services");
}

function getImageFilePath(id: string, size: (typeof IMAGE_SIZES)[number]) {
  if (!UUID_PATTERN.test(id)) {
    throw new ServiceImageError("Некорректный идентификатор изображения.");
  }

  return path.join(getServiceImagesDirectory(), `${id}-${size}.webp`);
}

function isHeifContainer(buffer: Buffer): boolean {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") {
    return false;
  }

  const brands = buffer.toString("ascii", 8, Math.min(buffer.length, 32));
  return /hei[cfx]|hev[cf]|mif1|msf1/i.test(brands);
}

/** Проверяет изображение по содержимому, сохраняет две WebP-версии 2:1 и возвращает UUID. */
export async function saveServiceImage(buffer: Buffer): Promise<string> {
  if (buffer.byteLength > SERVICE_IMAGE_MAX_BYTES) {
    throw new ServiceImageError(
      "Размер изображения не должен превышать 10 МБ.",
    );
  }

  if (buffer.byteLength === 0) {
    throw new ServiceImageError("Файл изображения пуст.");
  }

  const input = sharp(buffer, {
    failOn: "error",
    limitInputPixels: SERVICE_IMAGE_MAX_PIXELS,
  });
  let metadata: Metadata;

  try {
    metadata = await input.metadata();
  } catch (error) {
    if (isHeifContainer(buffer)) {
      throw new ServiceImageError(
        "Эта сборка sharp не смогла декодировать HEIC/HEIF. Сохраните фото как JPEG, PNG или WebP.",
      );
    }

    if (
      error instanceof Error &&
      /pixel limit|pixel count|image is too large/i.test(error.message)
    ) {
      throw new ServiceImageError(
        "Разрешение изображения слишком большое (максимум 40 мегапикселей).",
      );
    }

    throw new ServiceImageError(
      "Не удалось прочитать изображение. Проверьте, что файл не повреждён.",
    );
  }

  if (!metadata.format || !ACCEPTED_FORMATS.has(metadata.format)) {
    throw new ServiceImageError(
      "Поддерживаются только изображения JPEG, PNG, WebP и HEIC/HEIF.",
    );
  }

  if (!metadata.width || !metadata.height) {
    throw new ServiceImageError("Не удалось определить размер изображения.");
  }

  if (metadata.width * metadata.height > SERVICE_IMAGE_MAX_PIXELS) {
    throw new ServiceImageError(
      "Разрешение изображения слишком большое (максимум 40 мегапикселей).",
    );
  }

  const id = randomUUID();
  const directory = getServiceImagesDirectory();
  const outputPaths = IMAGE_SIZES.map((size) => getImageFilePath(id, size));

  await mkdir(directory, { recursive: true });

  try {
    await Promise.all(
      IMAGE_SIZES.map((size, index) =>
        input
          .clone()
          .rotate()
          .flatten({ background: "#F7F7F5" })
          .resize(size, size / 2, {
            fit: "cover",
            position: "centre",
          })
          .webp({ quality: 80, effort: 5 })
          .toFile(outputPaths[index]),
      ),
    );
  } catch {
    await Promise.all(
      outputPaths.map((filePath) => rm(filePath, { force: true })),
    );

    if (metadata.format === "heif") {
      throw new ServiceImageError(
        "Эта сборка sharp не поддерживает декодирование HEIC/HEIF. Сохраните фото как JPEG, PNG или WebP.",
      );
    }

    throw new ServiceImageError(
      "Не удалось обработать изображение. Проверьте, что файл не повреждён.",
    );
  }

  return id;
}

/** Удаляет обе версии изображения; отсутствие файлов не считается ошибкой. */
export async function deleteServiceImage(id: string): Promise<void> {
  if (!id) return;

  const paths = IMAGE_SIZES.map((size) => getImageFilePath(id, size));
  await Promise.all(paths.map((filePath) => rm(filePath, { force: true })));
}

/** Возвращает пути к версиям 1200/600 px либо URL общей заглушки. */
export function getServiceImageUrls(id: string | null | undefined): {
  src1200: string;
  src600: string;
} {
  if (!id || !UUID_PATTERN.test(id)) {
    return {
      src1200: SERVICE_IMAGE_PLACEHOLDER_URL,
      src600: SERVICE_IMAGE_PLACEHOLDER_URL,
    };
  }

  return {
    src1200: `/uploads/services/${id}-1200.webp`,
    src600: `/uploads/services/${id}-600.webp`,
  };
}
