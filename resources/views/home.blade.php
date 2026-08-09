<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <!-- Google Tag Manager -->
        <script>
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-M9XV5CWZ');
        </script>
        <!-- End Google Tag Manager -->

        @php
            $metaTitle = trim((string) ($meta['title'] ?? config('app.name', '1971Co')));
            $metaDescription = trim((string) ($meta['description'] ?? 'Discover premium fashion and personalized apparel.'));
            $metaImage = trim((string) ($meta['image'] ?? url('/favicon.ico')));
            $metaUrl = trim((string) ($meta['url'] ?? url()->current()));
            $metaType = trim((string) ($meta['type'] ?? 'website'));
        @endphp

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="google-client-id" content="{{ config('services.google.client_id', '') }}">
        <meta name="description" content="{{ $metaDescription }}">

        <meta property="og:type" content="{{ $metaType }}">
        <meta property="og:title" content="{{ $metaTitle }}">
        <meta property="og:description" content="{{ $metaDescription }}">
        <meta property="og:image" content="{{ $metaImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:url" content="{{ $metaUrl }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $metaTitle }}">
        <meta name="twitter:description" content="{{ $metaDescription }}">
        <meta name="twitter:image" content="{{ $metaImage }}">

        <link rel="canonical" href="{{ $metaUrl }}">

        <title>{{ $metaTitle }}</title>
        <link id="app-favicon" rel="icon" type="image/x-icon" href="/favicon.ico">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800,900" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="bg-[#f4f2ed] text-zinc-950">
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M9XV5CWZ"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        <div id="app"></div>
    </body>
</html>