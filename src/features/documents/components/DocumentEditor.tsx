'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  editable?: boolean;
}

function ToolbarButton({ onClick, active, children, editable = true }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(active && 'bg-accent')}
      disabled={!editable}
    >
      {children}
    </Button>
  );
}

interface DocumentEditorProps {
  content: Record<string, unknown> | null;
  onChange: (content: Record<string, unknown>) => void;
  editable?: boolean;
  placeholder?: string;
}

export function DocumentEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing...',
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
    ],
    content: (content as unknown as string) || '',
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-2',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && (
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px bg-border mx-1" />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor.isActive('link')}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px bg-border mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
