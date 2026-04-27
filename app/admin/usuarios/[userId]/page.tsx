import { notFound } from "next/navigation";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import AdminBackButton from "../../../../components/admin/AdminBackButton";
import UserEditForm from "../../../../components/admin/UserEditForm";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  await connectDB();

  const rawUser = await User.findById(userId).lean();

  if (!rawUser) notFound();

  const user = JSON.parse(JSON.stringify(rawUser));

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Editar usuario</h1>
            <p className="mt-2 text-[#4b6b80]">
              Revisa y modifica datos del usuario.
            </p>
          </div>

          <AdminBackButton href="/admin/usuarios" label="Volver a usuarios" />
        </div>

        <UserEditForm user={user} />
      </div>
    </main>
  );
}