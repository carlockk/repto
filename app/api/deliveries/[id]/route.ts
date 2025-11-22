import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Delivery } from "@/models/Delivery";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
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

    return NextResponse.json({ delivery }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener entrega:", error);
    return NextResponse.json(
      { message: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
