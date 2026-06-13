import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SubCategoryTable({
    subCategories = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');

    const filtered = subCategories.filter((c) => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return true;
        }

        return (
            c.name?.toLowerCase().includes(q) ||
            c.slug?.toLowerCase().includes(q)||
            c.category?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Subcategory..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="gap-2 w-full md:w-auto" onClick={onAdd}>
                    <Plus />
                    Add SubCategory
                </Button>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
              

                <div className="w-full overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Category</TableHead>
                           
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Loading SubCategory...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && subCategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No subcategories found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && subCategories.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No subcategories match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((subcategory, index) => (
                                <TableRow key={subcategory.id} className="hover:bg-muted/20">
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        {subcategory.image_url ? (
                                            <img
                                                src={subcategory.image_url}
                                                alt={subcategory.name}
                                                className="h-12 w-12 rounded border object-cover bg-muted"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
                                                N/A
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                                    <TableCell className="max-w-[380px] truncate">{subcategory.slug}</TableCell>
                                    <TableCell className="font-medium">{subcategory.category?.name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Edit ${subcategory.name}`}
                                                onClick={() => onEdit?.(subcategory.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Delete ${subcategory.name}`}
                                                onClick={() => onRequestDelete?.(subcategory)}
                                                disabled={deletingId === subcategory.id}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    );
}
