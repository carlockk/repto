import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Delivery } from "@/models/Delivery";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { isValidRutOrDni } from "@/lib/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (payload.role !== "repartidor") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const receiverName = formData.get("receiverName") as string | null;
    const receiverDocument = formData.get("receiverDocument") as string | null;
    const file = formData.get("file") as File | null;
    const observation = formData.get("observation") as string | null;

    if (!receiverName || !receiverDocument) {
      return NextResponse.json(
        { message: "Faltan datos para registrar la entrega" },
        { status: 400 }
      );
    }

    if (!file && !(observation && observation.toString().trim().length > 0)) {
      return NextResponse.json(
        { message: "Sube una foto o deja una observación para completar" },
        { status: 400 }
      );
    }

    if (!isValidRutOrDni(receiverDocument)) {
      return NextResponse.json(
        { message: "Formato de RUT/DNI invÃ¡lido" },
        { status: 400 }
      );
    }

    const delivery = await Delivery.findOne({
      _id: id,
      assignedTo: payload.userId
    });

    if (!delivery) {
      return NextResponse.json(
        { message: "Entrega no encontrada" },
        { status: 404 }
      );
    }

    // Subir imagen a Cloudinary (eliminando la previa si existe)
    let uploadResult: any = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if ((delivery as any).proofPhotoId) {
        try {
          await cloudinary.uploader.destroy((delivery as any).proofPhotoId as string);
        } catch (err) {
          console.warn("No se pudo eliminar la foto previa en Cloudinary", err);
        }
      }

      uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "repto-entregas",
              resource_type: "image"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });
    }

    if (uploadResult) {
      (delivery as any).proofPhotoUrl = uploadResult.secure_url;
      (delivery as any).proofPhotoId = uploadResult.public_id;
      delivery.status = "entregado";
      delivery.deliveredAt = new Date();
    }
    delivery.receiverName = receiverName;
    delivery.receiverDocument = receiverDocument;
    if (observation && observation.toString().trim().length > 0) {
      (delivery as any).observation = observation.toString().trim();
    }
    await delivery.save();

    // TODO: aquÃ­ puedes llamar a tu backend de "seguimiento"
    // para actualizar el estado de la orden usando delivery.orderId o trackingCode.

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error al completar entrega:", error);
    return NextResponse.json(
      { message: "Error interno al completar entrega" },
      { status: 500 }
    );
  }
}
