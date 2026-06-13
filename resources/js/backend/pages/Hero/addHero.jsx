import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/hero/addForm';
import { useAppContext } from '@/context/AppContext';

import { createHero } from './api';

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

function validateForm(form) {
    const errors = {};

    if (!form.title.trim()) {
        errors.title = ['The title field is required.'];
    }

    if (!form.description.trim()) {
        errors.description = ['The description field is required.'];
    }

  

    return errors;
}

export default function AddHero() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [previews, setPreviews] = useState(initialPreviews);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Hero');
    }, [setPageTitle]);

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

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createHero({
                title: form.title.trim(),
                description: form.description.trim(),
                title_font_size: form.title_font_size,
                title_font_family: form.title_font_family,
                description_font_size: form.description_font_size,
                description_font_family: form.description_font_family,
                image: form.image,
                video: form.video,
            });

            toast.success('Hero created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/hero');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create hero.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/hero')}
                    previews={previews}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </div>
    );
}
