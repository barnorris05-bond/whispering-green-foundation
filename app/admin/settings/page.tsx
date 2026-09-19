import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import { PasswordForm } from "./password-form";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.foundationSettings.findFirst();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-semibold text-charcoal">Foundation settings</h2>
        <p className="text-sm text-charcoal-soft mt-1">
          These values feed the public footer and contact page. Anything left blank shows a clear placeholder publicly.
        </p>
      </div>

      <SettingsForm
        settings={{
          displayName: settings?.displayName ?? "Whispering Green Foundation",
          tagline: settings?.tagline ?? "",
          contactEmail: settings?.contactEmail ?? "",
          contactPhone: settings?.contactPhone ?? "",
          publicLocation: settings?.publicLocation ?? "",
          socialFacebook: settings?.socialFacebook ?? "",
          socialInstagram: settings?.socialInstagram ?? "",
          footerNote: settings?.footerNote ?? "",
        }}
      />

      <div className="card p-7 border-clay bg-parchment/50">
        <p className="text-sm text-charcoal-soft flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 text-bark shrink-0" />
          Leave fields blank to keep the public placeholder text. Details entered here are treated as approved public
          information for the demo.
        </p>
      </div>

      <div id="password" className="card p-7 scroll-mt-24">
        <h3 className="font-display text-lg font-semibold text-charcoal mb-1.5">Change my password</h3>
        <p className="text-sm text-charcoal-soft mb-5">Applies to your own account. Sessions on other devices stay valid.</p>
        <PasswordForm />
      </div>
    </div>
  );
}
