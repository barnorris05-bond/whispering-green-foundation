import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  const unread = await prisma.contactMessage.count({ where: { status: "new" } });
  const pending = await prisma.collectionRequest.count({ where: { status: { in: ["submitted", "under_review"] } } });

  return (
    <AdminShell
      user={user}
      nav={<AdminNav role={user.role} unread={unread} pending={pending} />}
      mustChangePassword={user.mustChangePassword}
    >
      {children}
    </AdminShell>
  );
}
