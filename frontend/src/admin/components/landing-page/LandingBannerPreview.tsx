interface LandingBannerPreviewProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  categoryName?: string;
}

export function LandingBannerPreview({ title, subtitle, imageUrl, categoryName }: LandingBannerPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 text-sm text-gray-500">
            Banner image preview
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
          {categoryName && (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80 drop-shadow-sm">
              {categoryName}
            </p>
          )}
          <h3 className="max-w-[18rem] text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
            {title || 'Banner title'}
          </h3>
          {subtitle && (
            <p className="mt-2 max-w-[22rem] text-sm leading-6 text-white/90 drop-shadow-sm sm:text-base">
              {subtitle}
            </p>
          )}
          <button
            type="button"
            className="mt-5 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-900 shadow-sm"
          >
            Explore Collection
          </button>
        </div>
      </div>
    </div>
  );
}