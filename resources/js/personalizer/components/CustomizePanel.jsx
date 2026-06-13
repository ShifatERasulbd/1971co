import { useState } from 'react';

import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    BringToFront,
    ChevronDown,
    ChevronRight,
    Check,
    Circle as CircleIcon,
    Download,
    Images,
    Italic,
    SendToBack,
    ShoppingCart,
    Star as StarIcon,
    Square,
    Triangle as TriangleIcon,
    Trash2,
    Type,
    Underline,
    Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PIXELS_PER_INCH = 96;
const CM_PER_INCH = 2.54;

function toUnitFromPx(valuePx, unit) {
    const numeric = Number(valuePx || 0);
    if (unit === 'in') return numeric / PIXELS_PER_INCH;
    if (unit === 'cm') return (numeric / PIXELS_PER_INCH) * CM_PER_INCH;
    return numeric;
}

function fromUnitToPx(value, unit) {
    const numeric = Number(value || 0);
    if (unit === 'in') return numeric * PIXELS_PER_INCH;
    if (unit === 'cm') return (numeric / CM_PER_INCH) * PIXELS_PER_INCH;
    return numeric;
}

export default function CustomizePanel({
    activeTool,
    selectedColor,
    productColors,
    productColor,
    onSelectProductColor,
    onOpenUpload,
    uploadedDesigns,
    selectedDesignId,
    usedDesignIds = new Set(),
    onClearUploadedDesigns,
    onUseUploadedDesign,
    onRemoveUploadedDesign,
    draftText,
    onDraftTextChange,
    draftFontFamily,
    onDraftFontFamilyChange,
    draftFontSize,
    onDraftFontSizeChange,
    draftTextColor,
    onDraftTextColorChange,
    draftShapeColor,
    onDraftShapeColorChange,
    onAddText,
    fontOptions,
    activeImageLayers,
    activeTextLayers,
    activeShapeLayers,
    selectedObjectId,
    onSelectObject,
    onUpdateImageLayer,
    onUpdateTextLayer,
    onUpdateShapeLayer,
    onAddShape,
    onBringForward,
    onSendBackward,
    onDeleteSelected,
    orderQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onDownload,
    onPreviewMockups,
    onOrderNow,
    isSaving,
    savedUrl,
}) {
    const [imageSizeUnit, setImageSizeUnit] = useState('px');
    const [collapsedSections, setCollapsedSections] = useState({
        productColor: false,
        images: false,
        text: false,
        shapes: false,
        arrange: false,
        checkout: false,
    });

    const imageSizeUnitLabel = imageSizeUnit === 'in' ? 'in' : imageSizeUnit === 'cm' ? 'cm' : 'px';
    const isCollapsed = (section) => collapsedSections[section] === true;
    const selectedShapeLayer = activeShapeLayers.find((layer) => layer.id === selectedObjectId) || null;
    const selectedTextLayer = activeTextLayers.find((layer) => layer.id === selectedObjectId) || null;

    const toggleSection = (section) => {
        setCollapsedSections((previous) => ({
            ...previous,
            [section]: !previous[section],
        }));
    };

    return (
        <section className="rounded-[32px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Customize your sweatshirt</h1>
                    <p className="mt-1 text-sm text-zinc-500">Create something timeless.</p>
                </div>

                <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'upload' && 'border-zinc-950 bg-zinc-50')}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Product color</Label>
                            <p className="mt-1 text-xs text-zinc-500">Selected: {selectedColor?.label}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('productColor')}>
                            {isCollapsed('productColor') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                    {!isCollapsed('productColor') && (
                        <div className="flex flex-wrap gap-3">
                            {productColors.map((color) => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => onSelectProductColor(color.id)}
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-105',
                                        color.id === 'white' ? 'border-zinc-300' : 'border-transparent',
                                        productColor === color.id && 'ring-2 ring-zinc-950 ring-offset-2'
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    aria-label={color.label}
                                >
                                    {productColor === color.id && (
                                        <Check className={cn('size-4', color.id === 'white' ? 'text-zinc-950' : 'text-white')} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'images' && 'border-zinc-950 bg-zinc-50')}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Add your design</Label>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('images')}>
                            {isCollapsed('images') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                    {!isCollapsed('images') && (
                        <>
                            <Button type="button" className="w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={onOpenUpload}>
                                <Upload className="size-4" />
                                Upload image or logo
                            </Button>
                            <p className="text-xs text-zinc-500">JPG, PNG, SVG up to 10MB</p>

                            {uploadedDesigns.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Images</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={onClearUploadedDesigns}>
                                    Clear
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {uploadedDesigns.map((design) => (
                                    <div
                                        key={design.id}
                                        className={cn('flex items-center gap-3 rounded-2xl border p-2', selectedDesignId === design.id && 'border-zinc-950 bg-white')}
                                        draggable
                                        onDragStart={(event) => {
                                            event.dataTransfer.effectAllowed = 'copy';
                                            event.dataTransfer.setData('application/x-personalizer-design', JSON.stringify({
                                                id: design.id,
                                                name: design.name,
                                                url: design.url,
                                            }));
                                        }}
                                    >
                                        <img src={design.url} alt={design.name} className="h-14 w-14 rounded-xl object-cover" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{design.name}</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => onUseUploadedDesign(design)}>
                                            Use
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemoveUploadedDesign(design.id)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                            )}

                            {activeImageLayers.length > 0 && (
                        <div className="space-y-3 border-t border-zinc-200 pt-3">
                            <div className="flex items-center justify-between gap-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Image layer settings</Label>
                                <div className="inline-flex items-center rounded-xl border border-zinc-200 bg-white p-1">
                                    {['px', 'in', 'cm'].map((unit) => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => setImageSizeUnit(unit)}
                                            className={cn(
                                                'rounded-lg px-2.5 py-1 text-xs font-medium uppercase transition-colors',
                                                imageSizeUnit === unit
                                                    ? 'bg-zinc-950 text-white'
                                                    : 'text-zinc-600 hover:bg-zinc-100'
                                            )}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeImageLayers.map((layer) => (
                                <div
                                    key={layer.id}
                                    className={cn(
                                        'space-y-3 rounded-2xl border bg-white p-3 transition-colors',
                                        selectedObjectId === layer.id && 'border-zinc-950 shadow-sm'
                                    )}
                                    onClick={() => onSelectObject(layer.id)}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-semibold text-zinc-800">{layer.label}</p>
                                        <Button type="button" variant="outline" size="sm" onClick={() => onSelectObject(layer.id)}>
                                            Select
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Width ({imageSizeUnitLabel})</Label>
                                            <Input
                                                type="number"
                                                min={20}
                                                value={Number(toUnitFromPx(layer.width, imageSizeUnit).toFixed(2))}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { width: fromUnitToPx(Number(event.target.value || 0), imageSizeUnit) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Height ({imageSizeUnitLabel})</Label>
                                            <Input
                                                type="number"
                                                min={20}
                                                value={Number(toUnitFromPx(layer.height, imageSizeUnit).toFixed(2))}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { height: fromUnitToPx(Number(event.target.value || 0), imageSizeUnit) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Rotate (deg)</Label>
                                            <Input
                                                type="number"
                                                value={layer.angle}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { angle: Number(event.target.value || 0) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Scale (%)</Label>
                                            <Input
                                                type="number"
                                                min={5}
                                                max={500}
                                                value={layer.scalePercent}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { scalePercent: Number(event.target.value || 100) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Position left (%)</Label>
                                            <Input
                                                type="number"
                                                value={layer.leftPercent}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { leftPercent: Number(event.target.value || 0) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Position top (%)</Label>
                                            <Input
                                                type="number"
                                                value={layer.topPercent}
                                                onFocus={() => onSelectObject(layer.id)}
                                                onChange={(event) => onUpdateImageLayer(layer.id, { topPercent: Number(event.target.value || 0) })}
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                            )}
                        </>
                    )}
                </div>

                <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'text' && 'border-zinc-950 bg-zinc-50')}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Add text</Label>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('text')}>
                            {isCollapsed('text') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>

                    {!isCollapsed('text') && (
                        <>
                    <div className="space-y-3 rounded-2xl bg-zinc-50 p-3">
                        <Input
                            value={draftText}
                            onChange={(event) => onDraftTextChange(event.target.value)}
                            placeholder="Write something bold"
                            className="h-11 rounded-xl bg-white"
                        />
                        <div className="grid grid-cols-[minmax(0,1fr)_90px_52px] gap-2">
                            <Select value={draftFontFamily} onValueChange={onDraftFontFamilyChange}>
                                <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                    <SelectValue placeholder="Font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontOptions.map((font) => (
                                        <SelectItem key={font} value={font}>{font}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                min={6}
                                max={320}
                                value={draftFontSize}
                                onChange={(event) => onDraftFontSizeChange(Number(event.target.value || 24))}
                                className="h-11 rounded-xl bg-white text-center"
                            />
                            <Input
                                type="color"
                                value={draftTextColor}
                                onChange={(event) => onDraftTextColorChange(event.target.value)}
                                className="h-11 rounded-xl bg-white p-1"
                            />
                        </div>
                        <Button type="button" className="w-full rounded-xl" onClick={onAddText} disabled={!draftText.trim()}>
                            <Type className="size-4" />
                            Add text layer
                        </Button>

                        <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
                            <div className="flex items-center justify-between gap-2">
                                <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Text curve</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={selectedTextLayer?.curveEnabled ? 'default' : 'outline'}
                                    disabled={!selectedTextLayer}
                                    onClick={() => {
                                        if (!selectedTextLayer) return;

                                        onUpdateTextLayer(selectedTextLayer.id, {
                                            curveEnabled: !selectedTextLayer.curveEnabled,
                                            curveAmount: selectedTextLayer.curveEnabled
                                                ? 0
                                                : (selectedTextLayer.curveAmount || 26),
                                        });
                                    }}
                                >
                                    {selectedTextLayer
                                        ? (selectedTextLayer.curveEnabled ? 'Curved On' : 'Curved Off')
                                        : 'Select text'}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                {selectedTextLayer
                                    ? 'Use selector handles: left/right changes curve, corners and top/bottom resize text.'
                                    : 'Select a text layer from canvas or the list below, then enable curved text.'}
                            </p>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <span>Text size</span>
                                    <span>{selectedTextLayer?.fontSize || draftFontSize}</span>
                                </div>
                                <Input
                                    type="range"
                                    min={6}
                                    max={320}
                                    step={1}
                                    value={selectedTextLayer?.fontSize || draftFontSize}
                                    disabled={!selectedTextLayer}
                                    onChange={(event) => {
                                        if (!selectedTextLayer) return;

                                        onUpdateTextLayer(selectedTextLayer.id, {
                                            fontSize: Number(event.target.value || 24),
                                        });
                                    }}
                                    className="h-8"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <span>Curve intensity</span>
                                    <span>{selectedTextLayer?.curveAmount || 0}</span>
                                </div>
                                <Input
                                    type="range"
                                    min={-160}
                                    max={160}
                                    step={1}
                                    value={selectedTextLayer?.curveAmount || 0}
                                    disabled={!selectedTextLayer || !selectedTextLayer.curveEnabled}
                                    onChange={(event) => {
                                        if (!selectedTextLayer) return;

                                        onUpdateTextLayer(selectedTextLayer.id, {
                                            curveAmount: Number(event.target.value || 0),
                                            curveEnabled: true,
                                        });
                                    }}
                                    className="h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {activeTextLayers.length > 0 && (
                        <div className="space-y-3">
                            {activeTextLayers.map((layer) => (
                                <div
                                    key={layer.id}
                                    className={cn(
                                        'space-y-3 rounded-2xl border bg-white p-3 transition-colors',
                                        selectedObjectId === layer.id && 'border-zinc-950 shadow-sm'
                                    )}
                                    onClick={() => onSelectObject(layer.id)}
                                >
                                    <Input
                                        value={layer.text}
                                        onFocus={() => onSelectObject(layer.id)}
                                        onChange={(event) => onUpdateTextLayer(layer.id, { text: event.target.value }, false)}
                                        onBlur={(event) => onUpdateTextLayer(layer.id, { text: event.target.value })}
                                        className="h-10 rounded-xl"
                                    />
                                    <div className="grid grid-cols-[minmax(0,1fr)_80px_52px] gap-2">
                                        <Select value={layer.fontFamily} onValueChange={(value) => onUpdateTextLayer(layer.id, { fontFamily: value })}>
                                            <SelectTrigger className="h-10 w-full rounded-xl">
                                                <SelectValue placeholder="Font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontOptions.map((font) => (
                                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            min={6}
                                            max={320}
                                            value={layer.fontSize}
                                            onFocus={() => onSelectObject(layer.id)}
                                            onChange={(event) => onUpdateTextLayer(layer.id, { fontSize: Number(event.target.value || 24) })}
                                            className="h-10 rounded-xl text-center"
                                        />
                                        <Input
                                            type="color"
                                            value={layer.fill}
                                            onFocus={() => onSelectObject(layer.id)}
                                            onChange={(event) => onUpdateTextLayer(layer.id, { fill: event.target.value })}
                                            className="h-10 rounded-xl p-1"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={layer.fontWeight === '700' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { fontWeight: layer.fontWeight === '700' ? '400' : '700' })}
                                        >
                                            <Bold className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.fontStyle === 'italic' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                        >
                                            <Italic className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.underline ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { underline: !layer.underline })}
                                        >
                                            <Underline className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'left' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'left' })}
                                        >
                                            <AlignLeft className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'center' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'center' })}
                                        >
                                            <AlignCenter className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'right' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'right' })}
                                        >
                                            <AlignRight className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                        </>
                    )}
                </div>

                <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'shapes' && 'border-zinc-950 bg-zinc-50')}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Shapes</Label>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('shapes')}>
                            {isCollapsed('shapes') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                    {!isCollapsed('shapes') && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('rect')}>
                                    <Square className="size-4" />
                                    Rectangle
                                </Button>
                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('circle')}>
                                    <CircleIcon className="size-4" />
                                    Circle
                                </Button>
                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('triangle')}>
                                    <TriangleIcon className="size-4" />
                                    Triangle
                                </Button>
                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('star')}>
                                    <StarIcon className="size-4" />
                                    Star
                                </Button>
                            </div>

                            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="shape-color" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                        Shape color
                                    </Label>
                                    <Input
                                        id="shape-color"
                                        type="color"
                                        value={draftShapeColor}
                                        onChange={(event) => onDraftShapeColorChange(event.target.value)}
                                        className="h-10 w-14 rounded-xl bg-white p-1"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {selectedShapeLayer
                                        ? `Editing ${selectedShapeLayer.label}`
                                        : 'Choose a color, then add a shape or select an existing shape to recolor it.'}
                                </p>
                                {selectedShapeLayer && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateShapeLayer(selectedShapeLayer.id, { fill: draftShapeColor })}
                                    >
                                        Apply to selected shape
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 rounded-3xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Arrange</Label>
                            <p className="mt-1 text-xs text-zinc-500">Drag and drop on the canvas, then refine the stack here.</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('arrange')}>
                            {isCollapsed('arrange') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                    {!isCollapsed('arrange') && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onBringForward}>
                                <BringToFront className="size-4" />
                                Bring forward
                            </Button>
                            <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onSendBackward}>
                                <SendToBack className="size-4" />
                                Send backward
                            </Button>
                            <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onDeleteSelected}>
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Label className="text-sm font-semibold text-zinc-800">Checkout</Label>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleSection('checkout')}>
                            {isCollapsed('checkout') ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                    {!isCollapsed('checkout') && (
                        <>
                    <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
                        <Label htmlFor="order-quantity" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Quantity</Label>
                        <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-zinc-300 bg-white">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-full rounded-none px-3"
                                onClick={onDecreaseQuantity}
                                aria-label="Decrease quantity"
                            >
                                -
                            </Button>
                            <Input
                                id="order-quantity"
                                type="text"
                                readOnly
                                value={orderQuantity}
                                className="h-full w-14 rounded-none border-0 bg-transparent p-0 text-center text-base font-semibold focus-visible:ring-0"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-full rounded-none px-3"
                                onClick={onIncreaseQuantity}
                                aria-label="Increase quantity"
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    <Button type="button" variant="outline" className="h-12 w-full rounded-2xl" onClick={onPreviewMockups} disabled={isSaving}>
                        <Images className="size-4" />
                        Preview mockups
                    </Button>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                        <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={onDownload}>
                            <Download className="size-4" />
                            Download design
                        </Button>
                        <Button type="button" className="h-12 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={onOrderNow} disabled={isSaving}>
                            <ShoppingCart className="size-4" />
                            <span className="truncate">Order now</span>
                        </Button>
                    </div>
                    <p className="text-center text-xs text-zinc-500">Secure checkout. Free returns.</p>
                    {savedUrl && (
                        <a href={savedUrl} target="_blank" rel="noreferrer" className="block text-center text-sm font-medium text-zinc-700 underline-offset-4 hover:underline">
                            View last saved design image
                        </a>
                    )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
