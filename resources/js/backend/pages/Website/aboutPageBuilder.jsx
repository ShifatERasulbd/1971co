import { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppContext } from '@/context/AppContext';
import AboutPagePreviewCard from '@/components/website/AboutPagePreviewCard';
import AboutPageSectionsCard from '@/components/website/AboutPageSectionsCard';
import { aboutSections } from '@/components/website/aboutPageBuilderData';

export default function AboutPageBuilder() {
    const { setPageTitle } = useAppContext();
    const iframeRef = useRef(null);
    const [sections, setSections] = useState(aboutSections);
    const [selectedSectionKey, setSelectedSectionKey] = useState(null);

    useEffect(() => {
        setPageTitle('About Page Builder');
    }, [setPageTitle]);

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

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                <div className="min-w-0">
                    <AboutPageSectionsCard
                        sections={sections}
                        selectedSectionKey={selectedSectionKey}
                        onSectionSelect={setSelectedSectionKey}
                        onStatusToggle={handleSectionStatusToggle}
                        onReorder={handleSectionReorder}
                    />
                </div>

                <div className="min-w-0">
                    <AboutPagePreviewCard ref={iframeRef} />
                </div>
            </div>
        </DndProvider>
    );
}
