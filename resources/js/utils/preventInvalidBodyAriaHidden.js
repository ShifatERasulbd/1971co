let isPatched = false;

/**
 * Prevent invalid aria-hidden=true on <body>.
 * Some UI libraries may attempt this during portal/modal lifecycles,
 * which is blocked by browsers and triggers noisy accessibility warnings.
 */
export function preventInvalidBodyAriaHidden() {
    if (isPatched || typeof document === 'undefined' || typeof Element === 'undefined') {
        return;
    }

    const body = document.body;
    if (!body) {
        return;
    }

    isPatched = true;

    const originalSetAttribute = Element.prototype.setAttribute;

    Element.prototype.setAttribute = function patchedSetAttribute(name, value) {
        if (
            this === body
            && typeof name === 'string'
            && name.toLowerCase() === 'aria-hidden'
            && String(value).toLowerCase() === 'true'
        ) {
            return;
        }

        return originalSetAttribute.call(this, name, value);
    };

    if (body.getAttribute('aria-hidden') === 'true') {
        body.removeAttribute('aria-hidden');
    }
}
