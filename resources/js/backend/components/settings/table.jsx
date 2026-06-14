import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function readPayload(setting) {
    return setting?.payload && typeof setting.payload === 'object' ? setting.payload : {};
}

export default function SettingsTable({
    settings = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return settings;

        return settings.filter((item) => {
            const payload = readPayload(item);
            return [
                payload.email,
                payload.location,
                payload.currency,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [search, settings]);

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search settings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="gap-2 w-full md:w-auto" onClick={onAdd}>
                    <Plus />
                    Add Setting
                </Button>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[90px]">SL No</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Header Logo</TableHead>
                                <TableHead>Footer Logo</TableHead>
                                <TableHead>Social</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        Loading settings...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && settings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No settings found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filtered.length === 0 && settings.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No settings match your search.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading &&
                                filtered.map((setting, index) => {
                                    const payload = readPayload(setting);
                                    const socialMedia = Array.isArray(payload.social_media) ? payload.social_media : [];

                                    return (
                                        <TableRow key={setting.id} className="hover:bg-muted/20">
                                            <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>{payload.email || '-'}</TableCell>
                                            <TableCell className="max-w-[220px] truncate">{payload.location || '-'}</TableCell>
                                            <TableCell>{payload.currency || '-'}</TableCell>
                                            <TableCell>
                                                {payload.header_logo ? (
                                                    <img src={payload.header_logo} alt="Header logo" className="h-10 w-10 rounded border object-contain" />
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {payload.footer_logo ? (
                                                    <img src={payload.footer_logo} alt="Footer logo" className="h-10 w-10 rounded border object-contain" />
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{socialMedia.length}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => onEdit?.(setting.id)}
                                                        aria-label={`Edit setting ${setting.id}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => onRequestDelete?.(setting)}
                                                        disabled={deletingId === setting.id}
                                                        aria-label={`Delete setting ${setting.id}`}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    );
}
