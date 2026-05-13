import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import AdminUsersClient from "../../../components/admin/AdminUsersClient";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  userId?: string;
  email?: string;
  role?: string;
};

type UserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

async function getCurrentUserRole() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cosless_token")?.value;

    if (!token) return "customer";

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    await connectDB();

    if (decoded.userId) {
      const currentUser = await User.findById(decoded.userId).lean();
      return String(currentUser?.role || decoded.role || "customer");
    }

    if (decoded.email) {
      const currentUser = await User.findOne({
        email: decoded.email.toLowerCase().trim(),
      }).lean();

      return String(currentUser?.role || decoded.role || "customer");
    }

    return String(decoded.role || "customer");
  } catch {
    return "customer";
  }
}

export default async function AdminUsersPage() {
  await connectDB();

  const [rawUsers, currentRole] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    getCurrentUserRole(),
  ]);

  const users = JSON.parse(JSON.stringify(rawUsers)) as UserItem[];
  const canDeleteUsers = currentRole === "superadmin";

  return (
    <AdminUsersClient users={users} canDeleteUsers={canDeleteUsers} />
  );
}