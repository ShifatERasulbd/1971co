import { useEffect, useState } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

export function LowStockAlertTable() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadStocks() {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/inventory/canada-warehouse-stocks', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(payload?.message || 'Failed to fetch stock data.');
                }

                if (!ignore) {
                    const rows = Array.isArray(payload?.data)
                        ? payload.data
                        : (Array.isArray(payload) ? payload : []);
                    setStocks(rows);
                }
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError.message || 'Failed to fetch stock data.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadStocks();

        return () => {
            ignore = true;
        };
    }, []);

    function formatJsonList(value) {
        if (Array.isArray(value)) {
            return value.filter(Boolean).join(', ');
        }

        if (typeof value === 'string' && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean).join(', ');
                }
            } catch {
                return value;
            }

            return value;
        }

        return '-';
    }

    function getSizeVariants(stock) {
        return stock.size_variants
            ?? stock.available_products?.size_variants
            ?? stock.available_products?.sizes
            ?? stock.size
            ?? [];
    }

    return (
        <Card className="p-4">
            <h3 className="mb-3 font-semibold">Canada Warehouse Stock</h3>

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[70px]">SL No</TableHead>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Color Variant</TableHead>
                        <TableHead>Size Variant</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                Loading stock data...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && stocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No stock data found for Canada warehouse.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && stocks.map((stock, index) => (
                        <TableRow key={stock.id ?? `${stock.product_id}-${index}`}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                                {stock.cover_image_url
                                    ? <img src={stock.cover_image_url} alt={stock.product_name || 'product'} className="h-10 w-10 rounded object-cover" />
                                    : <span className="text-muted-foreground">-</span>
                                }
                            </TableCell>
                            <TableCell>{stock.product_name || '-'}</TableCell>
                            <TableCell>{stock.sku || '-'}</TableCell>
                            <TableCell>
                                {formatJsonList(stock.color ?? stock.color_variant?.name) !== '-' ? (
                                    <div className="flex items-center gap-2">
                                        {stock.color_variant?.color_code && (
                                            <div 
                                                className="w-4 h-4 rounded border border-gray-300" 
                                                style={{ backgroundColor: stock.color_variant.color_code }}
                                                title={formatJsonList(stock.color)}
                                            />
                                        )}
                                        <span>{formatJsonList(stock.color ?? stock.color_variant?.name)}</span>
                                    </div>
                                ) : '-'}
                            </TableCell>
                            <TableCell>{formatJsonList(getSizeVariants(stock))}</TableCell>
                            <TableCell className="text-right">
                                {Number.isFinite(Number(stock.selling_price))
                                    ? Number(stock.selling_price).toFixed(2)
                                    : '-'}
                            </TableCell>
                            <TableCell>{stock.warehouse_name || '-'}</TableCell>
                            <TableCell className="text-right">{stock.stocks ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}