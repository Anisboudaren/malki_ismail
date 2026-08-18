import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnGhost } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { LibraryUpload } from "@/app/components/dashboard/LibraryUpload";
import { LibraryWatchCard } from "@/app/components/dashboard/LibraryWatchCard";
import { syncPublitioLibrary } from "@/app/actions/library";
import { hasPublitioConfig } from "@/lib/publitio";
import { upsertPublitioVideos } from "@/lib/media-library";
import { LIBRARY_PAGE_SIZE, pageArgs, pageCount, parsePage } from "@/lib/pagination";
import { asFormAction } from "@/lib/form-action";

export default async function AdminLibraryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const storedCount = await prisma.mediaAsset.count();
  if (hasPublitioConfig() && storedCount === 0) {
    try {
      await upsertPublitioVideos();
    } catch {
      /* keep empty */
    }
  }

  const total = await prisma.mediaAsset.count();
  const { skip, take, page } = pageArgs(parsePage(searchParams.page), LIBRARY_PAGE_SIZE);
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return (
    <div>
      <PageTitle title={t(dash.nav.library, lang)} />
      {!hasPublitioConfig() ? (
        <p className="mb-6 font-body text-sm text-cream-dim">
          Ajoutez <code className="text-gold">PUBLITIO_API_TOKEN</code> dans l’environnement pour
          synchroniser et téléverser.
        </p>
      ) : null}

      <section className="mb-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-line bg-ink-card p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t(dash.admin.libraryUpload, lang)}
          </h2>
          <LibraryUpload
            label={t(dash.admin.libraryUpload, lang)}
            reusedLabel={t(dash.admin.libraryReused, lang)}
            uploadedLabel={t(dash.admin.libraryUploaded, lang)}
          />
        </div>
        <div className="rounded-2xl border border-ink-line bg-ink-card p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t(dash.admin.librarySync, lang)}
          </h2>
          <p className="mb-4 font-body text-sm text-cream-dim">
            Importe les fichiers Publitio existants. Cliquez « Lire » sur une carte pour regarder.
          </p>
          <form action={asFormAction(syncPublitioLibrary)}>
            <SaveButton
              label={t(dash.admin.librarySync, lang)}
              className={btnGhost}
              pendingLabel="Synchronisation…"
            />
          </form>
        </div>
      </section>

      {total === 0 ? (
        <EmptyState>{t(dash.admin.libraryEmpty, lang)}</EmptyState>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <LibraryWatchCard
                key={asset.id}
                title={asset.title || asset.filename}
                filename={asset.filename}
                url={asset.url}
                publitioId={asset.publitioId}
                thumbnailUrl={asset.thumbnailUrl}
              />
            ))}
          </ul>
          <Pager page={page} pageCount={pageCount(total, LIBRARY_PAGE_SIZE)} />
        </>
      )}
    </div>
  );
}
