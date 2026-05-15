import Image from "next/image";

type SectionHeroProps = {
  title: string;
  subtitle?: string | null;
  imageUrl: string | null;
  edgeToEdge?: boolean;
};

export function SectionHero({ title, subtitle, imageUrl, edgeToEdge = false }: SectionHeroProps) {
  const wrapperClass = edgeToEdge
    ? "relative min-h-[300px] overflow-hidden bg-[#0f4f87] text-white md:min-h-[360px]"
    : "relative min-h-[300px] overflow-hidden rounded-3xl border border-[#bbd1e5] bg-[#0f4f87] text-white shadow-xl md:min-h-[360px]";

  return (
    <section className={wrapperClass}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-[#07213b]/85 via-[#0d3257]/70 to-[#0f4f87]/55" />

      <div className="relative z-10 flex min-h-[300px] items-end p-6 md:min-h-[360px] md:p-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
}