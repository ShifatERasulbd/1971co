export const CANVAS_WIDTH = 555;
export const CANVAS_HEIGHT = 422;
export const PRODUCT_PRICE = '$49.99';
export const HISTORY_LIMIT = 40;
export const SERIALIZED_PROPS = ['objectId', 'viewId', 'layerType', 'layerName', 'designId', 'sourceName', 'imageSource', 'shapeKind', 'isBaseImage', 'hiddenByUser', 'curveEnabled', 'curveAmount'];

export const FONT_OPTIONS = ['Bebas Neue', 'Montserrat', 'Oswald', 'Poppins', 'Georgia', 'Arial'];

export const PRODUCT_COLORS = [
    { id: 'black', label: 'Black', value: '#111111' },
    { id: 'navy', label: 'Navy', value: '#17336f' },
    { id: 'red', label: 'Red', value: '#c91d3b' },
    { id: 'gray', label: 'Gray', value: '#c7c7cc' },
    { id: 'white', label: 'White', value: '#ffffff' },
];

export const PRODUCT_VIEWS = [
    {
        id: 'front',
        label: 'Front',
        url: '/storage/product_personalization/product_1/front.jpeg',
    },
    {
        id: 'back',
        label: 'Back',
        url: '/storage/product_personalization/product_1/back.jpeg',
    },
];

export const DESIGN_AREAS = {
    front: {
        left: 0.41,
        top: 0.35,
        width: 0.19,
        height: 0.438,
    },
    back: {
        
         left: 0.41,
        top: 0.35,
        width: 0.19,
        height: 0.438,
    },
};

const DESIGN_GUIDE_AREAS = {
    front: {
        left: 0.41,
        top: 0.35,
        width: 0.19,
        height: 0.438,
    },
    back: {
         left: 0.41,
        top: 0.35,
        width: 0.19,
        height: 0.438,
    },
};

const RESPONSIVE_GUIDE_AREAS = {
    mobile: {
            front: {
            left: 0.41,
            top: 0.35,
            width: 0.19,
            height: 0.438,
        },
        back: {
            left: 0.41,
            top: 0.35,
            width: 0.19,
            height: 0.438,
        },
    },
    tablet: {
        front: {
            left: 0.41,
            top: 0.35,
            width: 0.19,
            height: 0.438,
        },
        back: {
            left: 0.41,
            top: 0.35,
            width: 0.19,
            height: 0.438,
        },
    },
    desktop: {
        front: DESIGN_GUIDE_AREAS.front,
        back: DESIGN_GUIDE_AREAS.back,
    },
};

function getGuideBreakpoint(canvasWidth = CANVAS_WIDTH) {
    if (canvasWidth <= 420) {
        return 'mobile';
    }

    if (canvasWidth <= 700) {
        return 'tablet';
    }

    return 'desktop';
}

export function getDesignGuideArea(viewId, canvasWidth = CANVAS_WIDTH) {
    const breakpoint = getGuideBreakpoint(canvasWidth);
    const responsiveSet = RESPONSIVE_GUIDE_AREAS[breakpoint] || RESPONSIVE_GUIDE_AREAS.desktop;

    return responsiveSet[viewId] || responsiveSet.front || DESIGN_GUIDE_AREAS.front;
}

