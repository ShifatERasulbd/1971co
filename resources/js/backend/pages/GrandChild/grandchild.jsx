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
import GrandChildTable from '@/components/grandchild/table';

import { deleteGrandChild, fetchGrandChilds } from './api';

export default function GrandChilds() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [grandChilds, setGrandChilds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [grandChildToDelete, setGrandChildToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('GrandChilds');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadGrandChilds() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchGrandChilds();
                if (!ignore) {
                    setGrandChilds(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load grandchild entries.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadGrandChilds();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!grandChildToDelete) {
            return;
        }

        const id = grandChildToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteGrandChild(id);
            setGrandChilds((previous) => previous.filter((item) => item.id !== id));
            toast.success('GrandChild deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setGrandChildToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete grandchild entry.';
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
                    <GrandChildTable
                        grandChilds={grandChilds}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/grand-child/add')}
                        onEdit={(id) => navigate(`/admin/grand-child/${id}/edit`)}
                        onRequestDelete={setGrandChildToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(grandChildToDelete)}
                    onOpenChange={(open) => !open && setGrandChildToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete GrandChild</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{grandChildToDelete?.name}</strong>? This action cannot be undone.
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
