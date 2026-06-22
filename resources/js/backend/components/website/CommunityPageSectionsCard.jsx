import { GripVertical, MonitorSmartphone } from 'lucide-react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ITEM_TYPE = 'COMMUNITY_SECTION';

function SectionRow({
    section,
    index,
    selectedSectionKey,
    onEditSection,
    onReorderSection,
    onToggleSectionStatus,
    onNavigatePreview,
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
        [section.key, index],
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

                onReorderSection?.(item.key, section.key);
                item.index = index;
                item.key = section.key;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [section.key, index, onReorderSection],
    );

    drag(drop(ref));

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={0}
            onClick={() => {
                onEditSection?.(section);
                onNavigatePreview?.(section.key);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    onEditSection?.(section);
                    onNavigatePreview?.(section.key);
                }
            }}
            className={[
                'flex w-full cursor-move select-none items-center justify-between rounded-md border bg-background px-3 py-2 text-left transition-colors',
                isDragging ? 'opacity-45' : '',
                isOver
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : selectedSectionKey === section.key
                      ? 'border-primary/50 bg-muted/70'
                      : 'border-border hover:bg-muted/40',
            ].join(' ')}
        >
            <div className="min-w-0 flex items-center gap-2">
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                        {index + 1}. {section.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{section.description}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onToggleSectionStatus?.(section.key);
                }}
                className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                    section.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                }`}
            >
                {section.status}
            </button>
        </div>
    );
}

export default function CommunityPageSectionsCard({
    sections,
    selectedSectionKey,
    onEditSection,
    onReorderSection,
    onToggleSectionStatus,
    onNavigatePreview,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MonitorSmartphone className="size-4" />
                    Community Page Components
                </CardTitle>
                <CardDescription>
                    Manage Together We Grow sections and open each component in the right-side drawer.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
                {sections.map((section, index) => (
                    <SectionRow
                        key={section.key}
                        section={section}
                        index={index}
                        selectedSectionKey={selectedSectionKey}
                        onEditSection={onEditSection}
                        onReorderSection={onReorderSection}
                        onToggleSectionStatus={onToggleSectionStatus}
                        onNavigatePreview={onNavigatePreview}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
