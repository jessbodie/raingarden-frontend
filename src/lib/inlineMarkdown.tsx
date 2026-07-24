import { Fragment, type ReactNode } from 'react';

// Minimal inline Markdown for advisor chat prose: **bold** and *italic*.
// The model wraps its questions/emphasis in these markers; it does not emit
// block-level Markdown (lists/headings) in the conversation, so this stays
// deliberately small and dependency-free. Line breaks are preserved by the
// container's `white-space: pre-wrap`, not here.
//
// Bold is matched before italic in the alternation so `**x**` is consumed by
// the bold branch rather than the single-asterisk one. Both are non-greedy and
// require a matching closer, so a stray lone `*` is left as a literal.
const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*/g;

export function renderInlineMarkdown(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return <Fragment>{nodes}</Fragment>;
}
