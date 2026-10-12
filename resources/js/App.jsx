function DocumentBrandingManager() {
    const { pathname } = useLocation();
    const [settings, setSettings] = React.useState(() => getSettingsPayload() || {});

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSettings(payload || {});
        });

        setSettings(getSettingsPayload() || {});
        return unsubscribe;
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const pageLabel = resolvePageLabel(pathname);
        document.title = `${pageLabel} | ${BRAND_NAME}`;

        const favicon = normalizeAssetPath(settings?.favicon || settings?.header_logo || '');
        if (favicon) {
            const faviconLink = ensureFaviconLink();
            faviconLink.href = favicon;
        }

        const consent = getConsent();
        if (consent.targeting) {
            trackPageView(pathname);
        }
        if (consent.social) {
            trackPixelPageView();
        }
    }, [pathname, settings]);

    useEffect(() => {
        const gaId = settings?.google_analytics_id || settings?.ga_measurement_id || '';
        const clarityId = settings?.microsoft_clarity_id || '';

        const applyCurrentConsent = () => {
            const consent = getConsent();

            // 1. Targeting -> Google Analytics
            if (gaId) {
                // CONSENT: load GA only when allowed; the flag is set only if it really loaded
                if (!window.__gaInitialized && consent.targeting) {
                    window.__gaInitialized = initializeGoogleAnalytics(gaId);
                }
                if (consent.targeting) {
                    enableGoogleAnalytics();
                } else {
                    disableGoogleAnalytics();
                    deleteCookies({
                        names: ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw', '_gcl_dc', 'FPID'],
                        prefixes: ['_ga_', '_gac_', '_gat_', '_dc_gtm_'],
                    });
                }
            }

            // 2. Performance -> Microsoft Clarity
            if (clarityId) {
                // CONSENT: load Clarity only when allowed; the flag is set only if it really loaded
                if (!window.__clarityInitialized && consent.performance) {
                    window.__clarityInitialized = initializeMicrosoftClarity(clarityId);
                }
                if (consent.performance) {
                    grantMicrosoftClarity();
                } else {
                    revokeMicrosoftClarity();
                    deleteCookies({ names: ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'SM'] });
                }
            }

            // 3. Social -> Meta Pixel
            const pixelId = window.__fbPixelId;
            if (pixelId) {
                if (!window.__fbPixelInitialized) {
                    initializeFacebookPixel(pixelId);
                    window.__fbPixelInitialized = true;
                }
                if (consent.social) {
                    grantFacebookPixel();
                } else {
                    revokeFacebookPixel();
                    deleteCookies({ names: ['_fbp', '_fbc'] });
                }
            }
        };

        applyCurrentConsent();

        const unsubscribeConsent = onConsentChange(() => {
            applyCurrentConsent();
        });

        return () => {
            unsubscribeConsent();
        };
    }, [settings]);

    useEffect(() => {
        let isCancelled = false;

        fetch('/api/public/facebook-pixel-config')
            .then((response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (isCancelled || !payload?.pixelId) {
                    return;
                }

                window.__fbPixelId = payload.pixelId;
                const consent = getConsent();
                initializeFacebookPixel(payload.pixelId);
                window.__fbPixelInitialized = true;

                if (consent.social) {
                    grantFacebookPixel();
                    trackPixelPageView();
                } else {
                    revokeFacebookPixel();
                }
            })
            .catch(() => {});

        return () => {
            isCancelled = true;
        };
    }, []);

    return null; // CONSENT: this function had no return statement
}