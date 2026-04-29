import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import { createAdminToken } from "../../../../lib/auth";
import User from "../../../../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Este usuario no tiene acceso con contraseña." },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Usuario inactivo." },
        { status: 403 }
      );
    }

    const isAdmin =
      user.role === "admin" ||
      user.role === "superadmin" ||
      user.role === "superadministrador";

    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
        role: user.role,
        nickname: user.nickname,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Sesión iniciada correctamente.",
        redirectTo: isAdmin ? "/admin" : "/?session=login",
        user: {
          userId: String(user._id),
          nickname: user.nickname,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set("cosless_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (isAdmin) {
      const adminToken = await createAdminToken({
        userId: String(user._id),
        email: user.email,
        role: user.role,
      });

      response.cookies.set("cosless_admin_token", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
}