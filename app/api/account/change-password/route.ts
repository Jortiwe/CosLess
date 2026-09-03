import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  userId?: string;
  email?: string;
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function getPasswordField(user: any) {
  if (typeof user.password === "string" && user.password) return "password";
  if (typeof user.passwordHash === "string" && user.passwordHash) return "passwordHash";
  if (typeof user.hashedPassword === "string" && user.hashedPassword) return "hashedPassword";
  return "password";
}

function getStoredPassword(user: any) {
  return (
    user.password ||
    user.passwordHash ||
    user.hashedPassword ||
    user.hash ||
    ""
  );
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cosless_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (!decoded?.email) {
      return NextResponse.json(
        { error: "Sesión inválida." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword = cleanText(body.currentPassword);
    const newPassword = cleanText(body.newPassword);
    const confirmPassword = cleanText(body.confirmPassword);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Completa todos los campos." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña y la confirmación no coinciden." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser igual a la actual." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: decoded.email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const storedPassword = getStoredPassword(user);

    if (!storedPassword) {
      return NextResponse.json(
        { error: "Esta cuenta no tiene contraseña configurada." },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      storedPassword
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      storedPassword
    );

    if (isSameAsOldPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser igual a la actual." },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const passwordField = getPasswordField(user);

    await User.updateOne(
      { email: decoded.email },
      {
        $set: {
          [passwordField]: hashedNewPassword,
        },
      },
      {
        runValidators: false,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);

    return NextResponse.json(
      {
        error: "No se pudo cambiar la contraseña.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}