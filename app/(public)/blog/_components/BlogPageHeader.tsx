import {splitHeadingLastWord} from '@/lib/heading-display';

export default function BlogPageHeader({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  const {lead, accent} = splitHeadingLastWord(heading, heading);

  return (
    <header className="w-full">
      <div className="container-max section-padding pb-10 pt-[60px]">
        <p className="text-right text-[10px] uppercase tracking-[0.44em] text-brand-red">
          EST. 2018 · FAYETTEVILLE, AR
        </p>
        <h1 className="mt-4 text-[clamp(72px,12vw,140px)] font-black uppercase leading-[0.9] text-charcoal">
          {lead ? (
            <>
              <span className="block">{lead}</span>
              <span className="block text-brand-red">{accent}</span>
            </>
          ) : (
            <span className="block text-brand-red">{accent}</span>
          )}
        </h1>
        <p className="mt-4 inline-block text-[11px] uppercase tracking-[0.4em] text-brand-red">
          {subheading}
        </p>
      </div>
      <div className="h-px w-full bg-brand-red" />
    </header>
  );
}
