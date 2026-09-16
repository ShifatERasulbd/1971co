let isInitialized = false;

export function initializeMicrosoftClarity(projectId) {
    if (!projectId || typeof projectId !== 'string') {
        return false;
    }

    if (isInitialized || typeof window === 'undefined') {
        return isInitialized;
    }

    try {
        /* eslint-disable */
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', projectId);
        /* eslint-enable */

        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Microsoft Clarity: Failed to initialize', error);
        return false;
    }
}

export function isMicrosoftClarityInitialized() {
    return isInitialized;
}
