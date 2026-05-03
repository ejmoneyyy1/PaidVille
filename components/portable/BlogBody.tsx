import {PortableText, type PortableTextComponents} from 'next-sanity';

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-4 text-charcoal/80 leading-relaxed">{children}</p>,
    h2: ({children}) => (
      <h2 className="font-display font-bold text-2xl md:text-3xl text-charcoal mt-10 mb-3">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="font-display font-semibold text-xl text-charcoal mt-8 mb-2">{children}</h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-2 border-brand-red pl-4 my-6 text-charcoal/75 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ol>,
  },
  marks: {
    strong: ({children}) => <strong className="font-semibold text-charcoal">{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    link: ({value, children}) => {
      const href = typeof value?.href === 'string' ? value.href : '#';
      return (
        <a href={href} className="text-brand-red underline underline-offset-2 hover:text-brand-red-dark">
          {children}
        </a>
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
