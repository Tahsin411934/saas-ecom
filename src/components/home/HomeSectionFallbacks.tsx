export function HeroFallback() {
  return (
    <div className="mx-auto w-full max-w-[1290px] px-3" aria-hidden="true">
      <div className="min-h-[220px] animate-pulse rounded-xl bg-gray-100 md:aspect-[3.5/1] md:min-h-[280px] md:rounded-2xl" />
    </div>
  );
}

export function CategoryFallback() {
  return (
    <div className="w-full px-3 py-3 md:px-6" aria-hidden="true">
      <div className="mx-auto flex h-24 max-w-[1400px] animate-pulse gap-4 overflow-hidden">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex min-w-16 flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-full bg-gray-100 md:h-[72px] md:w-[72px]" />
            <div className="h-3 w-12 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignFallback() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4" aria-hidden="true">
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export function ProductsFallback() {
  return (
    <div className="space-y-7 px-3 py-4 md:px-6" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="mx-auto max-w-[1400px]">
          <div className="mb-3 h-6 w-44 animate-pulse rounded bg-gray-100" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {[0, 1, 2, 3, 4, 5].map((card) => (
              <div key={card} className="h-56 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
