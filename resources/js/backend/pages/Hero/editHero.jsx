import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/hero/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchHero, updateHero } from './api';

const initialForm = {
    title: '',
    description: '',
    title_font_size: '124',
    title_font_family: 'instrument-sans',
    description_font_size: '24',
    description_font_family: 'instrument-sans',
    image: null,
    video: null,
};

const initialPreviews = {
    image: null,
    video: null,
};

export default function EditHero() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [previews, setPreviews] = useState(initialPreviews);
    const [hero, setHero] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Hero');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchHero(id);

                if (!ignore) {
                    setHero(data);
                    setForm({
                        title: data?.title || '',
                        description: data?.description || '',
                        title_font_size: String(data?.title_font_size ?? '124'),
                        title_font_family: data?.title_font_family || 'instrument-sans',
                        description_font_size: String(data?.description_font_size ?? '24'),
                        description_font_family: data?.description_font_family || 'instrument-sans',
                        image: null,
                        video: null,
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load hero.');
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
            await updateHero(id, {
                title: form.title.trim(),
                description: form.description.trim(),
                title_font_size: form.title_font_size,
                title_font_family: form.title_font_family,
                description_font_size: form.description_font_size,
                description_font_family: form.description_font_family,
                image: form.image,
                video: form.video,
            });

            toast.success('Hero updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/hero');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update hero.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading hero...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                hero={hero}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/hero')}
                previews={previews}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update Hero"
                submittingLabel="Updating..."
            />
        </div>
    );
}
