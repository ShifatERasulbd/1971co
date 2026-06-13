import { useEffect, useState} from 'react';
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
import FeaturesTable from '@/components/features/table';
import { useAppContext } from '@/context/AppContext';
import { deleteFeature, fetchFeatures } from './api';
export default function Features(){
     const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [features, setFeatures] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId,setDeletingId]=useState(null);
    const [featureToDelete, setFeatureToDelete]= useState(null);

    useEffect(() => {
        setPageTitle('Features');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore =false;

        async function loadFeatures(){
            setIsLoading(true);
            setErrorMessage('');

            try{
                const data =await fetchFeatures();
                if(!ignore){
                    setFeatures(Array.isArray(data) ? data : []);

                }
            }catch(error){
                if(!ignore){
                    setErrorMessage(error.message || 'Failed to load features.');
                }
            }finally{
                if(!ignore){
                    setIsLoading(false);
                }
            }
        }

        loadFeatures();

        return ()=> {
            ignore = true;
        }
    },[]);

    const handleConfirmDelete = async()=>{
        if(!featureToDelete) {
            return
        }
        
        const id = featureToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteFeature(id);
            setFeatures((previous)=>previous.filter((feature)=> feature.id !==id));
            toast.success('Feature Deleted Successfully',{
                style:{
                    color :'#16a34a'
                }
            });
            setFeatureToDelete(null);
        }catch(error){
            const message=error.message || 'Failed to delete feature.'
            setErrorMessage(message);
            toast.error(message,{
                style:{
                    color:'#dc2626'
                }
            });
        }finally {
            setDeletingId(null);
        }
    };
    return (
        <>
            <div className="space-y-5">
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <FeaturesTable
                        features={features}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/features/add')}
                        onEdit={(id)=> navigate(`/admin/features/${id}/edit`)}
                        onRequestDelete={setFeatureToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(featureToDelete)}
                    onOpenChange={(open)=> !open && setFeatureToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{featureToDelete?.title}</strong>? This action cannot be undone.
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

    )
}   