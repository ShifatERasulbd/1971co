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
import ProductTable from '@/components/products/table';
import { useAppContext } from '@/context/AppContext';
import { fetchColors } from '@/pages/Color/api';
import { fetchSizes } from '@/pages/Size/api';

import { deleteProduct, fetchProducts, syncApiProducts } from './api';

export default function Products() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [colorOptions, setColorOptions] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);

    const handleEdit = (productOrPayload) => {
        if (productOrPayload && typeof productOrPayload === 'object') {
            navigate(`/admin/products/${productOrPayload.id}/edit`, {
                state: {
                    productGroup: productOrPayload,
                },
            });
            return;
        }

        navigate(`/admin/products/${productOrPayload}/edit`);
    };

    useEffect(() => {
        setPageTitle('Products');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadProducts() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchProducts();
                if (!ignore) {
                    const rows = Array.isArray(data) ? data : [];
                    setProducts(rows);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load products.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadAttributeOptions() {
            try {
                const [colors, sizes] = await Promise.all([fetchColors(), fetchSizes()]);
                if (!ignore) {
                    setColorOptions(Array.isArray(colors) ? colors : []);
                    setSizeOptions(Array.isArray(sizes) ? sizes : []);
                }
            } catch {
                if (!ignore) {
                    setColorOptions([]);
                    setSizeOptions([]);
                }
            }
        }

        loadAttributeOptions();

        return () => {
            ignore = true;
        };
    }, []);

    // Sync products from API
        const handleSyncProducts = async () => {
            setIsLoading(true);
            setError('');
            try {
                const res = await syncApiProducts();
                toast.success(res.message || 'Products synced successfully.');
                const data = await fetchProducts();
                const rows = Array.isArray(data) ? data : [];
                setProducts(rows);
            } catch (err) {
                setError(err.message || 'Failed to sync products.');
                toast.error(err.message || 'Failed to sync products.');
            } finally {
                setIsLoading(false);
            }
        };

    const handleConfirmDelete = async () => {
        if (!productToDelete) {
            return;
        }

        const id = productToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            const response = await deleteProduct(id, {
                scope: productToDelete.deleteScope || 'single',
                groupName: productToDelete.groupName || productToDelete.name || '',
            });

            const deletedIds = Array.isArray(response?.deleted_ids)
                ? response.deleted_ids.map((value) => Number(value)).filter(Number.isFinite)
                : [id];

            setProducts((previous) =>
                previous.filter((product) => !deletedIds.includes(Number(product.id)))
            );
            toast.success('Product deleted successfully', {
                style: {
                    color: '#16a34a',
                },
            });
            setProductToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete product.';
            setErrorMessage(message);
            toast.error(message, {
                style: {
                    color: '#dc2626',
                },
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="space-y-5">
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <ProductTable
                        products={products}
                        colorOptions={colorOptions}
                        sizeOptions={sizeOptions}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/products/add')}
                        onEdit={handleEdit}
                        onRequestDelete={setProductToDelete}
                        onSync={handleSyncProducts}
                    />
                </div>

                <AlertDialog
                    open={Boolean(productToDelete)}
                    onOpenChange={(open) => !open && setProductToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{productToDelete?.name}</strong>
                                {productToDelete?.deleteScope === 'group' ? ' and all of its variants' : ''}?
                                {' '}This action cannot be undone.
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
        </>
    );
}
