import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function SizeTable({ sizes = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = sizes.filter((s) => {
        const q = search.toLowerCase();
        const sizeLabel = (s.size ?? s.Size ?? '').toString().toLowerCase();
        return (
            sizeLabel.includes(q)
           
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Sizes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd}>
                <Plus />
                Add Size
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Size</TableHead>
                       
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                Loading Size...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && sizes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No Sizes found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && sizes.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No Sizes match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((size, index) => (
                            <TableRow key={size.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{size.size ?? size.Size}</TableCell>
                                
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${size.size ?? size.Size}`}
                                                        onClick={() => onEdit(size.id)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${size.size ?? size.Size}`}
                                                    onClick={() => onRequestDelete(size)}
                                                        disabled={deletingId === size.id}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                      
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Card>
        </>
    );
}