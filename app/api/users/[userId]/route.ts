import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

const VALID_ROLES = ["admin", "customer", "superadmin"];

type TokenPayload = {
  userId?: string;
  email?: string;
  role?: string;
};

function normalizeRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase();

  if (value === "user") return "customer";
  if (value === "client") return "customer";
  if (value === "cliente") return "customer";

  if (VALID_ROLES.includes(value)) return value;

  return null;
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cosless_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.userId) {
      return await User.findById(decoded.userId);
    }

    if (decoded.email) {
      return await User.findOne({
        email: decoded.email.toLowerCase().trim(),
      });
    }

    return null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const nextRole = normalizeRole(body.role);

    if (!nextRole) {
      return NextResponse.json(
        {
          error:
            "Rol inválido. Solo se permite customer, admin o superadmin.",
        },
        { status: 400 }
      );
    }

    user.fullName = String(body.fullName || "").trim();
    user.email = String(body.email || "").trim().toLowerCase();
    user.nickname = String(body.nickname || "").trim();
    user.role = nextRole;
    user.isActive = body.isActive !== false;

    await user.save();

    return NextResponse.json({
      success: true,
      user: JSON.parse(JSON.stringify(user)),
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);

    return NextResponse.json(
      {
        error: "No se pudo actualizar el usuario.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Solo un superadmin puede eliminar usuarios." },
        { status: 403 }
      );
    }

    if (String(currentUser._id) === String(userId)) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario." },
        { status: 400 }
      );
    }

    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);

    return NextResponse.json(
      {
        error: "No se pudo eliminar el usuario.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}