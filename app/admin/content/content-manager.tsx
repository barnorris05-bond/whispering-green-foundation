"use client";

import { useState, useActionState } from "react";
import { upsertContent, setContentStatus, deleteContent } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog, Badge } from "@/components/ui";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABELS } from "@/lib/domain";
import { X, ExternalLink } from "lucide-react";

interface ArticleShape {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  readMinutes: number;
  status: string;
  slug: string;
}

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };
const initial: State = { ok: false };

export function ContentManager({
  mode,
  trigger,
  article,
}: {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  article?: ArticleShape;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await upsertContent(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Saved.");
      setOpen(false);
    } else if (res.error) push("error", res.error);
    return res;
  }, initial);

  async function doStatus(status: string) {
    const fd = new FormData();
    fd.set("id", article!.id);
    fd.set("status", status);
    const res = await setContentStatus({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function doDelete() {
    const fd = new FormData();
    fd.set("id", article!.id);
    const res = await deleteContent({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Deleted.");
      setOpen(false);
    } else push("error", res.error ?? "Delete failed.");
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer inline-flex">{trigger}</span>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Article editor">
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">{mode === "create" ? "New article" : "Edit article"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
            </div>

            {mode === "edit" && article && (
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-sage-200">
                <Badge tone={article.status === "published" ? "leaf" : "amber"}>{article.status}</Badge>
                {article.status !== "published" && (
                  <button onClick={() => doStatus("published")} className="btn btn-primary btn-sm">Publish</button>
                )}
                {article.status === "published" && (
                  <button onClick={() => doStatus("draft")} className="btn btn-secondary btn-sm">Unpublish</button>
                )}
                {article.status !== "archived" && (
                  <button onClick={() => doStatus("archived")} className="btn btn-secondary btn-sm">Archive</button>
                )}
                <a href={`/awareness/${article.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview public page
                </a>
              </div>
            )}

            <form action={action} className="space-y-4">
              {article && <input type="hidden" name="id" value={article.id} />}
              <div>
                <label className="label">Title *</label>
                <input name="title" required defaultValue={article?.title} className="input" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select name="category" defaultValue={article?.category ?? "waste_segregation"} className="input">
                    {CONTENT_CATEGORIES.map((c) => <option key={c} value={c}>{CONTENT_CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Reading time (minutes)</label>
                  <input type="number" name="readMinutes" min="1" max="60" defaultValue={article?.readMinutes ?? 3} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Excerpt</label>
                <textarea name="excerpt" defaultValue={article?.excerpt} className="input min-h-[3.5rem]" placeholder="1–2 sentence summary shown on cards" />
              </div>
              <div>
                <label className="label">Body * (plain text, blank line = new paragraph)</label>
                <textarea name="body" required defaultValue={article?.body} className="input min-h-[14rem] font-mono text-[0.83rem]" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <SubmitButton className="btn-sm" pendingLabel="Saving…">{mode === "create" ? "Create draft" : "Save changes"}</SubmitButton>
              </div>
            </form>

            {mode === "edit" && (
              <div className="mt-6 pt-4 border-t border-sage-200 flex items-center justify-between">
                <p className="text-xs text-charcoal-soft/70">Deleting is permanent.</p>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete article</button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this article?"
        body="This permanently removes the article from the database."
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
