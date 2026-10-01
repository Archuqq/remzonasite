import { NextResponse } from "next/server";
import {
  ServiceImageError,
  deleteServiceImage,
  saveServiceImage,
} from "@/lib/images";
import {
  guardAdminMutation,
  guardAdminRead,
  jsonError,
  parseServiceFormData,
  readOptionalImageBuffer,
} from "@/lib/admin-services";
import { revalidatePublicServices, serializeService } from "@/lib/services";
import { createService, getAllServices } from "@/lib/service-store";

export const runtime = "nodejs";

export async function GET() {
  const auth = await guardAdminRead();
  if (!auth.ok) return auth.response;

  const services = await getAllServices();

  return NextResponse.json({
    services: services.map(serializeService),
  });
}

export async function POST(request: Request) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "Некорректный запрос.");
  }

  const parsed = parseServiceFormData(formData);
  if (!parsed.success) return parsed.response;

  const imageBuffer = await readOptionalImageBuffer(parsed.file);
  if (!imageBuffer.ok) return imageBuffer.response;

  let imageId = "";
  let serviceCommitted = false;
  try {
    if (imageBuffer.buffer) {
      imageId = await saveServiceImage(imageBuffer.buffer);
    }

    const service = await createService(parsed.data, imageId);
    serviceCommitted = true;

    revalidatePublicServices();
    return NextResponse.json(
      { service: serializeService(service) },
      { status: 201 },
    );
  } catch (error) {
    if (imageId && !serviceCommitted) {
      await deleteServiceImage(imageId);
    }

    if (error instanceof ServiceImageError) {
      return jsonError(400, error.message, { image: error.message });
    }

    throw error;
  }
}
