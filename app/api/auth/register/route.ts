import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cosless_dev_secret";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nickname = String(body.nickname || "").trim();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!nickname) {
      return NextResponse.json(
        { error: "Escribe tu nickname." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Escribe tu nombre completo." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Escribe tu correo." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    await connectDB();

    const emailExists = await User.findOne({ email }).lean();
    if (emailExists) {
      return NextResponse.json(
        { error: "Ese correo ya está registrado." },
        { status: 409 }
      );
    }

    const nicknameExists = await User.findOne({ nickname }).lean();
    if (nicknameExists) {
      return NextResponse.json(
        { error: "Ese nickname ya está en uso." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nickname,
      fullName,
      email,
      passwordHash,
      provider: "credentials",
      providerId: null,
      role: "user",
      isActive: true,
    });

    const token = jwt.sign(
      {
        userId: String(newUser._id),
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Cuenta creada correctamente.",
      redirectTo: "/account",
      user: {
        userId: String(newUser._id),
        nickname: newUser.nickname,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });

    response.cookies.set("cosless_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
}