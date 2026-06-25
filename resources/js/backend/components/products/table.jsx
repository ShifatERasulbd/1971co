import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ProductTable({
    products = [],
    colorOptions = [],
    sizeOptions = [],
    isLoading,
    deletingId,
    onAdd,
    onEdit,
    onRequestDelete,
    onSync,
    onReorder,
    isReordering,
}) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [draggingGroupKey, setDraggingGroupKey] = useState(null);
    const [dropGroupKey, setDropGroupKey] = useState(null);

    const colorLabelById = useMemo(() => {
        const map = {};
        colorOptions.forEach((color) => {
            const id = String(color?.id ?? '').trim();
            if (!id) {
                return;
            }

            map[id] = String(color?.name || id).trim();
        });
        return map;
    }, [colorOptions]);

    const sizeLabelById = useMemo(() => {
        const map = {};
        sizeOptions.forEach((size) => {
            const id = String(size?.id ?? '').trim();
            if (!id) {
                return;
            }

            map[id] = String(size?.size || id).trim();
        });
        return map;
    }, [sizeOptions]);

    const normalizeSelectionTokens = (value) => {
        if (Array.isArray(value)) {
            return value
                .map((item) => String(item ?? '').trim())
                .filter(Boolean);
        }

        const raw = String(value ?? '').trim();
        if (!raw) {
            return [];
        }

        if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('"') && raw.endsWith('"'))) {
            try {
                const parsed = JSON.parse(raw);

                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => String(item ?? '').trim())
                        .filter(Boolean);
                }

                if (typeof parsed === 'string') {
                    return parsed
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                }
            } catch {
                // Fall through to manual split.
            }
        }

        return raw
            .split(',')
            .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ''))
            .filter(Boolean);
    };

    const formatSelectionValues = (value, labelById) => {
        const values = normalizeSelectionTokens(value);

        if (values.length === 0) {
            return '-';
        }

        return values.map((item) => labelById[item] || item).join(', ');
    };

    const toPlainText = (value = '') => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const q = search.trim().toLowerCase();

    const groupProductsByName = (list = []) => list.reduce((groups, product, index) => {
        const rawName = product.name?.trim() || 'Unnamed Product';
        const lookupKey = rawName.toLowerCase() || `unnamed-${product.id ?? index}`;
        const existing = groups.find((group) => group.lookupKey === lookupKey);

        if (existing) {
            existing.items.push(product);
            return groups;
        }

        groups.push({
            key: lookupKey,
            lookupKey,
            displayName: rawName,
            items: [product],
        });

        return groups;
    }, []);

    const allGroupedProducts = useMemo(() => groupProductsByName(products), [products]);

    const groupedProducts = useMemo(() => {
        if (!q) {
            return allGroupedProducts;
        }

        return allGroupedProducts.filter((group) =>
            group.items.some((product) =>
                String(product?.name || '').toLowerCase().includes(q) ||
                String(product?.sku || '').toLowerCase().includes(q),
            ),
        );
    }, [allGroupedProducts, q]);

    const hasActiveSearch = q.length > 0;
    const canDragAndDrop = !isLoading && !isReordering && !hasActiveSearch;

    const toggleGroup = (groupKey) => {
        setExpandedGroups((previous) => ({
            ...previous,
            [groupKey]: !previous[groupKey],
        }));
    };

    const handleDragStart = (event, groupKey) => {
        if (!canDragAndDrop) {
            return;
        }

        setDraggingGroupKey(groupKey);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', groupKey);
    };

    const handleDragOver = (event, groupKey) => {
        if (!canDragAndDrop || !draggingGroupKey || draggingGroupKey === groupKey) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropGroupKey(groupKey);
    };

    const handleDragEnd = () => {
        setDraggingGroupKey(null);
        setDropGroupKey(null);
    };

    const handleDrop = async (event, targetGroupKey) => {
        event.preventDefault();

        if (!canDragAndDrop) {
            handleDragEnd();
            return;
        }

        const sourceGroupKey = draggingGroupKey || event.dataTransfer.getData('text/plain');

        if (!sourceGroupKey || sourceGroupKey === targetGroupKey) {
            handleDragEnd();
            return;
        }

        const sourceIndex = allGroupedProducts.findIndex((group) => group.key === sourceGroupKey);
        const targetIndex = allGroupedProducts.findIndex((group) => group.key === targetGroupKey);

        if (sourceIndex < 0 || targetIndex < 0) {
            handleDragEnd();
            return;
        }

        const reorderedGroups = [...allGroupedProducts];
        const [moved] = reorderedGroups.splice(sourceIndex, 1);
        reorderedGroups.splice(targetIndex, 0, moved);

        const reorderedProducts = reorderedGroups.flatMap((group) => group.items);

        try {
            await onReorder?.(reorderedProducts);
        } finally {
            handleDragEnd();
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <div className="flex w-full gap-2 md:w-auto md:justify-end">
                    <Button
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 border border-primary disabled:opacity-60"
                        onClick={onSync}
                        disabled={isLoading || isReordering}
                        type="button"
                    >
                        {isLoading ? 'Syncing...' : 'Sync Products'}
                    </Button>
                    <Button className="w-full gap-2 md:w-auto" onClick={onAdd}>
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[80px]">SL No</TableHead>
                                <TableHead className="w-[70px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Fit</TableHead>
                                <TableHead>Fabric & Care</TableHead>
                                <TableHead className="text-center">Size Chart</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && groupedProducts.length === 0 && products.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                                        No products match your search.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && hasActiveSearch && (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-10 text-center text-xs text-muted-foreground">
                                        Clear search to drag and reposition products.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading &&
                                groupedProducts.map((group, index) => {
                                    const primary = group.items[0];
                                    const hasVariants = group.items.length > 1;
                                    const isExpanded = Boolean(expandedGroups[group.key]);
                                    const additionalVariants = group.items.slice(1);

                                    return (
                                        <Fragment key={`group-${group.key}`}>
                                            <TableRow
                                                draggable={canDragAndDrop}
                                                onDragStart={(event) => handleDragStart(event, group.key)}
                                                onDragOver={(event) => handleDragOver(event, group.key)}
                                                onDrop={(event) => handleDrop(event, group.key)}
                                                onDragEnd={handleDragEnd}
                                                className={`hover:bg-muted/20 ${canDragAndDrop ? 'cursor-move' : ''} ${dropGroupKey === group.key ? 'bg-primary/10' : ''}`}
                                            >
                                                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell>
                                                    {primary.cover_image ? (
                                                        <img
                                                            src={primary.cover_image}
                                                            alt={primary.name}
                                                            className="h-10 w-10 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <span>{group.displayName}</span>
                                                        {hasVariants && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 gap-1 px-2 text-xs"
                                                                onClick={() => toggleGroup(group.key)}
                                                                type="button"
                                                                onMouseDown={(event) => event.stopPropagation()}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                )}
                                                                {isExpanded ? 'Hide variants' : `Show variants (${group.items.length})`}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{primary.sku}</TableCell>
                                                <TableCell>{formatSelectionValues(primary.color, colorLabelById)}</TableCell>
                                                <TableCell>{formatSelectionValues(primary.size, sizeLabelById)}</TableCell>
                                                <TableCell className="max-w-[180px] truncate" title={toPlainText(primary.fit || primary.long_description || '')}>
                                                    {toPlainText(primary.fit || primary.long_description || '') || '-'}
                                                </TableCell>
                                                <TableCell className="max-w-[180px] truncate" title={toPlainText(primary.fabric_and_care || primary.additional_information || '')}>
                                                    {toPlainText(primary.fabric_and_care || primary.additional_information || '') || '-'}
                                                </TableCell>
                                                <TableCell className="text-center">{primary.size_chart_image ? 'Yes' : 'No'}</TableCell>
                                                <TableCell className="text-right">{primary.stock ?? 0}</TableCell>
                                                <TableCell className="text-right">
                                                    {Number(primary.price || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                onEdit?.({
                                                                    id: primary.id,
                                                                    isGroupEdit: true,
                                                                    groupName: group.displayName,
                                                                    variants: group.items,
                                                                })
                                                            }
                                                            aria-label={`Edit ${primary.name}`}
                                                            onMouseDown={(event) => event.stopPropagation()}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                onRequestDelete?.({
                                                                    ...primary,
                                                                    deleteScope: hasVariants ? 'group' : 'single',
                                                                    groupName: group.displayName,
                                                                })
                                                            }
                                                            disabled={deletingId === primary.id}
                                                            aria-label={`Delete ${primary.name}`}
                                                            onMouseDown={(event) => event.stopPropagation()}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {hasVariants &&
                                                isExpanded &&
                                                additionalVariants.map((variant, variantIndex) => (
                                                    <TableRow
                                                        key={`variant-${group.key}-${variant.id ?? variantIndex}`}
                                                        className="bg-muted/10 hover:bg-muted/20"
                                                    >
                                                        <TableCell className="text-muted-foreground">{`${index + 1}.${variantIndex + 2}`}</TableCell>
                                                        <TableCell>
                                                            {variant.cover_image ? (
                                                                <img
                                                                    src={variant.cover_image}
                                                                    alt={variant.name}
                                                                    className="h-10 w-10 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">Variant</TableCell>
                                                        <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                                                        <TableCell>{formatSelectionValues(variant.color, colorLabelById)}</TableCell>
                                                        <TableCell>{formatSelectionValues(variant.size, sizeLabelById)}</TableCell>
                                                        <TableCell className="max-w-[180px] truncate" title={toPlainText(variant.fit || variant.long_description || '')}>
                                                            {toPlainText(variant.fit || variant.long_description || '') || '-'}
                                                        </TableCell>
                                                        <TableCell className="max-w-[180px] truncate" title={toPlainText(variant.fabric_and_care || variant.additional_information || '')}>
                                                            {toPlainText(variant.fabric_and_care || variant.additional_information || '') || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center">{variant.size_chart_image ? 'Yes' : 'No'}</TableCell>
                                                        <TableCell className="text-right">{variant.stock ?? 0}</TableCell>
                                                        <TableCell className="text-right">
                                                            {Number(variant.price || 0).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => onEdit?.(variant.id)}
                                                                    aria-label={`Edit ${variant.name}`}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() =>
                                                                        onRequestDelete?.({
                                                                            ...variant,
                                                                            deleteScope: 'single',
                                                                            groupName: group.displayName,
                                                                        })
                                                                    }
                                                                    disabled={deletingId === variant.id}
                                                                    aria-label={`Delete ${variant.name}`}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </Fragment>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    );
}
