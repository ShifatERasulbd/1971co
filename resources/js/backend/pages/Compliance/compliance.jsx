import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ComplianceTable } from '@/components/compliance/table';
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

import { deleteCompliancePage, fetchCompliancePages } from './api';

export default function Compliance() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Compliance');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadPages() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchCompliancePages();
        if (!ignore) {
          setPages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load compliance pages.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPages();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!pageToDelete) {
      return;
    }

    const id = pageToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteCompliancePage(id);
      setPages((previous) => (Array.isArray(previous) ? previous : []).filter((page) => page.id !== id));
      toast.success('Compliance page deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setPageToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete compliance page.';
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
                <ComplianceTable
                pages={pages}
              onAdd={() => navigate('/admin/compliance/add')}
              onEdit={(id) => navigate(`/admin/compliance/${id}/edit`)}
                onRequestDelete={setPageToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(pageToDelete)} onOpenChange={(open) => !open && setPageToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Compliance Page</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete this compliance page? This action cannot be undone.
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