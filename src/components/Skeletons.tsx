export function AnimeCardSkeleton() {
  return (
    <div className="w-[140px] md:w-[160px] flex-shrink-0">
      <div className="aspect-[3/4] rounded-lg skeleton mb-2" />
      <div className="h-4 skeleton rounded mb-1 w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full aspect-[21/9] md:aspect-[21/8] rounded-xl skeleton mb-8" />
  );
}

export function AnimeCarouselSkeleton() {
  return (
    <section className="mb-8 px-4 lg:px-6">
      <div className="h-5 skeleton rounded w-32 mb-4" />
      <div className="flex gap-3 md:gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
