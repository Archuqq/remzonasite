import { readFile, realpath } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const IMAGE_PATH_PATTERN =
  /^services\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-(?:600|1200)\.webp$/i;

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path: pathSegments } = await context.params;
  const relativePath = pathSegments.join("/");

  if (!IMAGE_PATH_PATTERN.test(relativePath)) {
    return notFound();
  }

  const uploadsDirectory = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.UPLOADS_DIR?.trim() || "./uploads",
  );

  try {
    const realUploadsDirectory = await realpath(uploadsDirectory);
    const requestedPath = path.resolve(realUploadsDirectory, ...pathSegments);
    const realImagePath = await realpath(requestedPath);
    const pathFromRoot = path.relative(realUploadsDirectory, realImagePath);

    if (
      pathFromRoot === "" ||
      pathFromRoot.startsWith(`..${path.sep}`) ||
      path.isAbsolute(pathFromRoot)
    ) {
      return notFound();
    }

    const image = await readFile(realImagePath);

    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
