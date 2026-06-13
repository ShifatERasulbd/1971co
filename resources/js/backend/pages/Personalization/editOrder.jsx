import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

import { fetchPersonalizationOrder, updatePersonalizationOrder } from './api';

export default function EditPersonalizationOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState({
        title: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        orderStatus: 'pending',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Personalization Order');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOrder() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchPersonalizationOrder(id);
                if (!ignore) {
                    setForm({
                        title: data?.title || '',
                        quantity: Number(data?.quantity || 1),
                        unitPrice: Number(data?.unit_price || 0),
                        totalPrice: Number(data?.total_price || 0),
                        orderStatus: data?.order_status || 'pending',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load order.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadOrder();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setLoadError('');

        try {
            await updatePersonalizationOrder(id, {
                title: form.title.trim(),
                quantity: Math.min(99, Math.max(1, Number(form.quantity || 1))),
                unit_price: Math.max(0, Number(form.unitPrice || 0)),
                total_price: Math.max(0, Number(form.totalPrice || 0)),
                order_status: String(form.orderStatus || 'pending').trim().toLowerCase(),
            });

            toast.success('Order updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/personalization/orders');
        } catch (error) {
            const message = error.message || 'Failed to update order.';
            setLoadError(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading order...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Edit Personalization Order #{id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="order-title">Title</Label>
                            <Input
                                id="order-title"
                                value={form.title}
                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder="Order title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order-quantity">Quantity</Label>
                            <Input
                                id="order-quantity"
                                type="number"
                                min={1}
                                max={99}
                                value={form.quantity}
                                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order-unit-price">Price</Label>
                            <Input
                                id="order-unit-price"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.unitPrice}
                                onChange={(event) => setForm((prev) => ({ ...prev, unitPrice: event.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order-total-price">Total Price</Label>
                            <Input
                                id="order-total-price"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.totalPrice}
                                onChange={(event) => setForm((prev) => ({ ...prev, totalPrice: event.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order-status">Order Status</Label>
                            <Input
                                id="order-status"
                                value={form.orderStatus}
                                onChange={(event) => setForm((prev) => ({ ...prev, orderStatus: event.target.value }))}
                                placeholder="pending"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/personalization/orders')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Update Order'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
