import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui";
import { Mail, Archive, Trash2, MailOpen } from "lucide-react";
import { MessageActions } from "./message-actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Messages</h2>
          <p className="text-sm text-charcoal-soft mt-1">{unread} unread of {messages.length} total</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-5 h-5" />}
          title="No messages"
          hint="Contact form submissions arrive here."
        />
      ) : (
        <div className="grid gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`card p-5 ${m.status === "new" ? "border-l-4 border-l-leaf-500" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-charcoal ${m.status === "new" ? "font-semibold" : "font-medium"}`}>{m.subject}</h3>
                    <Badge tone={m.status === "new" ? "blue" : m.status === "read" ? "gray" : "demo"}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-charcoal-soft/80 mt-1">
                    {m.name} · {m.email ?? "no email"}{m.phone ? ` · ${m.phone}` : ""} · {formatDateTime(m.createdAt)}
                  </p>
                  <p className="text-sm text-charcoal-soft mt-3 leading-relaxed whitespace-pre-line max-w-3xl">{m.message}</p>
                </div>
                <MessageActions id={m.id} status={m.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
