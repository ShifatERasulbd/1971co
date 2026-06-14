import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ColorTable } from '@/components/color/table';
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
import { useAppContext } from '@/context/AppContext';

import { deleteColor, fetchColors } from './api';

export default function Color() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [colors, setColors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [colorToDelete, setColorToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Color');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadColors() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchColors();
                if (!ignore) {
                    setColors(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load Colors.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadColors();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!colorToDelete) {
            return;
        }

        const id = colorToDelete.id;

        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteColor(id);
            setColors((previous) => (Array.isArray(previous) ? previous : []).filter((color) => color.id !== id));
            toast.success('Color deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setColorToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete Color.';
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <ColorTable
                    colors={colors}
                    onAdd={() => navigate('/admin/color/add')}
                    onEdit={(id) => navigate(`/admin/color/${id}/edit`)}
                    onRequestDelete={setColorToDelete}
                    deletingId={deletingId}
                    isLoading={isLoading}
                />
            </div>

            <AlertDialog open={Boolean(colorToDelete)} onOpenChange={(open) => !open && setColorToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Color</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {colorToDelete?.name}? This action cannot be undone.
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
