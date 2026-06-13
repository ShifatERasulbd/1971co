import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading2, Undo2, Redo2 } from 'lucide-react';

export default function RichTextEditor({
    value = '',
    onChange,
    label = 'Content',
    placeholder = 'Enter content...',
    required = false,
    error = null,
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const toolbarButtonClass = 'h-8 w-8 p-0 hover:bg-muted';

    return (
        <div className="space-y-2">
            <Label>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>

            <div className="rounded-md border border-input">
                <div className="flex flex-wrap gap-1 border-b bg-muted/30 p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        title="Heading"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>

                    <div className="h-8 w-px bg-border" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Ordered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <div className="h-8 w-px bg-border" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={toolbarButtonClass}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo2 className="h-4 w-4" />
                    </Button>
                </div>

                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none p-3 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] dark:prose-invert"
                />
            </div>

            {error && <p className="text-xs text-destructive">{error[0]}</p>}
        </div>
    );
}
