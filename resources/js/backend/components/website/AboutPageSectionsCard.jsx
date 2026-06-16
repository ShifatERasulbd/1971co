import { GripVertical, MonitorSmartphone } from 'lucide-react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ITEM_TYPE = 'ABOUT_SECTION';

function SectionRow({
    section,
    index,
    selectedSectionKey,
    onSelectSection,
    onSectionActivate,
    onStatusToggle,
    onReorder,
}) {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ITEM_TYPE,
            item: { key: section.key, index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [section.key, index]
    );

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: ITEM_TYPE,
            hover(item, monitor) {
                if (!ref.current || item.key === section.key) {
                    return;
                }

                const hoverRect = ref.current.getBoundingClientRect();
                const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
                const clientOffset = monitor.getClientOffset();

                if (!clientOffset) {
                    return;
                }

                const hoverClientY = clientOffset.y - hoverRect.top;
                const movingForward = item.index < index;
                const crossedY = movingForward
                    ? hoverClientY >= hoverMiddleY
                    : hoverClientY <= hoverMiddleY;

                if (!crossedY) {
                    return;
                }

                onReorder?.(item.key, section.key);
                item.index = index;
                item.key = section.key;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [section.key, index, onReorder]
    );

    drag(drop(ref));

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={0}
            onClick={() => {
                onSelectSection?.(section.key);
                onSectionActivate?.(section);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    onSelectSection?.(section.key);
                    onSectionActivate?.(section);
                }
            }}
            className={[
                'flex w-full cursor-move select-none items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                isDragging ? 'opacity-45' : '',
                isOver
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : selectedSectionKey === section.key
                      ? 'border-primary/50 bg-muted/70'
                      : 'border-border hover:bg-muted/40',
            ].join(' ')}
        >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                        {index + 1}. {section.title}
                    </p>
                    <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                            section.status === 'active'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                        }`}
                    >
                        {section.status}
                    </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{section.description}</p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                    event.stopPropagation();
                    onStatusToggle?.(section.key);
                }}
                className="size-8 shrink-0"
                title={section.status === 'active' ? 'Hide section' : 'Show section'}
            >
                <span className="sr-only">Toggle visibility</span>
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">
                    {section.status === 'active' ? '•' : '○'}
                </span>
            </Button>
        </div>
    );
}

export default function AboutPageSectionsCard({
    sections,
    selectedSectionKey,
    onSectionSelect,
    onSectionActivate,
    onStatusToggle,
    onReorder,
}) {
    return (
        <Card className="h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MonitorSmartphone className="size-4" />
                    About Page Components
                </CardTitle>
                <CardDescription>
                    Full about page component stack available for page building and preview.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {sections.map((section, index) => (
                    <SectionRow
                        key={section.key}
                        section={section}
                        index={index}
                        selectedSectionKey={selectedSectionKey}
                        onSelectSection={onSectionSelect}
                            onSectionActivate={onSectionActivate}
                        onStatusToggle={onStatusToggle}
                        onReorder={onReorder}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
