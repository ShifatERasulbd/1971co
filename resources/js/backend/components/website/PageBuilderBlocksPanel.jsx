import { GripVertical, Plus } from 'lucide-react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ITEM_TYPE = 'CUSTOM_BLOCK';

const blockLabels = {
    'text-single': 'Text (Single Line)',
    'text-double': 'Text (Double Line)',
    image: 'Image',
    video: 'Video',
};

function BlockRow({ block, index, selectedBlockId, onSelectBlock, onReorder }) {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ITEM_TYPE,
        item: { id: block.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [block.id, index]);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: ITEM_TYPE,
            hover(item, monitor) {
                if (!ref.current || item.id === block.id) {
                    return;
                }

                const hoverRect = ref.current.getBoundingClientRect();
                const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
                const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2;
                const clientOffset = monitor.getClientOffset();
                if (!clientOffset) {
                    return;
                }

                const hoverClientY = clientOffset.y - hoverRect.top;
                const hoverClientX = clientOffset.x - hoverRect.left;

                const movingForward = item.index < index;
                const crossedY = movingForward
                    ? hoverClientY >= hoverMiddleY
                    : hoverClientY <= hoverMiddleY;
                const crossedX = movingForward
                    ? hoverClientX >= hoverMiddleX
                    : hoverClientX <= hoverMiddleX;

                if (!crossedY && !crossedX) {
                    return;
                }

                onReorder(item.id, block.id);
                item.index = index;
                item.id = block.id;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [block.id, index, onReorder]
    );

    drag(drop(ref));

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => onSelectBlock(block.id)}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                isOver
                    ? 'border-primary bg-primary/10'
                    : selectedBlockId === block.id
                      ? 'border-primary/50 bg-muted/70'
                      : 'border-border bg-background hover:bg-muted/40'
            } ${isDragging ? 'opacity-45' : ''}`}
        >
            <span className="inline-flex items-center gap-2 text-sm font-medium">
                <GripVertical className="size-4 text-muted-foreground" />
                {index + 1}. {blockLabels[block.type]}
            </span>
            <span className="text-xs text-muted-foreground">Drag</span>
        </button>
    );
}

export default function PageBuilderBlocksPanel({
    blocks,
    selectedBlockId,
    onSelectBlock,
    onAddBlock,
    onReorder,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Components Builder</CardTitle>
                <CardDescription>
                    Add reusable blocks, reorder by drag and drop, then style each block from the editor.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => onAddBlock('text-single')}>
                        <Plus className="mr-2 size-4" />
                        Single Text
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAddBlock('text-double')}>
                        <Plus className="mr-2 size-4" />
                        Double Text
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAddBlock('image')}>
                        <Plus className="mr-2 size-4" />
                        Image
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAddBlock('video')}>
                        <Plus className="mr-2 size-4" />
                        Video
                    </Button>
                </div>

                <div className="space-y-2">
                    {blocks.map((block, index) => (
                        <BlockRow
                            key={block.id}
                            block={block}
                            index={index}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={onSelectBlock}
                            onReorder={onReorder}
                        />
                    ))}

                    {blocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No custom blocks yet. Add a block to begin.</p>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
