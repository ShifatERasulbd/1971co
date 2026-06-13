import { ExternalLink, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePagePreviewCard({ iframeRef, onIframeLoad }) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="size-4" />
                        Full Homepage View
                    </CardTitle>
                    <CardDescription>
                        Live preview of the full frontend home page used by your page builder.
                    </CardDescription>
                </div>

                <Button asChild size="sm">
                    <a href="/" target="_blank" rel="noreferrer">
                        Open in New Tab
                        <ExternalLink className="ml-2 size-4" />
                    </a>
                </Button>
            </CardHeader>

            <CardContent>
                <div className="overflow-hidden rounded-md border border-border bg-muted">
                    <iframe
                        title="Timeless Homepage Preview"
                        src="/"
                        ref={iframeRef}
                        onLoad={onIframeLoad}
                        className="h-[820px] w-full bg-white"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
