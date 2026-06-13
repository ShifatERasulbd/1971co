import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';

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
    isLoading,
    deletingId,
    onAdd,
    onEdit,
    onRequestDelete,
    onSync,
}) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

    const filtered = products.filter((product) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            product.name?.toLowerCase().includes(q) ||
            product.sku?.toLowerCase().includes(q)
        );
    });

    const groupedProducts = filtered.reduce((groups, product, index) => {
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

    const toggleGroup = (groupKey) => {
        setExpandedGroups((previous) => ({
            ...previous,
            [groupKey]: !previous[groupKey],
        }));
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
                        disabled={isLoading}
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
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && groupedProducts.length === 0 && products.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No products match your search.
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
                                            <TableRow className="hover:bg-muted/20">
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
                                                        <span>{group.displayName}</span>
                                                        {hasVariants && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 gap-1 px-2 text-xs"
                                                                onClick={() => toggleGroup(group.key)}
                                                                type="button"
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
                                                <TableCell>{primary.color || '-'}</TableCell>
                                                <TableCell>{primary.size || '-'}</TableCell>
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
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => onRequestDelete?.(primary)}
                                                            disabled={deletingId === primary.id}
                                                            aria-label={`Delete ${primary.name}`}
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
                                                        <TableCell>{variant.color || '-'}</TableCell>
                                                        <TableCell>{variant.size || '-'}</TableCell>
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
                                                                    onClick={() => onRequestDelete?.(variant)}
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
