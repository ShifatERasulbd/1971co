import {
    BadgeCheck,
    Droplets,
    HandHeart,
    Leaf,
    Package,
    RefreshCcw,
    Ruler,
    ShieldCheck,
    Shirt,
    Sparkles,
    Truck,
    UserRound,
    Wind,
} from 'lucide-react';
import { createElement as h } from 'react';

// Custom SVG Icons
function WarmDurableIcon(props) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', ...props },
        h('path', { d: 'M12 2v6M12 16v6M6 8l-4-4M22 8l4-4M4 14l-4 4M20 14l4 4', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
}

function HalfZipperIcon(props) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', ...props },
        h('path', { d: 'M8 4h8M8 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M9 9h6M10 4v1M14 4v1', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
}

function FullZipperIcon(props) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.7', ...props },
        h('path', { d: 'M12 3v18', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M10 6h2M12 8h2M10 10h2M12 12h2M10 14h2M12 16h2', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M11 17.5h2v2h-2z', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
}

function PocketIcon(props) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', ...props },
        h('path', { d: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2M8 7h8M8 11h6', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
}

function GSMIcon(props) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', ...props },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('path', { d: 'M12 7v10M8 12h8', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
}

export const productFeatureIconRegistry = {
    badgeCheck: BadgeCheck,
    csm180: GSMIcon,
    droplets: Droplets,
    fullZipper: FullZipperIcon,
    halfZipper: HalfZipperIcon,
    leaf: Leaf,
    longLasting: ShieldCheck,
    lycraRib: Shirt,
    package: Package,
    refreshCcw: RefreshCcw,
    ruler: Ruler,
    shieldCheck: ShieldCheck,
    shirt: Shirt,
    sidePocket: PocketIcon,
    softComfortable: HandHeart,
    sparkles: Sparkles,
    truck: Truck,
    userRound: UserRound,
    warmDurable: WarmDurableIcon,
    wind: Wind,
};

export const productFeatureIconOptions = [
    { value: 'lycraRib', label: 'Lycra Rib' },
    { value: 'fullZipper', label: 'Full-Zipper' },
    { value: 'halfZipper', label: 'Half-Zipper' },
    { value: 'softComfortable', label: 'Soft & Comfortable' },
    { value: 'longLasting', label: 'Long-Lasting Quality' },
    { value: 'sidePocket', label: 'Side Pocket' },
    { value: 'csm180', label: '180+ GSM' },
    { value: 'warmDurable', label: 'Warm & Durable Inner Lining' },
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'shieldCheck', label: 'Shield Check' },
    { value: 'shirt', label: 'Shirt' },
    { value: 'ruler', label: 'Ruler' },
    { value: 'truck', label: 'Truck' },
    { value: 'refreshCcw', label: 'Refresh' },
    { value: 'leaf', label: 'Leaf' },
    { value: 'droplets', label: 'Droplets' },
    { value: 'wind', label: 'Wind' },
    { value: 'package', label: 'Package' },
    { value: 'badgeCheck', label: 'Badge Check' },
    { value: 'userRound', label: 'User Round' },
];

export function resolveProductFeatureIcon(iconName) {
    return productFeatureIconRegistry[iconName] || Sparkles;
}
