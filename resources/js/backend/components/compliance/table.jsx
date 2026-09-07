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

export function ComplianceTable({ pages = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = pages.filter((page) => {
        const q = search.toLowerCase();
        const title = (page.title ?? '').toString().toLowerCase();
        return title.includes(q);
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Compliance Pages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd}>
                <Plus />
                Add Compliance
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Terms & Conditions</TableHead>
                        <TableHead>Privacy Policy</TableHead>
                        <TableHead>Shipping & Return</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Loading Compliance Pages...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && pages.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No Compliance Pages found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && pages.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No Compliance Pages match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((page, index) => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium">{page.title || 'Untitled'}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {page.terms_and_conditions ? (
                                        <span className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: page.terms_and_conditions.substring(0, 100) }} />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Not set</span>
                                    )}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {page.privacy_policy ? (
                                        <span className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: page.privacy_policy.substring(0, 100) }} />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Not set</span>
                                    )}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {page.shipping_and_return ? (
                                        <span className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: page.shipping_and_return.substring(0, 100) }} />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Not set</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${page.title || 'compliance page'}`}
                                                        onClick={() => onEdit(page.id)}
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
                                                    aria-label={`Delete ${page.title || 'compliance page'}`}
                                                    onClick={() => onRequestDelete(page)}
                                                        disabled={deletingId === page.id}
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