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
import { useAppContext } from '@/context/AppContext';
import SettingsTable from '@/components/settings/table';
import { deleteSetting, fetchSettings } from './api';

export default function Settings() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [settings, setSettings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [settingToDelete, setSettingToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Settings');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchSettings();
                if (!ignore) {
                    setSettings(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load settings.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!settingToDelete) {
            return;
        }

        const id = settingToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteSetting(id);
            setSettings((previous) => previous.filter((item) => item.id !== id));
            toast.success('Setting deleted successfully', {
                style: { color: '#16a34a' },
            });
            setSettingToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete setting.';
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
                    <SettingsTable
                        settings={settings}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/settings/add')}
                        onEdit={(id) => navigate(`/admin/settings/${id}/edit`)}
                        onRequestDelete={setSettingToDelete}
                    />
                </div>
            </div>

            <AlertDialog
                open={Boolean(settingToDelete)}
                onOpenChange={(open) => !open && setSettingToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Setting</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this setting? This action cannot be undone.
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
        </>
    );
}
