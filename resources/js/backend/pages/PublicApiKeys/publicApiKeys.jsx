import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import { createPublicApiKey, fetchPublicApiKeys, revokePublicApiKey } from './api';

export default function PublicApiKeys() {
    const { setPageTitle } = useAppContext();
    const [keys, setKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('Inventory Public API Key');
    const [latestKey, setLatestKey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [revokingId, setRevokingId] = useState(null);

    useEffect(() => {
        setPageTitle('Public API Keys');
    }, [setPageTitle]);

    async function loadKeys() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await fetchPublicApiKeys();
            setKeys(data);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load public API keys.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadKeys();
    }, []);

    async function handleCreate() {
        setIsCreating(true);
        setErrorMessage('');
        setLatestKey('');

        try {
            const payload = await createPublicApiKey(name.trim() || 'Inventory Public API Key');
            const plain = payload?.key?.plain_text_key || '';

            setLatestKey(plain);
            toast.success('API key generated. Copy it now.', {
                style: { color: '#16a34a' },
            });

            await loadKeys();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to create API key.');
            toast.error(error.message || 'Failed to create API key.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsCreating(false);
        }
    }

    async function handleRevoke(id) {
        setRevokingId(id);
        setErrorMessage('');

        try {
            await revokePublicApiKey(id);
            toast.success('API key revoked successfully.', {
                style: { color: '#16a34a' },
            });
            await loadKeys();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to revoke API key.');
            toast.error(error.message || 'Failed to revoke API key.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setRevokingId(null);
        }
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Create Public API Key</CardTitle>
                    <CardDescription>
                        Generate keys for Inventory sync. The plain key is shown only once.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Key name"
                            className="md:max-w-md"
                        />
                        <Button type="button" onClick={handleCreate} disabled={isCreating}>
                            {isCreating ? 'Generating...' : 'Generate Key'}
                        </Button>
                    </div>

                    {latestKey && (
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                            <p className="font-semibold text-amber-900">Copy this key now</p>
                            <p className="mt-1 break-all font-mono text-amber-900">{latestKey}</p>
                        </div>
                    )}

                    {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Public API Keys</CardTitle>
                    <CardDescription>
                        Revoke old keys to rotate access safely.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Preview</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isLoading && keys.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No API keys created yet.
                                    </TableCell>
                                </TableRow>
                            )}

                            {keys.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="font-mono">{item.key_preview}</TableCell>
                                    <TableCell>{item.is_active ? 'Active' : 'Revoked'}</TableCell>
                                    <TableCell>{item.last_used_at ? new Date(item.last_used_at).toLocaleString() : '-'}</TableCell>
                                    <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={!item.is_active || revokingId === item.id}
                                            onClick={() => handleRevoke(item.id)}
                                        >
                                            {revokingId === item.id ? 'Revoking...' : 'Revoke'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
