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

export default function FeaturesTable({
    features = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');

    const filtered = features.filter((f) => {
        const q = search.toLowerCase();
        return (
            f.title?.toLowerCase().includes(q) ||
            f.description?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search features..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="gap-2 w-full md:w-auto" onClick={onAdd}>
                    <Plus />
                    Add Feature
                </Button>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
                

                <div className="w-full overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Loading features...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && features.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No features found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && features.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No features match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((feature, index) => (
                                <TableRow key={feature.id} className="hover:bg-muted/20">
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{feature.title}</TableCell>
                                    <TableCell className="max-w-[380px] truncate">{feature.description}</TableCell>
                                    <TableCell>
                                        {feature.icon_url || feature.icon ? (
                                            <img
                                                src={feature.icon_url || feature.icon}
                                                alt={feature.title}
                                                className="h-14 w-14 object-cover rounded-md border cursor-pointer transition-opacity hover:opacity-80"
                                                onClick={() => window.open(feature.icon_url || feature.icon, '_blank')}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Edit ${feature.title}`}
                                                onClick={() => onEdit?.(feature.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Delete ${feature.title}`}
                                                onClick={() => onRequestDelete?.(feature)}
                                                disabled={deletingId === feature.id}
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
