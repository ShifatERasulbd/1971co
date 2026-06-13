import { MapPin } from 'lucide-react';

import { featuresFontClass } from '../../utils/typography';

const locationLabel = '70 Washington Square S, New York, NY 10012, USA';
const mapEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=-74.0058%2C40.7288%2C-73.9944%2C40.7358&layer=mapnik&marker=40.7323%2C-73.9981';

export default function ContactLocationMapSection() {
    return (
        <section className={`${featuresFontClass} bg-white py-14 sm:py-18 lg:py-24`}>
            <div className="mx-auto w-full max-w-[1920px] px-0">
                <div className="relative isolate overflow-hidden border-y border-zinc-200 bg-zinc-100">
                    <iframe
                        title="Timeless location map"
                        src={mapEmbedUrl}
                        loading="lazy"
                        className="h-[340px] w-full grayscale-[0.08] sm:h-[420px] lg:h-[510px]"
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                 

                    
                </div>
            </div>
        </section>
    );
}
