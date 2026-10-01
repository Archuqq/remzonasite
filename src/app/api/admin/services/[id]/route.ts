import { NextResponse } from "next/server";
import {
  deleteServiceImage,
  saveServiceImage,
  ServiceImageError,
} from "@/lib/images";
import {
  guardAdminMutation,
  guardAdminRead,
  jsonError,
  parseServiceFormData,
  readOptionalImageBuffer,
} from "@/lib/admin-services";
import { revalidatePublicServices, serializeService } from "@/lib/services";
import {
  deleteServiceById,
  getServiceById,
  updateService,
} from "@/lib/service-store";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await guardAdminRead();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const service = await getServiceById(id);
  if (!service) {
    return jsonError(404, "Услуга не найдена.");
  }

  return NextResponse.json({ service: serializeService(service) });
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const existing = await getServiceById(id);
  if (!existing) {
    return jsonError(404, "Услуга не найдена.");
  }

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

  let newImageId: string | null = null;
  let serviceCommitted = false;
  try {
    if (imageBuffer.buffer) {
      newImageId = await saveServiceImage(imageBuffer.buffer);
    }

    const result = await updateService(id, parsed.data, newImageId);
    if (!result.service) {
      if (newImageId) await deleteServiceImage(newImageId);
      return jsonError(404, "Услуга не найдена.");
    }
    serviceCommitted = true;

    revalidatePublicServices();

    if (newImageId && result.previousImage) {
      try {
        await deleteServiceImage(result.previousImage);
      } catch (cleanupError) {
        console.error("Не удалось удалить старое фото услуги.", cleanupError);
      }
    }

    return NextResponse.json({ service: serializeService(result.service) });
  } catch (error) {
    if (newImageId && !serviceCommitted) {
      await deleteServiceImage(newImageId);
    }

    if (error instanceof ServiceImageError) {
      return jsonError(400, error.message, { image: error.message });
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const existing = await deleteServiceById(id);
  if (!existing) {
    return jsonError(404, "Услуга не найдена.");
  }

  if (existing.image) {
    try {
      await deleteServiceImage(existing.image);
    } catch (cleanupError) {
      console.error("Не удалось удалить фото удалённой услуги.", cleanupError);
    }
  }

  revalidatePublicServices();
  return NextResponse.json({ ok: true });
}
