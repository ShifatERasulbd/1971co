import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/features/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchFeature, updateFeature } from './api';

const initialForm = {
    title: '',
    description: '',
    icon: null,
};

const initialPreviews = {
  icon: null,
};

export default function EditFeature() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [previews, setPreviews] = useState(initialPreviews);
    const [feature, setFeature] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Feature');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchFeature(id);

                if (!ignore) {
                    setFeature(data);
                    setForm({
                        title: data?.title || '',
                        description: data?.description || '',
                        icon: null,
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load feature.');
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
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        const file = files && files.length > 0 ? files[0] : null;
        setForm((previous) => ({ ...previous, [name]: file }));
        
        // Generate preview URL
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviews((previous) => ({ ...previous, [name]: previewUrl }));
        } else {
            setPreviews((previous) => ({ ...previous, [name]: null }));
        }
        
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            setErrors({ title: ['The title field is required.'] });
            return;
        }

        if (!form.description.trim()) {
            setErrors({ description: ['The description field is required.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateFeature(id, {
                title: form.title.trim(),
                description: form.description.trim(),
                icon: form.icon,
            });

            toast.success('Feature updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/features');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update feature.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading feature...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                feature={feature}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/features')}
                previews={previews}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update Feature"
                submittingLabel="Updating..."
            />
        </div>
    );
}
