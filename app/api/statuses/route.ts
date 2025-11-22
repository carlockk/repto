import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { Status } from "@/models/Status";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || !payload.role) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await connectDB();
    const statuses = await Status.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({ statuses }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener estados:", error);
    return NextResponse.json(
      { message: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
