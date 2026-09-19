import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui";
import { UserCog, UserPlus } from "lucide-react";
import { StaffManager } from "./staff-manager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Staff accounts</h2>
          <p className="text-sm text-charcoal-soft mt-1">Founder-only. Disabled accounts cannot sign in and lose active sessions.</p>
        </div>
        <StaffManager mode="create" trigger={<span className="btn btn-primary btn-sm"><UserPlus className="w-4 h-4" /> Add staff</span>} />
      </div>

      {users.length === 0 ? (
        <EmptyState icon={<UserCog className="w-5 h-5" />} title="No accounts" />
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="card p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-charcoal">{u.name}</h3>
                  <Badge tone={u.role === "founder" ? "leaf" : "blue"}>{u.role}</Badge>
                  {!u.isActive && <Badge tone="red">disabled</Badge>}
                  {u.mustChangePassword && <Badge tone="amber">must change password</Badge>}
                </div>
                <p className="text-xs text-charcoal-soft mt-1">{u.email} · joined {formatDate(u.createdAt)}</p>
              </div>
              {me?.id !== u.id && u.role !== "founder" && (
                <StaffManager
                  mode="manage"
                  trigger={<span className="btn btn-secondary btn-sm">Manage</span>}
                  user={{ id: u.id, name: u.name, isActive: u.isActive }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
