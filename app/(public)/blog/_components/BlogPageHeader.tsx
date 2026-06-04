'use client';

import EditableField from '@/components/admin/EditableField';
import {splitHeadingLastWord} from '@/lib/heading-display';

const HOMEPAGE_DOC = 'singleton-homepage';

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
        <EditableField
          documentId={HOMEPAGE_DOC}
          field='sections[_key=="blog-1"].heading'
          label="Blog index — masthead title"
          value={heading}
          type="textarea"
          wrapperClassName="group/edit relative mt-4 block w-full"
        >
          <h1 className="text-[clamp(72px,12vw,140px)] font-black uppercase leading-[0.9] text-charcoal">
            {lead ? (
              <>
                <span className="block">{lead}</span>
                <span className="block text-brand-red">{accent}</span>
              </>
            ) : (
              <span className="block text-brand-red">{accent}</span>
            )}
          </h1>
        </EditableField>
        <EditableField
          documentId={HOMEPAGE_DOC}
          field='sections[_key=="blog-1"].subheading'
          label="Blog index — kicker line"
          value={subheading}
          type="text"
          wrapperClassName="group/edit relative mt-4 inline-block"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand-red">{subheading}</p>
        </EditableField>
      </div>
      <div className="h-px w-full bg-brand-red" />
    </header>
  );
}
