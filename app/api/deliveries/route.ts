import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Delivery } from "@/models/Delivery";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (payload.role !== "repartidor") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const deliveries = await Delivery.find({
      assignedTo: payload.userId,
      status: { $in: ["pendiente", "en_ruta"] }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ deliveries }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener entregas:", error);
    return NextResponse.json(
      { message: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
