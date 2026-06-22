import { ExternalLink, Eye } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CommunityPagePreviewCard = forwardRef((props, ref) => {
    return (
        <Card className="h-full w-full">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="size-4" />
                        Community Page View
                    </CardTitle>
                    <CardDescription>
                        Live preview of the Together We Grow page managed by this page builder.
                    </CardDescription>
                </div>

                <Button asChild size="sm">
                    <a href="/together-we-grow" target="_blank" rel="noreferrer">
                        Open in New Tab
                        <ExternalLink className="ml-2 size-4" />
                    </a>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-md border border-border bg-muted">
                    <iframe
                        ref={ref}
                        src="/together-we-grow"
                        title="Community Page Preview"
                        className="h-[820px] w-full bg-white"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
            </CardContent>
        </Card>
    );
});

CommunityPagePreviewCard.displayName = 'CommunityPagePreviewCard';

export default CommunityPagePreviewCard;
