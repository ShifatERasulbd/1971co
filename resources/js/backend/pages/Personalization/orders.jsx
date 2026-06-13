import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import {
    deletePersonalizationOrder,
    fetchPersonalizationOrders,
} from './api';

function formatDate(value) {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return '-';
    }
}

function formatCurrency(value) {
    const numberValue = Number(value || 0);
    if (Number.isNaN(numberValue)) return '$0.00';
    return `$${numberValue.toFixed(2)}`;
}

export default function PersonalizationOrders() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Personalization Orders');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOrders() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchPersonalizationOrders();
                if (!ignore) {
                    setOrders(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load personalization orders.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadOrders();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        const id = orderToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deletePersonalizationOrder(id);
            setOrders((previous) => previous.filter((item) => item.id !== id));
            toast.success('Order deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setOrderToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete order.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Card>
                
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Front</TableHead>
                                <TableHead>Back</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                                        Loading orders...
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                                        No personalization orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/admin/personalization/orders/${order.id}`)}
                                    >
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.title || 'Untitled'}</TableCell>
                                        <TableCell>
                                            {order.front_image_url ? (
                                                <img src={order.front_image_url} alt="Front" className="h-12 w-12 rounded-md border object-cover" />
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.back_image_url ? (
                                                <img src={order.back_image_url} alt="Back" className="h-12 w-12 rounded-md border object-cover" />
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{order.quantity ?? '-'}</TableCell>
                                        <TableCell>{formatCurrency(order.unit_price)}</TableCell>
                                        <TableCell>{formatCurrency(order.total_price)}</TableCell>
                                        <TableCell className="capitalize">{order.order_status || 'pending'}</TableCell>
                                        <TableCell>{formatDate(order.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        navigate(`/admin/personalization/orders/${order.id}`);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        navigate(`/admin/personalization/orders/${order.id}/edit`);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === order.id}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setOrderToDelete(order);
                                                    }}
                                                >
                                                    {deletingId === order.id ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog
                open={Boolean(orderToDelete)}
                onOpenChange={(open) => !open && setOrderToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Personalization Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete order <strong>#{orderToDelete?.id}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deletingId !== null}
                            onClick={handleConfirmDelete}
                        >
                            {deletingId !== null ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
