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

function resolveMediaUrl(value, fallbackDirectory) {
    if (!value) {
        return null;
    }

    const raw = String(value);

    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) {
        return raw;
    }

    const normalized = raw.replace(/^\/+/, '');

    if (normalized.startsWith('uploads/')) {
        return `/${normalized}`;
    }

    if (normalized.includes('/')) {
        return `/${normalized}`;
    }

    return `${fallbackDirectory}/${normalized}`;
}

export default function HeroTable({
    heroes = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');

    const filtered = heroes.filter((h) => {
        const q = search.toLowerCase();
        return (
            h.title?.toLowerCase().includes(q) ||
            h.description?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search heroes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="gap-2" onClick={onAdd}>
                    <Plus />
                    Add Hero
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Video</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Loading heroes...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && heroes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No heroes found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && heroes.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No heroes match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((hero, index) => {
                                const imageSrc = resolveMediaUrl(
                                    hero.image_url || hero.image,
                                    '/uploads/heroes/images'
                                );
                                const videoSrc = resolveMediaUrl(
                                    hero.video_url || hero.video,
                                    '/uploads/heroes/videos'
                                );

                                return (
                                <TableRow key={hero.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{hero.title}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">{hero.description}</TableCell>
                                    <TableCell>
                                        {imageSrc ? (
                                           <img
                                                src={imageSrc}
                                                alt={hero.title}
                                                className="h-16 w-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                onClick={() => window.open(imageSrc, '_blank')}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {videoSrc ? (
                                            <video
                                                src={videoSrc}
                                                className="h-16 w-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                onClick={() => window.open(videoSrc, '_blank')}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${hero.title}`}
                                                onClick={() => onEdit?.(hero.id)}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${hero.title}`}
                                                onClick={() => onRequestDelete?.(hero)}
                                                disabled={deletingId === hero.id}
                                            >
                                                <Trash2 className="text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}
