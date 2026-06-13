import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToolbarButton({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={cn(
                'rounded p-1.5 text-sm hover:bg-muted transition-colors',
                active && 'bg-muted text-foreground',
            )}
        >
            {children}
        </button>
    );
}

export function RichTextEditor({ value = '', onChange, placeholder = '', className }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        editorProps: {
            attributes: {
                class: 'min-h-[100px] px-3 py-2 text-sm focus:outline-none',
            },
        },
        onUpdate({ editor }) {
            const html = editor.getHTML();
            // Treat empty paragraph as empty string
            onChange(html === '<p></p>' ? '' : html);
        },
    });

    if (!editor) return null;

    return (
        <div className={cn('rounded-md border border-input bg-background', className)}>
            <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet list"
                >
                    <List className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Ordered list"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
            {!value && (
                <p className="pointer-events-none absolute px-3 py-2 text-sm text-muted-foreground">{placeholder}</p>
            )}
        </div>
    );
}
