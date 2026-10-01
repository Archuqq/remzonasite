import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourcePath = path.join(process.cwd(), "assets-source/hero-mercedes.png");
const outputDirectory = path.join(process.cwd(), "public/images");
const sizes = [640, 1024, 1600, 1920] as const;

async function main() {
  const source = sharp(sourcePath, { failOn: "error" });
  const metadata = await source.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(
      "Не удалось определить размер assets-source/hero-mercedes.png",
    );
  }

  await mkdir(outputDirectory, { recursive: true });

  for (const width of sizes) {
    const webpPath = path.join(outputDirectory, `hero-${width}.webp`);
    const avifPath = path.join(outputDirectory, `hero-${width}.avif`);

    await Promise.all([
      source
        .clone()
        .resize({ width, withoutEnlargement: false })
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath),
      source
        .clone()
        .resize({ width, withoutEnlargement: false })
        .avif({ quality: 55, effort: 7 })
        .toFile(avifPath),
    ]);

    const [webp, avif] = await Promise.all([
      sharp(webpPath).metadata(),
      sharp(avifPath).metadata(),
    ]);
    const [webpStats, avifStats] = await Promise.all([
      stat(webpPath),
      stat(avifPath),
    ]);

    console.log(
      `hero-${width}: WebP ${webp.width}x${webp.height}, ${(webpStats.size / 1024).toFixed(1)} KB; AVIF ${avif.width}x${avif.height}, ${(avifStats.size / 1024).toFixed(1)} KB`,
    );
  }

  const blurBuffer = await source
    .clone()
    .resize({ width: 24, withoutEnlargement: true })
    .blur(1.5)
    .webp({ quality: 35 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  const blurModule = `export const HERO_BLUR_DATA_URL = ${JSON.stringify(blurDataUrl)};\n`;

  await writeFile(
    path.join(process.cwd(), "src/lib/hero-blur.ts"),
    blurModule,
    "utf8",
  );

  console.log(
    `Blur placeholder: ${(blurBuffer.byteLength / 1024).toFixed(1)} KB`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
