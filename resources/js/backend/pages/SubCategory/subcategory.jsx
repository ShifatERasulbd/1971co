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
import SubCategoryTable from '@/components/subcategory/table';


import { deleteSubCategory, fetchSubCategories } from './api';

export default function SubCategories() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('SubCategories');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadSubCategories() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchSubCategories();
                if (!ignore) {
                    setSubCategories(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load subcategories.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadSubCategories();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!subCategoryToDelete) {
            return;
        }

        const id = subCategoryToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteSubCategory(id);
            setSubCategories((previous) => previous.filter((c) => c.id !== id));
            toast.success('SubCategory deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setSubCategoryToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete subcategory.';
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
                    <SubCategoryTable
                        subCategories={subCategories}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/sub-category/add')}
                        onEdit={(id) => navigate(`/admin/sub-category/${id}/edit`)}
                        onRequestDelete={setSubCategoryToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(subCategoryToDelete)}
                    onOpenChange={(open) => !open && setSubCategoryToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete SubCategory</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{subCategoryToDelete?.name}</strong>? This action cannot be undone.
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