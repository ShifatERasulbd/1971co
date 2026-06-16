import { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
import AboutHeroEditorDrawer from '@/components/website/AboutHeroEditorDrawer';
import AboutStoryEditorDrawer from '@/components/website/AboutStoryEditorDrawer';
import AboutMissionEditorDrawer from '@/components/website/AboutMissionEditorDrawer';
import AboutGivingBackEditorDrawer from '@/components/website/AboutGivingBackEditorDrawer';
import AboutPagePreviewCard from '@/components/website/AboutPagePreviewCard';
import AboutPageSectionsCard from '@/components/website/AboutPageSectionsCard';
import { aboutSections } from '@/components/website/aboutPageBuilderData';
import { fetchAboutHero, updateAboutHero } from '@/pages/Website/aboutHeroApi';
import { fetchAboutStory, updateAboutStory } from '@/pages/Website/aboutStoryApi';
import { fetchAboutMission, updateAboutMission } from '@/pages/Website/aboutMissionApi';
import { fetchAboutGivingBack, updateAboutGivingBack } from '@/pages/Website/aboutGivingBackApi';
import { defaultAboutGivingBackDraft } from '@/pages/Website/aboutGivingBackDefaults';

const defaultAboutHeroDraft = {
    background_image: '/uploads/heroes/images/hero1.webp',
    section_title: 'Our Story',
    title: 'Heritage. Culture. Style.',
    description: 'Redefining streetwear through bold design and authentic self-expression.',
};

const defaultAboutStoryDraft = {
    background_image: '/uploads/heroes/images/hero1.webp',
    section_title: 'The Beginning',
    title: 'Why 1971?',
    description_html:
        '<p>"1971" carries deep historical significance representing independence, pride, and cultural identity. It signals that our brand is rooted in Bangladeshi legacy, not copying Western streetwear but redefining its own path.</p><p>The "Co" brings a fresh, youthful street vibe clean, approachable, and contemporary. Together, they represent our mission: heritage meets modern street culture.</p><p>At 1971Co, we believe streetwear is more than clothing. It\'s a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.</p>',
};

const defaultAboutMissionDraft = {
    background_image: '/uploads/heroes/images/hero1.webp',
    title: 'Our Mission',
    description:
        'Our mission is to make personalized fashion accessible, premium, and expressive. We aim to deliver apparel that combines comfort, durability, and modern design while giving customers the freedom to create styles that represent their identity.',
    items: [
        { icon: 'BadgeCheck', title: 'Premium-Quality' },
        { icon: 'SlidersHorizontal', title: 'Creative Customization' },
        { icon: 'Gift', title: 'Long-Term Partnerships' },
        { icon: 'Handshake', title: 'Modern Fashion Designed' },
    ],
};

export default function AboutPageBuilder() {
    const { setPageTitle } = useAppContext();
    const iframeRef = useRef(null);
    const [sections, setSections] = useState(aboutSections);
    const [selectedSectionKey, setSelectedSectionKey] = useState(null);
    const [isAboutHeroDrawerOpen, setIsAboutHeroDrawerOpen] = useState(false);
    const [aboutHeroDraft, setAboutHeroDraft] = useState(defaultAboutHeroDraft);
    const [aboutHeroImageFile, setAboutHeroImageFile] = useState(null);
    const [isSavingAboutHero, setIsSavingAboutHero] = useState(false);
    const [isAboutStoryDrawerOpen, setIsAboutStoryDrawerOpen] = useState(false);
    const [aboutStoryDraft, setAboutStoryDraft] = useState(defaultAboutStoryDraft);
    const [aboutStoryImageFile, setAboutStoryImageFile] = useState(null);
    const [isSavingAboutStory, setIsSavingAboutStory] = useState(false);
    const [isAboutMissionDrawerOpen, setIsAboutMissionDrawerOpen] = useState(false);
    const [aboutMissionDraft, setAboutMissionDraft] = useState(defaultAboutMissionDraft);
    const [aboutMissionImageFile, setAboutMissionImageFile] = useState(null);
    const [isSavingAboutMission, setIsSavingAboutMission] = useState(false);
    const [isGivingBackDrawerOpen, setIsGivingBackDrawerOpen] = useState(false);
    const [aboutGivingBackDraft, setAboutGivingBackDraft] = useState(defaultAboutGivingBackDraft);
    const [aboutGivingBackImageFile, setAboutGivingBackImageFile] = useState(null);
    const [isSavingGivingBack, setIsSavingGivingBack] = useState(false);

    useEffect(() => {
        setPageTitle('About Page Builder');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadAboutHero() {
            try {
                const payload = await fetchAboutHero();
                if (!payload || ignore) {
                    return;
                }

                setAboutHeroDraft((previous) => ({
                    ...previous,
                    background_image: payload.background_image || previous.background_image,
                    section_title: payload.section_title || previous.section_title,
                    title: payload.title || previous.title,
                    description: payload.description ?? previous.description,
                }));
                setAboutHeroImageFile(null);
            } catch {
                // Keep the default draft if the about hero endpoint is unavailable.
            }
        }

        loadAboutHero();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadAboutGivingBack() {
            try {
                const payload = await fetchAboutGivingBack();
                if (!payload || ignore) {
                    return;
                }

                setAboutGivingBackDraft((previous) => ({
                    ...previous,
                    image: payload.image || previous.image,
                    section_title: payload.section_title || previous.section_title,
                    title: payload.title || previous.title,
                    description: payload.description ?? previous.description,
                    points: Array.isArray(payload.points) && payload.points.length > 0
                        ? payload.points
                        : previous.points,
                }));
                setAboutGivingBackImageFile(null);
            } catch {
                // Keep default draft when endpoint is unavailable.
            }
        }

        loadAboutGivingBack();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadAboutStory() {
            try {
                const payload = await fetchAboutStory();
                if (!payload || ignore) {
                    return;
                }

                setAboutStoryDraft((previous) => ({
                    ...previous,
                    background_image: payload.background_image || previous.background_image,
                    section_title: payload.section_title || previous.section_title,
                    title: payload.title || previous.title,
                    description_html: payload.description_html ?? previous.description_html,
                }));
                setAboutStoryImageFile(null);
            } catch {
                // Keep the default draft if the about story endpoint is unavailable.
            }
        }

        loadAboutStory();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadAboutMission() {
            try {
                const payload = await fetchAboutMission();
                if (!payload || ignore) {
                    return;
                }

                setAboutMissionDraft((previous) => ({
                    ...previous,
                    background_image: payload.background_image || previous.background_image,
                    title: payload.title || previous.title,
                    description: payload.description ?? previous.description,
                    items: Array.isArray(payload.items) && payload.items.length > 0
                        ? payload.items
                        : previous.items,
                }));
                setAboutMissionImageFile(null);
            } catch {
                // Keep the default draft if the mission endpoint is unavailable.
            }
        }

        loadAboutMission();

        return () => {
            ignore = true;
        };
    }, []);

    const publishSectionsLayout = () => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        const activeSections = sections.filter((section) => section.status === 'active');

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_ABOUT_LAYOUT_UPDATE',
                payload: {
                    order: activeSections.map((section) => section.key),
                },
            },
            window.location.origin
        );
    };

    useEffect(() => {
        publishSectionsLayout();
    }, [sections]);

    const publishPreviewMode = () => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_PREVIEW_MODE',
                payload: { enabled: true },
            },
            window.location.origin
        );
    };

    useEffect(() => {
        publishPreviewMode();
    }, []);

    useEffect(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_ABOUT_HERO_PREVIEW_UPDATE',
                payload: aboutHeroDraft,
            },
            window.location.origin
        );
    }, [aboutHeroDraft]);

    useEffect(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_1971_STORY_PREVIEW_UPDATE',
                payload: aboutStoryDraft,
            },
            window.location.origin
        );
    }, [aboutStoryDraft]);

    useEffect(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_OUR_MISSION_PREVIEW_UPDATE',
                payload: aboutMissionDraft,
            },
            window.location.origin
        );
    }, [aboutMissionDraft]);

    useEffect(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_GIVING_BACK_PREVIEW_UPDATE',
                payload: aboutGivingBackDraft,
            },
            window.location.origin
        );
    }, [aboutGivingBackDraft]);

    useEffect(() => {
        function handlePreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data) {
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_ABOUT_HERO_SECTION_SELECTED') {
                setSelectedSectionKey('hero');
                setIsAboutHeroDrawerOpen(true);
                setIsAboutStoryDrawerOpen(false);
                setIsAboutMissionDrawerOpen(false);
                setIsGivingBackDrawerOpen(false);
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_1971_STORY_SECTION_SELECTED') {
                setSelectedSectionKey('1971-about');
                setIsAboutStoryDrawerOpen(true);
                setIsAboutHeroDrawerOpen(false);
                setIsAboutMissionDrawerOpen(false);
                setIsGivingBackDrawerOpen(false);
                const target = iframeRef.current?.contentWindow;
                if (target) {
                    target.postMessage(
                        {
                            type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                            payload: { sectionKey: '1971-about' },
                        },
                        window.location.origin
                    );
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_OUR_MISSION_SECTION_SELECTED') {
                setSelectedSectionKey('our-mission');
                setIsAboutMissionDrawerOpen(true);
                setIsAboutHeroDrawerOpen(false);
                setIsAboutStoryDrawerOpen(false);
                setIsGivingBackDrawerOpen(false);

                const target = iframeRef.current?.contentWindow;
                if (target) {
                    target.postMessage(
                        {
                            type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                            payload: { sectionKey: 'our-mission' },
                        },
                        window.location.origin
                    );
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_GIVING_BACK_SECTION_SELECTED') {
                setSelectedSectionKey('giving-back');
                setIsGivingBackDrawerOpen(true);
                setIsAboutHeroDrawerOpen(false);
                setIsAboutStoryDrawerOpen(false);
                setIsAboutMissionDrawerOpen(false);

                const target = iframeRef.current?.contentWindow;
                if (target) {
                    target.postMessage(
                        {
                            type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                            payload: { sectionKey: 'giving-back' },
                        },
                        window.location.origin
                    );
                }
            }
        }

        window.addEventListener('message', handlePreviewMessage);
        return () => {
            window.removeEventListener('message', handlePreviewMessage);
        };
    }, []);

    const handleSectionStatusToggle = (sectionKey) => {
        setSections((prev) =>
            prev.map((section) =>
                section.key === sectionKey
                    ? {
                          ...section,
                          status: section.status === 'active' ? 'inactive' : 'active',
                      }
                    : section
            )
        );
    };

    const handleSectionReorder = (sourceKey, targetKey) => {
        const sourceIndex = sections.findIndex((s) => s.key === sourceKey);
        const targetIndex = sections.findIndex((s) => s.key === targetKey);

        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
            return;
        }

        const newSections = [...sections];
        const [moved] = newSections.splice(sourceIndex, 1);
        newSections.splice(targetIndex, 0, moved);

        setSections(newSections);
    };

    function handleSectionActivate(section) {
        setSelectedSectionKey(section.key);

        if (section.key === 'hero') {
            setIsAboutHeroDrawerOpen(true);
            setIsAboutStoryDrawerOpen(false);
            setIsAboutMissionDrawerOpen(false);
            setIsGivingBackDrawerOpen(false);
            return;
        }

        if (section.key === '1971-about') {
            setIsAboutStoryDrawerOpen(true);
            setIsAboutHeroDrawerOpen(false);
            setIsAboutMissionDrawerOpen(false);
            setIsGivingBackDrawerOpen(false);

            const target = iframeRef.current?.contentWindow;
            if (target) {
                target.postMessage(
                    {
                        type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                        payload: { sectionKey: '1971-about' },
                    },
                    window.location.origin
                );
            }
            return;
        }

        if (section.key === 'our-mission') {
            setIsAboutMissionDrawerOpen(true);
            setIsAboutHeroDrawerOpen(false);
            setIsAboutStoryDrawerOpen(false);
            setIsGivingBackDrawerOpen(false);

            const target = iframeRef.current?.contentWindow;
            if (target) {
                target.postMessage(
                    {
                        type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                        payload: { sectionKey: 'our-mission' },
                    },
                    window.location.origin
                );
            }
            return;
        }

        if (section.key === 'giving-back') {
            setIsGivingBackDrawerOpen(true);
            setIsAboutHeroDrawerOpen(false);
            setIsAboutStoryDrawerOpen(false);
            setIsAboutMissionDrawerOpen(false);

            const target = iframeRef.current?.contentWindow;
            if (target) {
                target.postMessage(
                    {
                        type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                        payload: { sectionKey: 'giving-back' },
                    },
                    window.location.origin
                );
            }
            return;
        }

        setIsAboutHeroDrawerOpen(false);
        setIsAboutStoryDrawerOpen(false);
        setIsAboutMissionDrawerOpen(false);
        setIsGivingBackDrawerOpen(false);
    }

    function handleAboutHeroChangeField(field, value) {
        setAboutHeroDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleAboutHeroImageUpload(file) {
        setAboutHeroImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleAboutHeroChangeField('background_image', reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    async function handleSaveAboutHero() {
        setIsSavingAboutHero(true);

        try {
            const payload = await updateAboutHero({
                ...aboutHeroDraft,
                background_image: aboutHeroImageFile || aboutHeroDraft.background_image,
            });

            const normalized = {
                background_image: payload?.background_image || defaultAboutHeroDraft.background_image,
                section_title: payload?.section_title || defaultAboutHeroDraft.section_title,
                title: payload?.title || defaultAboutHeroDraft.title,
                description: payload?.description ?? defaultAboutHeroDraft.description,
            };

            setAboutHeroDraft(normalized);
            setAboutHeroImageFile(null);

            toast.success('About hero saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save About hero.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingAboutHero(false);
        }
    }

    function handleAboutStoryChangeField(field, value) {
        setAboutStoryDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleAboutStoryImageUpload(file) {
        setAboutStoryImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleAboutStoryChangeField('background_image', reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    async function handleSaveAboutStory() {
        setIsSavingAboutStory(true);

        try {
            const payload = await updateAboutStory({
                ...aboutStoryDraft,
                background_image: aboutStoryImageFile || aboutStoryDraft.background_image,
            });

            const normalized = {
                background_image: payload?.background_image || defaultAboutStoryDraft.background_image,
                section_title: payload?.section_title || defaultAboutStoryDraft.section_title,
                title: payload?.title || defaultAboutStoryDraft.title,
                description_html: payload?.description_html ?? defaultAboutStoryDraft.description_html,
            };

            setAboutStoryDraft(normalized);
            setAboutStoryImageFile(null);

            toast.success('1971 story saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save 1971 story.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingAboutStory(false);
        }
    }

    function handleAboutMissionChangeField(field, value) {
        setAboutMissionDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleAboutMissionImageUpload(file) {
        setAboutMissionImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleAboutMissionChangeField('background_image', reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    function handleAboutMissionItemChange(index, field, value) {
        setAboutMissionDraft((previous) => ({
            ...previous,
            items: (previous.items || []).map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    }

    function handleAddMissionItem() {
        setAboutMissionDraft((previous) => ({
            ...previous,
            items: [
                ...(previous.items || []),
                { icon: 'BadgeCheck', title: `Mission Item ${(previous.items || []).length + 1}` },
            ],
        }));
    }

    function handleRemoveMissionItem(index) {
        setAboutMissionDraft((previous) => ({
            ...previous,
            items: (previous.items || []).filter((_, itemIndex) => itemIndex !== index),
        }));
    }

    function handleReorderMissionItem(sourceIndex, targetIndex) {
        setAboutMissionDraft((previous) => {
            const nextItems = [...(previous.items || [])];
            if (
                sourceIndex < 0 ||
                targetIndex < 0 ||
                sourceIndex >= nextItems.length ||
                targetIndex >= nextItems.length ||
                sourceIndex === targetIndex
            ) {
                return previous;
            }

            const [moved] = nextItems.splice(sourceIndex, 1);
            nextItems.splice(targetIndex, 0, moved);
            return { ...previous, items: nextItems };
        });
    }

    async function handleSaveAboutMission() {
        setIsSavingAboutMission(true);

        try {
            const payload = await updateAboutMission({
                ...aboutMissionDraft,
                background_image: aboutMissionImageFile || aboutMissionDraft.background_image,
            });

            const normalized = {
                background_image: payload?.background_image || defaultAboutMissionDraft.background_image,
                title: payload?.title || defaultAboutMissionDraft.title,
                description: payload?.description ?? defaultAboutMissionDraft.description,
                items: Array.isArray(payload?.items) && payload.items.length > 0
                    ? payload.items
                    : defaultAboutMissionDraft.items,
            };

            setAboutMissionDraft(normalized);
            setAboutMissionImageFile(null);

            toast.success('Our mission saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save our mission.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingAboutMission(false);
        }
    }

    function handleAboutGivingBackChangeField(field, value) {
        setAboutGivingBackDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleAboutGivingBackImageUpload(file) {
        setAboutGivingBackImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleAboutGivingBackChangeField('image', reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    function handleAboutGivingBackPointChange(index, value) {
        setAboutGivingBackDraft((previous) => ({
            ...previous,
            points: (previous.points || []).map((point, pointIndex) =>
                pointIndex === index ? value : point
            ),
        }));
    }

    function handleAddGivingBackPoint() {
        setAboutGivingBackDraft((previous) => ({
            ...previous,
            points: [...(previous.points || []), `Point ${(previous.points || []).length + 1}`],
        }));
    }

    function handleRemoveGivingBackPoint(index) {
        setAboutGivingBackDraft((previous) => ({
            ...previous,
            points: (previous.points || []).filter((_, pointIndex) => pointIndex !== index),
        }));
    }

    function handleReorderGivingBackPoint(sourceIndex, targetIndex) {
        setAboutGivingBackDraft((previous) => {
            const nextPoints = [...(previous.points || [])];
            if (
                sourceIndex < 0 ||
                targetIndex < 0 ||
                sourceIndex >= nextPoints.length ||
                targetIndex >= nextPoints.length ||
                sourceIndex === targetIndex
            ) {
                return previous;
            }

            const [moved] = nextPoints.splice(sourceIndex, 1);
            nextPoints.splice(targetIndex, 0, moved);
            return { ...previous, points: nextPoints };
        });
    }

    async function handleSaveAboutGivingBack() {
        setIsSavingGivingBack(true);

        try {
            const payload = await updateAboutGivingBack({
                ...aboutGivingBackDraft,
                image: aboutGivingBackImageFile || aboutGivingBackDraft.image,
            });

            const normalized = {
                image: payload?.image || defaultAboutGivingBackDraft.image,
                section_title: payload?.section_title || defaultAboutGivingBackDraft.section_title,
                title: payload?.title || defaultAboutGivingBackDraft.title,
                description: payload?.description ?? defaultAboutGivingBackDraft.description,
                points: Array.isArray(payload?.points) && payload.points.length > 0
                    ? payload.points
                    : defaultAboutGivingBackDraft.points,
            };

            setAboutGivingBackDraft(normalized);
            setAboutGivingBackImageFile(null);

            toast.success('Giving back saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save giving back section.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingGivingBack(false);
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                <div className="min-w-0">
                    <AboutPageSectionsCard
                        sections={sections}
                        selectedSectionKey={selectedSectionKey}
                        onSectionSelect={setSelectedSectionKey}
                        onSectionActivate={handleSectionActivate}
                        onStatusToggle={handleSectionStatusToggle}
                        onReorder={handleSectionReorder}
                    />
                </div>

                <div className="min-w-0">
                    <AboutPagePreviewCard ref={iframeRef} />
                </div>
            </div>

            <AboutHeroEditorDrawer
                open={isAboutHeroDrawerOpen}
                onOpenChange={setIsAboutHeroDrawerOpen}
                value={aboutHeroDraft}
                onChangeField={handleAboutHeroChangeField}
                onUploadImage={handleAboutHeroImageUpload}
                onSave={handleSaveAboutHero}
                isSaving={isSavingAboutHero}
            />

            <AboutStoryEditorDrawer
                open={isAboutStoryDrawerOpen}
                onOpenChange={setIsAboutStoryDrawerOpen}
                value={aboutStoryDraft}
                onChangeField={handleAboutStoryChangeField}
                onUploadImage={handleAboutStoryImageUpload}
                onSave={handleSaveAboutStory}
                isSaving={isSavingAboutStory}
            />

            <AboutMissionEditorDrawer
                open={isAboutMissionDrawerOpen}
                onOpenChange={setIsAboutMissionDrawerOpen}
                value={aboutMissionDraft}
                onChangeField={handleAboutMissionChangeField}
                onUploadImage={handleAboutMissionImageUpload}
                onChangeItem={handleAboutMissionItemChange}
                onAddItem={handleAddMissionItem}
                onRemoveItem={handleRemoveMissionItem}
                onReorderItem={handleReorderMissionItem}
                onSave={handleSaveAboutMission}
                isSaving={isSavingAboutMission}
            />

            <AboutGivingBackEditorDrawer
                open={isGivingBackDrawerOpen}
                onOpenChange={setIsGivingBackDrawerOpen}
                value={aboutGivingBackDraft}
                onChangeField={handleAboutGivingBackChangeField}
                onUploadImage={handleAboutGivingBackImageUpload}
                onChangePoint={handleAboutGivingBackPointChange}
                onAddPoint={handleAddGivingBackPoint}
                onRemovePoint={handleRemoveGivingBackPoint}
                onReorderPoint={handleReorderGivingBackPoint}
                onSave={handleSaveAboutGivingBack}
                isSaving={isSavingGivingBack}
            />
        </DndProvider>
    );
}
