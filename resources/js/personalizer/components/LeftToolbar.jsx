import {
    ImagePlus,
    RotateCcw,
    RotateCw,
    Shapes,
    Type,
    Upload,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const TOOL_ITEMS = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'images', label: 'Images', icon: ImagePlus },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'undo', label: 'Undo', icon: RotateCcw, action: true },
    { id: 'redo', label: 'Redo', icon: RotateCw, action: true },
];

function ToolbarButton({ active, icon: Icon, label, onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'group flex min-w-[58px] flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-[11px] font-medium transition-colors',
                active
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
                disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-label={label}
        >
            <Icon className="size-4" />
            <span>{label}</span>
        </button>
    );
}

export default function LeftToolbar({ activeTool, canUndo, canRedo, onSelectTool }) {
    return (
        <aside className="rounded-[28px] border border-zinc-200 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:h-fit">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-1">
                {TOOL_ITEMS.map((tool) => (
                    <ToolbarButton
                        key={tool.id}
                        icon={tool.icon}
                        label={tool.label}
                        active={activeTool === tool.id && !tool.action}
                        disabled={(tool.id === 'undo' && !canUndo) || (tool.id === 'redo' && !canRedo)}
                        onClick={() => onSelectTool(tool.id)}
                    />
                ))}
            </div>
        </aside>
    );
}
