import { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

import CommunitySectionEditorDrawer from '@/components/website/CommunitySectionEditorDrawer';
import CommunityPagePreviewCard from '@/components/website/CommunityPagePreviewCard';
import CommunityPageSectionsCard from '@/components/website/CommunityPageSectionsCard';
import { communitySections } from '@/components/website/communityPageBuilderData';
import { useAppContext } from '@/context/AppContext';

function moveItemByKey(items, sourceKey, targetKey) {
    const sourceIndex = items.findIndex((item) => item.key === sourceKey);
    const targetIndex = items.findIndex((item) => item.key === targetKey);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}

export default function CommunityPageBuilder() {
    const { setPageTitle } = useAppContext();
    const iframeRef = useRef(null);

    const [sections, setSections] = useState(communitySections);
    const [selectedSectionKey, setSelectedSectionKey] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const selectedSection = sections.find((section) => section.key === selectedSectionKey) || null;

    useEffect(() => {
        setPageTitle('Community Page Builder');
    }, [setPageTitle]);

    const publishSectionsLayout = () => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        const activeSections = sections.filter((section) => section.status === 'active');

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_TOGETHER_LAYOUT_UPDATE',
                payload: {
                    order: activeSections.map((section) => section.key),
                    sections,
                },
            },
            window.location.origin,
        );
    };

    useEffect(() => {
        publishSectionsLayout();
    }, [sections]);

    useEffect(() => {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_PREVIEW_MODE',
                payload: { enabled: true },
            },
            window.location.origin,
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

            if (data.type === 'TIMLESS_PAGE_BUILDER_TOGETHER_SECTION_SELECTED') {
                const sectionKey = String(data?.payload?.sectionKey || '');
                if (!sectionKey) {
                    return;
                }

                setSelectedSectionKey(sectionKey);
                setIsEditorOpen(true);
            }
        }

        window.addEventListener('message', handlePreviewMessage);
        return () => {
            window.removeEventListener('message', handlePreviewMessage);
        };
    }, []);

    function handleEditSection(section) {
        setSelectedSectionKey(section.key);
        setIsEditorOpen(true);
    }

    function handleReorderSection(sourceKey, targetKey) {
        setSections((previous) => moveItemByKey(previous, sourceKey, targetKey));
    }

    function handleToggleSectionStatus(sectionKey) {
        setSections((previous) =>
            previous.map((section) =>
                section.key === sectionKey
                    ? { ...section, status: section.status === 'active' ? 'inactive' : 'active' }
                    : section,
            ),
        );
    }

    function handleNavigatePreview(sectionKey) {
        const target = iframeRef.current?.contentWindow;
        if (!target) {
            return;
        }

        target.postMessage(
            {
                type: 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION',
                payload: { sectionKey },
            },
            window.location.origin,
        );
    }

    function handleChangeSelectedSectionField(field, value) {
        if (!selectedSectionKey) {
            return;
        }

        setSections((previous) =>
            previous.map((section) =>
                section.key === selectedSectionKey
                    ? {
                          ...section,
                          [field]: value,
                      }
                    : section,
            ),
        );
    }

    function handleSaveSection() {
        if (!selectedSection) {
            return;
        }

        // Save to database
        fetch('/api/community-page-sections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: JSON.stringify(selectedSection),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to save section');
                }
                return response.json();
            })
            .then(() => {
                toast.success('Community component saved successfully');
                // Refresh the preview to show updated data
                publishSectionsLayout();
            })
            .catch((error) => {
                console.error('Error saving section:', error);
                toast.error('Failed to save community component');
            });
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <CommunityPageSectionsCard
                        sections={sections}
                        selectedSectionKey={selectedSectionKey}
                        onEditSection={handleEditSection}
                        onReorderSection={handleReorderSection}
                        onToggleSectionStatus={handleToggleSectionStatus}
                        onNavigatePreview={handleNavigatePreview}
                    />

                    <CommunityPagePreviewCard ref={iframeRef} />
                </div>
            </div>

            <CommunitySectionEditorDrawer
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                section={selectedSection}
                onChangeField={handleChangeSelectedSectionField}
                onSave={handleSaveSection}
            />
        </DndProvider>
    );
}
