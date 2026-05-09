import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const VALID_ROLES = ["admin", "customer"];

function normalizeRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase();

  if (value === "user") return "customer";
  if (value === "client") return "customer";
  if (value === "cliente") return "customer";

  if (VALID_ROLES.includes(value)) return value;

  return null;
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
        { error: "Rol inválido. Solo se permite admin o customer." },
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