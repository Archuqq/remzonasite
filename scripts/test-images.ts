import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

let temporaryDirectory = "";
let imageTools: typeof import("../src/lib/images");

async function expectSize(
  buffer: Buffer,
  expectedWidth: number,
  expectedHeight: number,
) {
  const id = await imageTools.saveServiceImage(buffer);
  const urls = imageTools.getServiceImageUrls(id);
  assert.deepEqual(urls, {
    src1200: `/uploads/services/${id}-1200.webp`,
    src600: `/uploads/services/${id}-600.webp`,
  });

  const variants = [
    { width: 1200, height: 600, file: `${id}-1200.webp` },
    { width: 600, height: 300, file: `${id}-600.webp` },
  ];

  for (const variant of variants) {
    const filePath = path.join(temporaryDirectory, "services", variant.file);
    const metadata = await sharp(filePath).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, variant.width);
    assert.equal(metadata.height, variant.height);
    assert.ok((await stat(filePath)).size > 0);
  }

  await imageTools.deleteServiceImage(id);
  await imageTools.deleteServiceImage(id);
  await assert.rejects(
    readFile(path.join(temporaryDirectory, "services", `${id}-1200.webp`)),
  );
  console.log(`PASS ${expectedWidth}x${expectedHeight} input`);
  return id;
}

async function expectImageError(buffer: Buffer, message: RegExp) {
  await assert.rejects(
    imageTools.saveServiceImage(buffer),
    (error: unknown) => {
      return (
        error instanceof imageTools.ServiceImageError &&
        message.test(error.message)
      );
    },
  );
}

async function main() {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "remzona-images-"));
  process.env.UPLOADS_DIR = temporaryDirectory;
  imageTools = await import("../src/lib/images");

  assert.deepEqual(imageTools.getServiceImageUrls(""), {
    src1200: imageTools.SERVICE_IMAGE_PLACEHOLDER_URL,
    src600: imageTools.SERVICE_IMAGE_PLACEHOLDER_URL,
  });

  const fixtures = [
    {
      width: 300,
      height: 700,
      format: "jpeg" as const,
      background: "#d7e4ee",
    },
    {
      width: 1600,
      height: 300,
      format: "webp" as const,
      background: "#a7bdc6",
    },
    {
      width: 500,
      height: 500,
      format: "png" as const,
      background: "#b8aa98",
    },
  ];

  for (const fixture of fixtures) {
    const buffer = await sharp({
      create: {
        width: fixture.width,
        height: fixture.height,
        channels: 3,
        background: fixture.background,
      },
    })
      .toFormat(fixture.format)
      .toBuffer();

    await expectSize(buffer, fixture.width, fixture.height);
  }

  const transparentPng = await sharp({
    create: {
      width: 80,
      height: 40,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
  const transparentId = await imageTools.saveServiceImage(transparentPng);
  const flattenedPixel = await sharp(
    path.join(temporaryDirectory, "services", `${transparentId}-1200.webp`),
  )
    .extract({ left: 600, top: 300, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.deepEqual([...flattenedPixel], [247, 247, 245]);
  await imageTools.deleteServiceImage(transparentId);
  console.log("PASS transparent PNG flattened on #F7F7F5");

  const orientedJpeg = await sharp({
    create: {
      width: 80,
      height: 40,
      channels: 3,
      background: "#66808a",
    },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  assert.equal((await sharp(orientedJpeg).metadata()).orientation, 6);
  const orientedId = await imageTools.saveServiceImage(orientedJpeg);
  const orientedOutput = await sharp(
    path.join(temporaryDirectory, "services", `${orientedId}-1200.webp`),
  ).metadata();
  assert.equal(orientedOutput.orientation, undefined);
  await imageTools.deleteServiceImage(orientedId);
  console.log("PASS EXIF orientation handled and metadata removed");

  await expectImageError(
    Buffer.from("not an image"),
    /Поддерживаются|прочитать/,
  );
  console.log("PASS non-image rejected");

  const heicContainer = Buffer.alloc(24);
  heicContainer.writeUInt32BE(24, 0);
  heicContainer.write("ftyp", 4, "ascii");
  heicContainer.write("heic", 8, "ascii");
  heicContainer.write("mif1", 16, "ascii");
  await expectImageError(heicContainer, /HEIC\/HEIF/);
  console.log("PASS HEIC/HEIF decoder limitations reported clearly");

  await expectImageError(
    Buffer.alloc(imageTools.SERVICE_IMAGE_MAX_BYTES + 1),
    /10 МБ/,
  );
  console.log("PASS file over 10 MB rejected");

  const pixelBomb = await sharp({
    create: {
      width: Math.floor(Math.sqrt(imageTools.SERVICE_IMAGE_MAX_PIXELS)) + 1,
      height: Math.floor(Math.sqrt(imageTools.SERVICE_IMAGE_MAX_PIXELS)) + 1,
      channels: 3,
      background: "white",
    },
  })
    .png()
    .toBuffer();
  await expectImageError(pixelBomb, /40 мегапикселей|слишком большое/);
  console.log("PASS image over 40 MP rejected");

  const routeImage = await sharp({
    create: {
      width: 64,
      height: 32,
      channels: 3,
      background: "#8d9ba1",
    },
  })
    .png()
    .toBuffer();
  const routeImageId = await imageTools.saveServiceImage(routeImage);
  const imageRoute = await import("../src/app/uploads/[...path]/route");
  const imageResponse = await imageRoute.GET(
    new Request(`http://localhost/uploads/services/${routeImageId}-1200.webp`),
    {
      params: Promise.resolve({
        path: ["services", `${routeImageId}-1200.webp`],
      }),
    },
  );
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get("content-type"), "image/webp");
  assert.equal(
    imageResponse.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );
  assert.ok((await imageResponse.arrayBuffer()).byteLength > 0);

  const rejectedResponse = await imageRoute.GET(
    new Request("http://localhost/uploads/services/image.jpg"),
    {
      params: Promise.resolve({ path: ["services", "image.jpg"] }),
    },
  );
  assert.equal(rejectedResponse.status, 404);

  const privateDataResponse = await imageRoute.GET(
    new Request("http://localhost/uploads/admin.json"),
    {
      params: Promise.resolve({ path: ["admin.json"] }),
    },
  );
  assert.equal(privateDataResponse.status, 404);
  await imageTools.deleteServiceImage(routeImageId);
  console.log(
    "PASS upload route headers, file response, allowlist, and private data denial",
  );
}

main()
  .then(async () => {
    await rm(temporaryDirectory, { recursive: true, force: true });
  })
  .catch(async (error: unknown) => {
    await rm(temporaryDirectory, { recursive: true, force: true });
    console.error(error);
    process.exitCode = 1;
  });
