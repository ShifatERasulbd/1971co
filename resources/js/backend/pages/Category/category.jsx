import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
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
import CategoryTable from '@/components/category/table';


import { deleteCategory, fetchCategories } from './api';

export default function Categories() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Categories');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCategories() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchCategories();
                if (!ignore) {
                    setCategories(Array.isArray(data) ? data : []);
                    
                }
            } catch (error) {
                if (!ignore) {
                    
                    setErrorMessage(error.message || 'Failed to load categories.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCategories();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        const id = categoryToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteCategory(id);
            setCategories((previous) => previous.filter((c) => c.id !== id));
            toast.success('Category deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setCategoryToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete category.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
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
                    <CategoryTable
                        categories={categories}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/category/add')}
                        onEdit={(id) => navigate(`/admin/category/${id}/edit`)}
                        onRequestDelete={setCategoryToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(categoryToDelete)}
                    onOpenChange={(open) => !open && setCategoryToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>? This action cannot be undone.
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