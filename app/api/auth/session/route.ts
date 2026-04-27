import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cosless_dev_secret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cosless_token")?.value;

    if (!token) {
      return NextResponse.json({
        isLoggedIn: false,
        isAdmin: false,
        user: null,
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: string;
      email?: string;
      role?: string;
    };

    if (!decoded?.email) {
      return NextResponse.json({
        isLoggedIn: false,
        isAdmin: false,
        user: null,
      });
    }

    await connectDB();

    const user = await User.findOne({ email: decoded.email }).lean();

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        isAdmin: false,
        user: null,
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      isAdmin:
        user.role === "admin" ||
        user.role === "superadmin" ||
        user.role === "superadministrador",
      user: {
        userId: String(user._id),
        email: user.email,
        role: user.role,
        nickname: user.nickname || "",
        fullName: user.fullName || "",
      },
    });
  } catch {
    return NextResponse.json({
      isLoggedIn: false,
      isAdmin: false,
      user: null,
    });
  }
}