'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Link as LinkIcon, Heading2,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Tiptap-powered rich text editor for the ad-post form. Emits the
 * current HTML via `onChange` so callers can feed it straight into
 * the API payload as `description`.
 *
 * The toolbar is intentionally minimal — buyers scan ad copy, so we
 * expose only the formatting that reads well on card previews.
 */
export function RichTextEditor({
  value, onChange, placeholder = 'Tell buyers about your item…',
  minHeight = 180,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-brand-700 underline hover:text-brand-600' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none px-4 py-3 focus:outline-none',
          'prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-ol:my-1',
        ),
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // Keep the editor in sync when parent resets the form.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="rounded-lg border animate-pulse"
        style={{ background: 'var(--shp-bg)', borderColor: 'var(--shp-border)', minHeight: minHeight + 44 }}
      />
    );
  }

  const btn = (
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    label: string,
  ) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-md transition',
        active
          ? 'bg-[color:var(--shp-brand-soft)] text-[color:var(--shp-brand)]'
          : 'text-[color:var(--shp-fg-muted)] hover:bg-[color:var(--shp-bg)]',
      )}
    >
      {icon}
    </button>
  );

  const setLink = () => {
    const url = window.prompt('Enter URL', editor.getAttributes('link').href ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)' }}
    >
      <div
        className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
        style={{ borderColor: 'var(--shp-border)', background: 'var(--shp-surface-2)' }}
      >
        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      <Bold size={14} />,      'Bold')}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    <Italic size={14} />,    'Italic')}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    <UnderlineIcon size={14} />, 'Strike')}
        <span className="mx-1 h-5 w-px" style={{ background: 'var(--shp-border)' }} />
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={14} />, 'Heading')}
        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  <List size={14} />,       'Bullet list')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={14} />, 'Numbered list')}
        {btn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  <Quote size={14} />,      'Quote')}
        <span className="mx-1 h-5 w-px" style={{ background: 'var(--shp-border)' }} />
        {btn(editor.isActive('link'), setLink, <LinkIcon size={14} />, 'Link')}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
