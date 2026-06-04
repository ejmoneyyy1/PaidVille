type PortableChild = {_type: 'span'; _key: string; marks: unknown[]; text: string};
type PortableBlock = {
  _type: 'block';
  _key: string;
  style: 'normal';
  markDefs: unknown[];
  children: PortableChild[];
};

function blockKey(i: number) {
  return `b-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Turn plain text (paragraphs separated by blank lines) into minimal Sanity portable text blocks. */
export function plainTextToPortableBlocks(text: string): PortableBlock[] {
  const trimmed = text.trim();
  if (!trimmed) {
    const k = blockKey(0);
    return [
      {
        _type: 'block',
        _key: k,
        style: 'normal',
        markDefs: [],
        children: [{_type: 'span', _key: `${k}-s`, marks: [], text: 'Add your story here.'}],
      },
    ];
  }
  return trimmed.split(/\n\n+/).map((para, i) => {
    const k = blockKey(i);
    return {
      _type: 'block',
      _key: k,
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: `${k}-s`, marks: [], text: para.replace(/\n/g, ' ')}],
    };
  });
}

/** Best-effort plain string for editing portable text in the admin panel. */
export function portableTextToPlain(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .filter((b): b is {_type?: string; children?: unknown} => Boolean(b && typeof b === 'object'))
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) =>
      (b.children as {_type?: string; text?: string}[])
        .filter((c) => c && c._type === 'span')
        .map((c) => c.text ?? '')
        .join(''),
    )
    .join('\n\n');
}
