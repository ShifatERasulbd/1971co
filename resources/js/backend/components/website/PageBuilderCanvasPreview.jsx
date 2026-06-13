import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function resolveAlignment(alignment) {
    if (alignment === 'center') {
        return 'text-center';
    }
    if (alignment === 'right') {
        return 'text-right';
    }
    return 'text-left';
}

function TextSingleBlock({ block }) {
    return (
        <p
            className={`${resolveAlignment(block.align)} leading-tight`}
            style={{
                fontFamily: block.fontFamily,
                fontSize: `${block.fontSize}px`,
                fontWeight: block.fontWeight,
                color: block.color,
            }}
        >
            {block.text}
        </p>
    );
}

function TextDoubleBlock({ block }) {
    return (
        <div className={`${resolveAlignment(block.align)} space-y-2 leading-tight`}>
            <p
                style={{
                    fontFamily: block.fontFamily,
                    fontSize: `${block.fontSize}px`,
                    fontWeight: block.fontWeight,
                    color: block.color,
                }}
            >
                {block.lineOne}
            </p>
            <p
                style={{
                    fontFamily: block.fontFamily,
                    fontSize: `${Math.max(14, block.fontSize - 6)}px`,
                    fontWeight: block.fontWeight,
                    color: block.color,
                }}
            >
                {block.lineTwo}
            </p>
        </div>
    );
}

function ImageBlock({ block }) {
    return (
        <img
            src={block.src}
            alt="Builder image block"
            className="w-full rounded-md border border-border object-cover"
            style={{ height: `${block.height}px`, objectPosition: block.objectPosition }}
        />
    );
}

function VideoBlock({ block }) {
    return (
        <video
            src={block.src}
            controls
            className="w-full rounded-md border border-border bg-black object-cover"
            style={{ height: `${block.height}px`, objectPosition: block.objectPosition }}
        />
    );
}

export default function PageBuilderCanvasPreview({ blocks }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Components Canvas</CardTitle>
                <CardDescription>
                    Live canvas preview for blocks added from the custom page builder controls.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-6 rounded-md border border-border bg-white p-5">
                    {blocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Add components from the left panel to render them here.</p>
                    ) : null}

                    {blocks.map((block) => {
                        if (block.type === 'text-single') {
                            return <TextSingleBlock key={block.id} block={block} />;
                        }

                        if (block.type === 'text-double') {
                            return <TextDoubleBlock key={block.id} block={block} />;
                        }

                        if (block.type === 'image') {
                            return <ImageBlock key={block.id} block={block} />;
                        }

                        if (block.type === 'video') {
                            return <VideoBlock key={block.id} block={block} />;
                        }

                        return null;
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
