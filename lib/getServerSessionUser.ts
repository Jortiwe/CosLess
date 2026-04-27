import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "./mongodb";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cosless_dev_secret";

type SessionUser = {
  userId: string;
  email: string;
  role: string;
  nickname: string;
  fullName: string;
  isAdmin: boolean;
};

export async function getServerSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cosless_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as {
      email?: string;
    };

    if (!decoded?.email) return null;

    await connectDB();

    const user = await User.findOne({ email: decoded.email }).lean();

    if (!user) return null;

    return {
      userId: String(user._id),
      email: user.email || "",
      role: user.role || "user",
      nickname: user.nickname || "",
      fullName: user.fullName || "",
      isAdmin:
        user.role === "admin" ||
        user.role === "superadmin" ||
        user.role === "superadministrador",
    };
    } catch {
    return null;
  }
}