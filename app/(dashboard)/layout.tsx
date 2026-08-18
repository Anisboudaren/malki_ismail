import { requireUser } from "@/lib/require-user";
import { DocumentLocale } from "@/app/components/DocumentLocale";
import { DashboardShell } from "@/app/components/dashboard/Shell";
import { LocaleProvider } from "@/lib/LocaleProvider";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const locale = isLocale(user.locale) ? user.locale : "fr";

  return (
    <LocaleProvider locale={locale}>
      <DocumentLocale locale={locale} />
      <DashboardShell
        role={user.role}
        locale={locale}
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
      >
        {children}
      </DashboardShell>
    </LocaleProvider>
  );
}
