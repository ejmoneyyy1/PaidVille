import {PortableText, type PortableTextComponents} from 'next-sanity';
import Image from 'next/image';
import {urlFor} from '@/lib/sanity';

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-6 text-charcoal">{children}</p>,
    h2: ({children}) => (
      <h2 className="my-12 border-l-4 border-brand-red pl-4 text-[28px] font-extrabold text-charcoal">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="my-9 text-[22px] font-bold text-charcoal">{children}</h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="my-10 border-l-4 border-brand-red bg-[#F0EDE8] px-8 py-6 text-[22px] italic text-charcoal">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ol>,
  },
  marks: {
    strong: ({children}) => <strong className="font-bold text-charcoal">{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    link: ({value, children}) => {
      const href = typeof value?.href === 'string' ? value.href : '#';
      return (
        <a href={href} className="text-brand-red no-underline hover:underline" target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({value}) => {
      if (!value?.asset?._ref) return null;
      const src = urlFor(value).width(1400).quality(90).url();
      return (
        <figure className="my-10">
          <Image
            src={src}
            alt={value.alt ?? 'Article image'}
            width={1400}
            height={900}
            className="h-auto w-full"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </figure>
      );
    },
  },
};

export default function BlogBody({value}: {value: unknown}) {
  if (!value || !Array.isArray(value)) {
    return null;
  }
  return (
    <div className="prose-custom">
      <PortableText value={value} components={components} />
    </div>
  );
}
