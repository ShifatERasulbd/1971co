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

export default function GrandChildTable({
    grandChilds = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');

    const filtered = grandChilds.filter((item) => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return true;
        }

        return (
            item.name?.toLowerCase().includes(q)
            || item.slug?.toLowerCase().includes(q)
            || item.category?.name?.toLowerCase().includes(q)
            || item.sub_category?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search GrandChild..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="gap-2 w-full md:w-auto" onClick={onAdd}>
                    <Plus />
                    Add GrandChild
                </Button>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[100px]">SL No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>SubCategory</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Loading GrandChild...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && grandChilds.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No grandchild entries found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filtered.length === 0 && grandChilds.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No grandchild entries match your search.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading &&
                                filtered.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-muted/20">
                                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="max-w-[380px] truncate">{item.slug}</TableCell>
                                        <TableCell>{item.category?.name || '-'}</TableCell>
                                        <TableCell>{item.sub_category?.name || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-label={`Edit ${item.name}`}
                                                    onClick={() => onEdit?.(item.id)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-label={`Delete ${item.name}`}
                                                    onClick={() => onRequestDelete?.(item)}
                                                    disabled={deletingId === item.id}
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
