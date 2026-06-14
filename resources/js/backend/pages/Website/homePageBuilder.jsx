import { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

import HeroEditorDrawer from '@/components/website/HeroEditorDrawer';
import FeaturesEditorDrawer from '@/components/website/FeaturesEditorDrawer';
import CollectionsEditorDrawer from '@/components/website/CollectionsEditorDrawer';
import HomePagePreviewCard from '@/components/website/HomePagePreviewCard';
import HomePageSectionsCard from '@/components/website/HomePageSectionsCard';
import { homeSections } from '@/components/website/homePageBuilderData';
import { useAppContext } from '@/context/AppContext';
import {
    createFeature,
    deleteFeature,
    fetchFeatures,
    updateFeature,
} from '@/pages/Features/api';
import { createHero, fetchHeroes, updateHero } from '@/pages/Hero/api';
import { fetchCollections, updateCollections } from '@/pages/Website/collectionsApi';

const defaultHeroDraft = {
    title: 'Custom apparel solutions',
    description:
        'Elevate your brand with premium customized apparel designed for teams, events, corporate identity, and professional wear.',
    image_url: '/uploads/heroes/images/hero1.webp',
    video_url: '',
    title_display_mode: 'double',
    title_font_size: 124,
    title_font_family: 'instrument-sans',
    description_font_size: 24,
    description_font_family: 'instrument-sans',
    text_offset_x: 0,
    text_offset_y: 0,
    title_offset_x: 0,
    title_offset_y: 0,
    description_offset_x: 0,
    description_offset_y: 0,
    button_offset_x: 0,
    button_offset_y: 0,
    button_enabled: true,
    button_url: '/shop',
};

const defaultFeaturesDraft = {
    columns: 4,
    titleFontFamily: 'instrument-sans',
    titleFontSize: 28,
    descriptionFontFamily: 'instrument-sans',
    descriptionFontSize: 16,
    items: [
        {
            title: 'Premium Quality Materials',
            short_description: 'Durable fabrics designed for comfort and long-term use.',
            icon: null,
            icon_url: null,
        },
        {
            title: 'Personalized Products',
            short_description: 'Customize designs, colors, and details to match your identity.',
            icon: null,
            icon_url: null,
        },
        {
            title: 'Bulk Order Solutions',
            short_description: 'Efficient production and scalable solutions for businesses of all sizes.',
            icon: null,
            icon_url: null,
        },
       
    ],
};

const defaultCollectionsDraft = {
    title: 'Collections',
    titlePosition: 'left',
    itemsPerView: 4,
    items: [
        {
            name: 'New Arrivals',
            slug: 'new-arrivals',
            image: '/uploads/heroes/images/hero1.webp',
        },
        {
            name: 'Essentials',
            slug: 'essentials',
            image: '/uploads/heroes/images/hero1.webp',
        },
        {
            name: 'Tees',
            slug: 'tees',
            image: '/uploads/heroes/images/hero1.webp',
        },
        {
            name: 'Bottoms',
            slug: 'bottoms',
            image: '/uploads/heroes/images/hero1.webp',
        },
    ],
};

function moveItemByKeys(items, sourceKey, targetKey, keySelector) {
    const sourceIndex = items.findIndex((item) => keySelector(item) === sourceKey);
    const targetIndex = items.findIndex((item) => keySelector(item) === targetKey);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}

export default function HomePageBuilder() {
    const { setPageTitle } = useAppContext();
    const iframeRef = useRef(null);
    const [sections, setSections] = useState(homeSections);
    const [isHeroDrawerOpen, setIsHeroDrawerOpen] = useState(false);
    const [isFeaturesDrawerOpen, setIsFeaturesDrawerOpen] = useState(false);
    const [isCollectionsDrawerOpen, setIsCollectionsDrawerOpen] = useState(false);
    const [activeFeatureItemIndex, setActiveFeatureItemIndex] = useState(null);
    const [activeCollectionItemIndex, setActiveCollectionItemIndex] = useState(null);
    const [activeHeroConfigPart, setActiveHeroConfigPart] = useState('all');
    const [selectedSectionKey, setSelectedSectionKey] = useState(null);
    const [heroDraft, setHeroDraft] = useState(defaultHeroDraft);
    const [featuresDraft, setFeaturesDraft] = useState(defaultFeaturesDraft);
    const [collectionsDraft, setCollectionsDraft] = useState(defaultCollectionsDraft);
    const [heroUploadFiles, setHeroUploadFiles] = useState({ image: null, video: null });
    const [activeHeroId, setActiveHeroId] = useState(null);
    const [isSavingHero, setIsSavingHero] = useState(false);
    const [isSavingFeatures, setIsSavingFeatures] = useState(false);
    const [isSavingCollections, setIsSavingCollections] = useState(false);

    useEffect(() => {
        setPageTitle('Home Page Builder');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadActiveHero() {
            try {
                const heroes = await fetchHeroes();
                const latestHero = Array.isArray(heroes) && heroes.length > 0 ? heroes[0] : null;
                if (!latestHero || ignore) {
                    return;
                }

                setActiveHeroId(latestHero.id);
                setHeroDraft((previous) => ({
                    ...previous,
                    title: latestHero.title || previous.title,
                    description: latestHero.description || previous.description,
                    title_display_mode: latestHero.title_display_mode || previous.title_display_mode,
                    title_font_size: latestHero.title_font_size ?? previous.title_font_size,
                    title_font_family: latestHero.title_font_family || previous.title_font_family,
                    description_font_size:
                        latestHero.description_font_size ?? previous.description_font_size,
                    description_font_family:
                        latestHero.description_font_family || previous.description_font_family,
                    text_offset_x: latestHero.text_offset_x ?? previous.text_offset_x,
                    text_offset_y: latestHero.text_offset_y ?? previous.text_offset_y,
                    title_offset_x: latestHero.title_offset_x ?? previous.title_offset_x,
                    title_offset_y: latestHero.title_offset_y ?? previous.title_offset_y,
                    description_offset_x:
                        latestHero.description_offset_x ?? previous.description_offset_x,
                    description_offset_y:
                        latestHero.description_offset_y ?? previous.description_offset_y,
                    button_offset_x: latestHero.button_offset_x ?? previous.button_offset_x,
                    button_offset_y: latestHero.button_offset_y ?? previous.button_offset_y,
                    button_enabled: latestHero.button_enabled ?? previous.button_enabled,
                    button_url: latestHero.button_url || previous.button_url,
                    image_url: latestHero.image_url || previous.image_url,
                    video_url: latestHero.video_url || previous.video_url,
                }));
                setHeroUploadFiles({ image: null, video: null });
            } catch {
                // Keep default draft when hero list fails to load.
            }
        }

        loadActiveHero();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadCollectionsDraft() {
            try {
                const payload = await fetchCollections();
                if (!payload || ignore) {
                    return;
                }

                const section = payload.section || {};
                const items = Array.isArray(payload.items)
                    ? [...payload.items].sort((a, b) => {
                          const aOrder = Number.isFinite(Number(a.sort_order))
                              ? Number(a.sort_order)
                              : Number(a.id || 0);
                          const bOrder = Number.isFinite(Number(b.sort_order))
                              ? Number(b.sort_order)
                              : Number(b.id || 0);
                          return aOrder - bOrder;
                      })
                    : [];

                setCollectionsDraft((previous) => ({
                    ...previous,
                    title: section.title || previous.title,
                    titlePosition: section.titlePosition || previous.titlePosition,
                    itemsPerView:
                        Number(section.itemsPerView) > 0
                            ? Number(section.itemsPerView)
                            : previous.itemsPerView,
                    items:
                        items.length > 0
                            ? items.map((item, index) => ({
                                  id: item.id,
                                  name: item.name || previous.items[index]?.name || '',
                                  slug: item.slug || previous.items[index]?.slug || '',
                                  image: item.image || previous.items[index]?.image || '',
                              }))
                            : previous.items,
                }));
            } catch {
                // Keep default draft when collections fail to load.
            }
        }

        loadCollectionsDraft();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadFeaturesDraft() {
            try {
                const features = await fetchFeatures();
                if (!Array.isArray(features) || features.length === 0 || ignore) {
                    return;
                }

                const ordered = [...features].sort((a, b) => {
                    const aOrder = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number(a.id);
                    const bOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number(b.id);
                    return aOrder - bOrder;
                });

                const first = ordered[0] || {};

                setFeaturesDraft((previous) => ({
                    ...previous,
                    columns:
                        Number(first.columns_per_view) > 0
                            ? Number(first.columns_per_view)
                            : previous.columns,
                    titleFontFamily: first.title_font_family || previous.titleFontFamily,
                    titleFontSize: first.title_font_size ?? previous.titleFontSize,
                    descriptionFontFamily:
                        first.description_font_family || previous.descriptionFontFamily,
                    descriptionFontSize:
                        first.description_font_size ?? previous.descriptionFontSize,
                    items: ordered.map((feature, index) => ({
                        id: feature.id,
                        title: feature.title || previous.items[index]?.title || '',
                        short_description:
                            feature.short_description ||
                            feature.description ||
                            previous.items[index]?.short_description ||
                            '',
                        icon: feature.icon || previous.items[index]?.icon || null,
                        icon_url: feature.icon_url || previous.items[index]?.icon_url || null,
                    })),
                }));
            } catch {
                // Keep default draft when feature list fails to load.
            }
        }

        loadFeaturesDraft();

        return () => {
            ignore = true;
        };
    }, []);

    const publishHeroDraft = useCallback(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_HERO_PREVIEW_UPDATE',
                payload: heroDraft,
            },
            window.location.origin
        );
    }, [heroDraft]);

    useEffect(() => {
        publishHeroDraft();
    }, [publishHeroDraft]);

    const publishSectionsLayout = useCallback(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        const activeSections = sections.filter((section) => section.status === 'active');

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_HOME_LAYOUT_UPDATE',
                payload: {
                    order: activeSections.map((section) => section.key),
                },
            },
            window.location.origin
        );
    }, [sections]);

    useEffect(() => {
        publishSectionsLayout();
    }, [publishSectionsLayout]);

    const publishPreviewMode = useCallback(() => {
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
    }, []);

    const publishFeaturesDraft = useCallback(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_FEATURES_PREVIEW_UPDATE',
                payload: featuresDraft,
            },
            window.location.origin
        );
    }, [featuresDraft]);

    useEffect(() => {
        publishFeaturesDraft();
    }, [publishFeaturesDraft]);

    const publishCollectionsDraft = useCallback(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_COLLECTIONS_PREVIEW_UPDATE',
                payload: collectionsDraft,
            },
            window.location.origin
        );
    }, [collectionsDraft]);

    useEffect(() => {
        publishCollectionsDraft();
    }, [publishCollectionsDraft]);

    const navigatePreviewToSection = useCallback((sectionKey) => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                payload: { sectionKey },
            },
            window.location.origin
        );
    }, []);

    useEffect(() => {
        function handlePreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data) {
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_HERO_PART_SELECTED') {
                const part = data.payload?.part;
                if (part === 'title' || part === 'description' || part === 'button') {
                    setActiveHeroConfigPart(part);
                    setSelectedSectionKey('hero');
                    setIsHeroDrawerOpen(true);
                    setIsFeaturesDrawerOpen(false);
                    setIsCollectionsDrawerOpen(false);
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_FEATURES_SECTION_SELECTED') {
                const incomingIndex = data.payload?.itemIndex;
                const parsedIndex = Number.isInteger(incomingIndex)
                    ? incomingIndex
                    : Number.isFinite(Number(incomingIndex))
                      ? Number(incomingIndex)
                      : null;

                setSelectedSectionKey('features');
                setActiveFeatureItemIndex(
                    parsedIndex !== null && parsedIndex >= 0 ? parsedIndex : null
                );
                setIsFeaturesDrawerOpen(true);
                setIsHeroDrawerOpen(false);
                setIsCollectionsDrawerOpen(false);
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_COLLECTIONS_SECTION_SELECTED') {
                const incomingIndex = data.payload?.itemIndex;
                const parsedIndex = Number.isInteger(incomingIndex)
                    ? incomingIndex
                    : Number.isFinite(Number(incomingIndex))
                      ? Number(incomingIndex)
                      : null;

                setSelectedSectionKey('collections');
                setActiveCollectionItemIndex(
                    parsedIndex !== null && parsedIndex >= 0 ? parsedIndex : null
                );
                setIsCollectionsDrawerOpen(true);
                setIsHeroDrawerOpen(false);
                setIsFeaturesDrawerOpen(false);
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_COLLECTIONS_ITEMS_REORDERED') {
                const sourceIndex = Number(data.payload?.sourceIndex);
                const targetIndex = Number(data.payload?.targetIndex);

                if (
                    Number.isInteger(sourceIndex) &&
                    Number.isInteger(targetIndex) &&
                    sourceIndex >= 0 &&
                    targetIndex >= 0
                ) {
                    handleCollectionReorder(sourceIndex, targetIndex);
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_REQUEST_COLLECTIONS_PREVIEW') {
                if (event.source && typeof event.source.postMessage === 'function') {
                    event.source.postMessage(
                        {
                            type: 'TIMLESS_PAGE_BUILDER_COLLECTIONS_PREVIEW_UPDATE',
                            payload: collectionsDraft,
                        },
                        window.location.origin
                    );
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_FEATURES_ITEMS_REORDERED') {
                const sourceIndex = Number(data.payload?.sourceIndex);
                const targetIndex = Number(data.payload?.targetIndex);

                if (
                    Number.isInteger(sourceIndex) &&
                    Number.isInteger(targetIndex) &&
                    sourceIndex >= 0 &&
                    targetIndex >= 0
                ) {
                    handleFeatureReorder(sourceIndex, targetIndex);
                }
                return;
            }

            if (data.type !== 'TIMLESS_PAGE_BUILDER_HERO_POSITION_CHANGED') {
                return;
            }

            const payload = data.payload || {};
            const fields = [
                'text_offset_x',
                'text_offset_y',
                'title_offset_x',
                'title_offset_y',
                'description_offset_x',
                'description_offset_y',
                'button_offset_x',
                'button_offset_y',
            ];

            setHeroDraft((previous) => ({
                ...previous,
                ...fields.reduce((accumulator, field) => {
                    if (Object.prototype.hasOwnProperty.call(payload, field)) {
                        accumulator[field] = Number(payload[field]) || 0;
                    }
                    return accumulator;
                }, {}),
            }));
        }

        window.addEventListener('message', handlePreviewMessage);
        return () => {
            window.removeEventListener('message', handlePreviewMessage);
        };
    }, [collectionsDraft]);

    function handleEditSection(section) {
        setSelectedSectionKey(section.key);
        if (section.key === 'hero') {
            setActiveHeroConfigPart('all');
            setIsHeroDrawerOpen(true);
            setIsFeaturesDrawerOpen(false);
            setIsCollectionsDrawerOpen(false);
            return;
        }

        if (section.key === 'features') {
            setActiveFeatureItemIndex(null);
            setIsFeaturesDrawerOpen(true);
            setIsHeroDrawerOpen(false);
            setIsCollectionsDrawerOpen(false);
            return;
        }

        if (section.key === 'collections') {
            setActiveCollectionItemIndex(null);
            setIsCollectionsDrawerOpen(true);
            setIsHeroDrawerOpen(false);
            setIsFeaturesDrawerOpen(false);
            return;
        }

        setIsHeroDrawerOpen(false);
        setIsFeaturesDrawerOpen(false);
        setIsCollectionsDrawerOpen(false);
    }

    function handleReorderSection(sourceKey, targetKey) {
        setSections((previous) => moveItemByKeys(previous, sourceKey, targetKey, (section) => section.key));
    }

    function handleToggleSectionStatus(sectionKey) {
        setSections((previous) =>
            previous.map((section) =>
                section.key === sectionKey
                    ? {
                          ...section,
                          status: section.status === 'active' ? 'inactive' : 'active',
                      }
                    : section
            )
        );
    }

    function handleHeroDraftChange(field, value) {
        setHeroDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleUploadHeroAsset(field, fileField) {
        return (file) => {
            setHeroUploadFiles((previous) => ({
                ...previous,
                [fileField]: file,
            }));

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    handleHeroDraftChange(field, reader.result);
                }
            };
            reader.readAsDataURL(file);
        };
    }

    function handleFeaturesFieldChange(field, value) {
        setFeaturesDraft((previous) => ({ ...previous, [field]: value }));
    }

    function handleFeatureItemChange(index, field, value) {
        setFeaturesDraft((previous) => ({
            ...previous,
            items: previous.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    }

    function handleFeatureReorder(sourceIndex, targetIndex) {
        setFeaturesDraft((previous) => {
            const nextItems = [...previous.items];
            const [moved] = nextItems.splice(sourceIndex, 1);
            nextItems.splice(targetIndex, 0, moved);
            return { ...previous, items: nextItems };
        });
    }

    function handleFeatureIconUpload(index, file) {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setFeaturesDraft((previous) => ({
                    ...previous,
                    items: previous.items.map((item, itemIndex) =>
                        itemIndex === index
                            ? {
                                  ...item,
                                  // Send the real File to backend; keep data URL only for local preview.
                                  icon: file,
                                  icon_url: reader.result,
                              }
                            : item
                    ),
                }));
            }
        };
        reader.readAsDataURL(file);
    }

    function handleAddFeatureItem() {
        setFeaturesDraft((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    title: `Feature ${previous.items.length + 1}`,
                    short_description: 'Add short description',
                    icon: null,
                    icon_url: null,
                },
            ],
        }));
    }

    function handleRemoveFeatureItem(index) {
        setFeaturesDraft((previous) => {
            if (previous.items.length <= 1) {
                return previous;
            }

            return {
                ...previous,
                items: previous.items.filter((_, itemIndex) => itemIndex !== index),
            };
        });

        setActiveFeatureItemIndex((previous) => {
            if (!Number.isInteger(previous)) {
                return previous;
            }
            if (previous === index) {
                return null;
            }
            if (previous > index) {
                return previous - 1;
            }
            return previous;
        });
    }

    function handleCollectionsFieldChange(field, value) {
        setCollectionsDraft((previous) => ({ ...previous, [field]: value }));
    }

    function handleCollectionItemChange(index, field, value) {
        setCollectionsDraft((previous) => ({
            ...previous,
            items: previous.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    }

    function handleCollectionImageUpload(index, file) {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleCollectionItemChange(index, 'image', reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    function handleAddCollectionItem() {
        setCollectionsDraft((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    name: `Collection ${previous.items.length + 1}`,
                    slug: `collection-${previous.items.length + 1}`,
                    image: '/uploads/heroes/images/hero1.webp',
                },
            ],
        }));
    }

    function handleRemoveCollectionItem(index) {
        setCollectionsDraft((previous) => {
            if (previous.items.length <= 1) {
                return previous;
            }

            return {
                ...previous,
                items: previous.items.filter((_, itemIndex) => itemIndex !== index),
            };
        });

        setActiveCollectionItemIndex((previous) => {
            if (!Number.isInteger(previous)) {
                return previous;
            }
            if (previous === index) {
                return null;
            }
            if (previous > index) {
                return previous - 1;
            }
            return previous;
        });
    }

    function handleCollectionReorder(sourceIndex, targetIndex) {
        setCollectionsDraft((previous) => {
            const nextItems = [...previous.items];
            const [moved] = nextItems.splice(sourceIndex, 1);
            nextItems.splice(targetIndex, 0, moved);
            return { ...previous, items: nextItems };
        });
    }

    async function handleSaveCollectionsToDatabase() {
        setIsSavingCollections(true);

        try {
            const payload = {
                title: collectionsDraft.title,
                titlePosition: collectionsDraft.titlePosition,
                itemsPerView: Number(collectionsDraft.itemsPerView) || 4,
                items: collectionsDraft.items.map((item) => ({
                    id: item.id,
                    name: item.name || '',
                    slug: item.slug || '',
                    image: item.image || null,
                })),
            };

            const saved = await updateCollections(payload);
            if (saved?.section && Array.isArray(saved.items)) {
                setCollectionsDraft((previous) => ({
                    ...previous,
                    title: saved.section.title || previous.title,
                    titlePosition: saved.section.titlePosition || previous.titlePosition,
                    itemsPerView:
                        Number(saved.section.itemsPerView) > 0
                            ? Number(saved.section.itemsPerView)
                            : previous.itemsPerView,
                    items: saved.items.map((item, index) => ({
                        id: item.id,
                        name: item.name || previous.items[index]?.name || '',
                        slug: item.slug || previous.items[index]?.slug || '',
                        image: item.image || previous.items[index]?.image || '',
                    })),
                }));
            }

            toast.success('Collections settings saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save collections settings.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingCollections(false);
        }
    }

    async function handleSaveHeroToDatabase() {
        setIsSavingHero(true);

        const payload = {
            title: heroDraft.title,
            description: heroDraft.description,
            title_display_mode: heroDraft.title_display_mode,
            image_url: heroUploadFiles.image ? '' : heroDraft.image_url,
            video_url: heroUploadFiles.video ? '' : heroDraft.video_url,
            title_font_size: heroDraft.title_font_size,
            title_font_family: heroDraft.title_font_family,
            description_font_size: heroDraft.description_font_size,
            description_font_family: heroDraft.description_font_family,
            text_offset_x: heroDraft.text_offset_x,
            text_offset_y: heroDraft.text_offset_y,
            title_offset_x: heroDraft.title_offset_x,
            title_offset_y: heroDraft.title_offset_y,
            description_offset_x: heroDraft.description_offset_x,
            description_offset_y: heroDraft.description_offset_y,
            button_offset_x: heroDraft.button_offset_x,
            button_offset_y: heroDraft.button_offset_y,
            button_enabled: heroDraft.button_enabled,
            button_url: heroDraft.button_url,
            image: heroUploadFiles.image,
            video: heroUploadFiles.video,
        };

        try {
            let savedHero;

            if (activeHeroId) {
                savedHero = await updateHero(activeHeroId, payload);
            } else {
                const createdHero = await createHero(payload);
                if (createdHero?.id) {
                    setActiveHeroId(createdHero.id);
                }
                savedHero = createdHero;
            }

            if (savedHero) {
                setHeroDraft((previous) => ({
                    ...previous,
                    image_url: savedHero.image_url || previous.image_url,
                    video_url: savedHero.video_url || previous.video_url,
                }));
            }

            setHeroUploadFiles({ image: null, video: null });

            toast.success('Hero settings saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save hero settings.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingHero(false);
        }
    }

    async function handleSaveFeaturesToDatabase() {
        setIsSavingFeatures(true);

        try {
            const existing = await fetchFeatures();
            const existingById = new Map(
                existing.filter((item) => item?.id).map((item) => [Number(item.id), item])
            );

            const usedIds = new Set();

            for (let index = 0; index < featuresDraft.items.length; index += 1) {
                const item = featuresDraft.items[index] || {};
                const payload = {
                    title: item.title || '',
                    short_description: item.short_description || '',
                    description: item.short_description || '',
                    icon: item.icon,
                    sort_order: index,
                    columns_per_view: Number(featuresDraft.columns) || 3,
                    title_font_size: Number(featuresDraft.titleFontSize) || 28,
                    title_font_family: featuresDraft.titleFontFamily || 'instrument-sans',
                    description_font_size: Number(featuresDraft.descriptionFontSize) || 16,
                    description_font_family:
                        featuresDraft.descriptionFontFamily || 'instrument-sans',
                };

                const itemId = Number(item.id);
                if (itemId && existingById.has(itemId)) {
                    const saved = await updateFeature(itemId, payload);
                    usedIds.add(itemId);
                    setFeaturesDraft((previous) => ({
                        ...previous,
                        items: previous.items.map((draftItem, draftIndex) =>
                            draftIndex === index
                                ? {
                                      ...draftItem,
                                      id: saved?.id || draftItem.id,
                                  }
                                : draftItem
                        ),
                    }));
                } else {
                    const created = await createFeature(payload);
                    if (created?.id) {
                        usedIds.add(Number(created.id));
                        setFeaturesDraft((previous) => ({
                            ...previous,
                            items: previous.items.map((draftItem, draftIndex) =>
                                draftIndex === index
                                    ? {
                                          ...draftItem,
                                          id: created.id,
                                      }
                                    : draftItem
                            ),
                        }));
                    }
                }
            }

            for (const feature of existing) {
                const featureId = Number(feature?.id);
                if (featureId && !usedIds.has(featureId)) {
                    await deleteFeature(featureId);
                }
            }

            toast.success('Features settings saved to database.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to save features settings.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingFeatures(false);
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
                <HomePageSectionsCard
                    sections={sections}
                    selectedSectionKey={selectedSectionKey}
                    onEditSection={handleEditSection}
                    onReorderSection={handleReorderSection}
                    onToggleSectionStatus={handleToggleSectionStatus}
                    onNavigatePreview={navigatePreviewToSection}
                />
                <HomePagePreviewCard
                    iframeRef={iframeRef}
                    onIframeLoad={() => {
                        publishHeroDraft();
                        publishSectionsLayout();
                        publishPreviewMode();
                        publishFeaturesDraft();
                        publishCollectionsDraft();
                    }}
                />
            </div>

            <HeroEditorDrawer
                open={isHeroDrawerOpen}
                onOpenChange={setIsHeroDrawerOpen}
                activePart={activeHeroConfigPart}
                value={heroDraft}
                onChange={handleHeroDraftChange}
                onUploadImage={handleUploadHeroAsset('image_url', 'image')}
                onUploadVideo={handleUploadHeroAsset('video_url', 'video')}
                onSave={handleSaveHeroToDatabase}
                isSaving={isSavingHero}
            />

            <FeaturesEditorDrawer
                open={isFeaturesDrawerOpen}
                onOpenChange={setIsFeaturesDrawerOpen}
                value={featuresDraft}
                activeItemIndex={activeFeatureItemIndex}
                onChangeField={handleFeaturesFieldChange}
                onChangeItem={handleFeatureItemChange}
                onUploadIcon={handleFeatureIconUpload}
                onAddItem={handleAddFeatureItem}
                onRemoveItem={handleRemoveFeatureItem}
                onReorderItem={handleFeatureReorder}
                onSave={handleSaveFeaturesToDatabase}
                isSaving={isSavingFeatures}
            />

            <CollectionsEditorDrawer
                open={isCollectionsDrawerOpen}
                onOpenChange={setIsCollectionsDrawerOpen}
                value={collectionsDraft}
                activeItemIndex={activeCollectionItemIndex}
                onChangeField={handleCollectionsFieldChange}
                onChangeItem={handleCollectionItemChange}
                onUploadImage={handleCollectionImageUpload}
                onAddItem={handleAddCollectionItem}
                onRemoveItem={handleRemoveCollectionItem}
                onReorderItem={handleCollectionReorder}
                onSave={handleSaveCollectionsToDatabase}
                isSaving={isSavingCollections}
            />
        </DndProvider>
    );
}
