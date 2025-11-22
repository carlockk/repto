import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { identifier, email, username, password } = await req.json();

    const loginId = (identifier || email || username || "").trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { message: "Usuario/email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    if (user.active === false) {
      return NextResponse.json(
        { message: "Usuario inactivo" },
        { status: 403 }
      );
    }

    const hashed = user.passwordHash || user.password || "";
    const isValid = hashed ? await bcrypt.compare(password, hashed) : false;
    if (!isValid) {
      return NextResponse.json(
        { message: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    if (user.role !== "repartidor") {
      return NextResponse.json(
        { message: "Este módulo es solo para repartidores" },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      username: user.username || "",
      email: user.email || "",
    });

    const res = NextResponse.json({ token }, { status: 200 });
    res.cookies.set("repto_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { message: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
