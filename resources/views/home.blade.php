<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @php
            $metaTitle = trim((string) ($meta['title'] ?? config('app.name', '1971Co')));
            $metaDescription = trim((string) ($meta['description'] ?? 'Discover premium fashion and personalized apparel.'));
            $metaImage = trim((string) ($meta['image'] ?? url('/favicon.ico')));
            $metaUrl = trim((string) ($meta['url'] ?? url()->current()));
            $metaType = trim((string) ($meta['type'] ?? 'website'));
        @endphp

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $metaDescription }}">

        <meta property="og:type" content="{{ $metaType }}">
        <meta property="og:title" content="{{ $metaTitle }}">
        <meta property="og:description" content="{{ $metaDescription }}">
        <meta property="og:image" content="{{ $metaImage }}">
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
        <div id="app"></div>
    </body>
</html>