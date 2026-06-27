const COUNTRY_ALIASES = {
    'UNITED STATES': 'US',
    USA: 'US',
    'UNITED STATES OF AMERICA': 'US',
    CANADA: 'CA',
    BANGLADESH: 'BD',
    INDIA: 'IN',
    PAKISTAN: 'PK',
    'UNITED KINGDOM': 'GB',
    'GREAT BRITAIN': 'GB',
    ENGLAND: 'GB',
    AUSTRALIA: 'AU',
    'NEW ZEALAND': 'NZ',
    GERMANY: 'DE',
    FRANCE: 'FR',
    ITALY: 'IT',
    SPAIN: 'ES',
    NETHERLANDS: 'NL',
    SWEDEN: 'SE',
    NORWAY: 'NO',
    DENMARK: 'DK',
    SWITZERLAND: 'CH',
    JAPAN: 'JP',
    CHINA: 'CN',
    SINGAPORE: 'SG',
    'UNITED ARAB EMIRATES': 'AE',
    'SAUDI ARABIA': 'SA',
};

export function normalizeCountryCode(country) {
    const value = String(country || '').trim().toUpperCase();

    if (!value) {
        return 'US';
    }

    if (value.length === 2) {
        return value;
    }

    return COUNTRY_ALIASES[value] || 'US';
}

export function calculateShippingCost({ country, state } = {}, subtotal = 0, courier = 'shipstation') {
    const normalizedCountry = normalizeCountryCode(country);
    const normalizedState = String(state || '').trim().toUpperCase();
    const subtotalValue = Number(subtotal || 0);

    if (subtotalValue <= 0) {
        return 0;
    }

    if (courier === 'ups') {
        // Frontend fallback only; authoritative UPS charge comes from /api/public/shipping/quote.
        if (normalizedCountry === 'US') {
            return normalizedState === 'AK' || normalizedState === 'HI' ? 14.99 : 8.99;
        }

        if (normalizedCountry === 'CA') {
            return 16.99;
        }

        return 24.99;
    }

    if (normalizedCountry === 'US') {
        if (normalizedState === 'AK' || normalizedState === 'HI') {
            return 14.99;
        }

        return 8.99;
    }

    if (normalizedCountry === 'CA') {
        return 16.99;
    }

    if (normalizedCountry === 'GB') {
        return 19.99;
    }

    return 24.99;
}
