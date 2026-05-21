import Image from 'next/image';

export default function ArticleHeroMedia({
  title,
  posterUrl,
  heroVideoUrl,
  alt,
  fallbackBg,
  noiseTexture,
}: {
  title: string;
  posterUrl: string | null;
  heroVideoUrl: string | null;
  alt: string;
  fallbackBg: string;
  noiseTexture: string;
}) {
  const hasVideo = Boolean(heroVideoUrl);
  const hasPoster = Boolean(posterUrl);
  const showNoise = !hasVideo && !hasPoster;

  return (
    <div
      className="relative min-h-[500px] w-full overflow-hidden"
      style={
        showNoise
          ? {
              backgroundColor: fallbackBg,
              backgroundImage: noiseTexture,
            }
          : undefined
      }
    >
      {hasVideo ? (
        <video
          src={heroVideoUrl!}
          poster={posterUrl ?? undefined}
          controls
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : hasPoster ? (
        <Image src={posterUrl!} alt={alt} fill className="object-cover" sizes="100vw" priority />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
