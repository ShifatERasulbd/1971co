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
import HeroTable from '@/components/hero/table';


import { deleteHero, fetchHeroes } from './api';

export default function Heroes() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [heroes, setHeroes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [heroToDelete, setHeroToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Heroes');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadHeroes() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchHeroes();
                if (!ignore) {
                    setHeroes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load heroes.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadHeroes();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!heroToDelete) {
            return;
        }

        const id = heroToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteHero(id);
            setHeroes((previous) => previous.filter((h) => h.id !== id));
            toast.success('Hero deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setHeroToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete hero.';
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
                    <HeroTable
                        heroes={heroes}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/hero/add')}
                        onEdit={(id) => navigate(`/admin/hero/${id}/edit`)}
                        onRequestDelete={setHeroToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(heroToDelete)}
                    onOpenChange={(open) => !open && setHeroToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hero</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{heroToDelete?.title}</strong>? This action cannot be undone.
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