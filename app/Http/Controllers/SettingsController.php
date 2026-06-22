<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class SettingsController extends Controller
{
    public function publicBestSellersSection(): JsonResponse
    {
        return response()->json($this->resolveBestSellersSectionConfig());
    }

    public function bestSellersSection(): JsonResponse
    {
        return response()->json($this->resolveBestSellersSectionConfig());
    }

    public function updateBestSellersSection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'required|integer|min:1|max:6',
        ]);

        $setting = Settings::orderBy('id', 'desc')->first();
        if (! $setting) {
            $setting = Settings::create(['payload' => []]);
        }

        $payload = is_array($setting->payload) ? $setting->payload : [];
        $frontendUtils = is_array($payload['frontend_utils'] ?? null) ? $payload['frontend_utils'] : [];

        $frontendUtils['best_sellers_section'] = [
            'title' => trim((string) $validated['title']) ?: 'Best Sellers',
            'position' => (int) $validated['position'],
        ];

        $payload['frontend_utils'] = $frontendUtils;
        $setting->update(['payload' => $payload]);

        return response()->json($frontendUtils['best_sellers_section']);
    }

    public function publicLatest(): JsonResponse
    {
        $setting = Settings::orderBy('id', 'desc')->first();

        return response()->json([
            'payload' => is_array($setting?->payload) ? $setting->payload : [],
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json(Settings::orderBy('id', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->normalizeJsonFields($request, ['social_media', 'frontend_utils']);
        $this->normalizeEmptyStringFields($request, ['email']);

        $validated = $request->validate([
            'header_logo_existing' => 'nullable|string|max:2048',
            'footer_logo_existing' => 'nullable|string|max:2048',
            'shop_menu_image_existing' => 'nullable|string|max:2048',
            'header_logo_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'footer_logo_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'shop_menu_image_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,avif|max:4096',
            'social_media' => 'nullable|array',
            'social_media.*.name' => 'nullable|string|max:255',
            'social_media.*.link' => 'nullable|string|max:2048',
            'social_media.*.icon' => 'nullable|string|max:2048',
            'social_icon_files' => 'nullable|array',
            'social_icon_files.*' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:4000',
            'currency' => 'nullable|string|max:50',
            'frontend_utils' => 'nullable|array',
            'frontend_utils.timeless_font_family' => 'nullable|string|max:255',
            'frontend_utils.features_font_family' => 'nullable|string|max:255',
            'frontend_utils.hero_default_font_family' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_options' => 'nullable|array',
            'frontend_utils.hero_font_family_options.*.label' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_options.*.value' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_css_map' => 'nullable|array',
        ]);

        $payload = $this->buildPayload($request, $validated, null);

        $setting = Settings::create([
            'payload' => $payload,
        ]);

        return response()->json($setting, 201);
    }

    public function show(Settings $setting): JsonResponse
    {
        return response()->json($setting);
    }

    public function update(Request $request, Settings $setting): JsonResponse
    {
        $this->normalizeJsonFields($request, ['social_media', 'frontend_utils']);
        $this->normalizeEmptyStringFields($request, ['email']);

        $validated = $request->validate([
            'header_logo_existing' => 'nullable|string|max:2048',
            'footer_logo_existing' => 'nullable|string|max:2048',
            'shop_menu_image_existing' => 'nullable|string|max:2048',
            'header_logo_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'footer_logo_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'shop_menu_image_file' => 'nullable|image|mimes:jpeg,jpg,png,webp,avif|max:4096',
            'social_media' => 'nullable|array',
            'social_media.*.name' => 'nullable|string|max:255',
            'social_media.*.link' => 'nullable|string|max:2048',
            'social_media.*.icon' => 'nullable|string|max:2048',
            'social_icon_files' => 'nullable|array',
            'social_icon_files.*' => 'nullable|image|mimes:jpeg,jpg,png,webp,svg,avif|max:4096',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:4000',
            'currency' => 'nullable|string|max:50',
            'frontend_utils' => 'nullable|array',
            'frontend_utils.timeless_font_family' => 'nullable|string|max:255',
            'frontend_utils.features_font_family' => 'nullable|string|max:255',
            'frontend_utils.hero_default_font_family' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_options' => 'nullable|array',
            'frontend_utils.hero_font_family_options.*.label' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_options.*.value' => 'nullable|string|max:255',
            'frontend_utils.hero_font_family_css_map' => 'nullable|array',
        ]);

        $payload = $this->buildPayload($request, $validated, $setting);

        $setting->update([
            'payload' => $payload,
        ]);

        return response()->json($setting->fresh());
    }

    public function destroy(Settings $setting): JsonResponse
    {
        $payload = $setting->payload ?? [];

        if (is_array($payload)) {
            $this->deleteUploadedFile($payload['header_logo'] ?? null);
            $this->deleteUploadedFile($payload['footer_logo'] ?? null);
            $this->deleteUploadedFile($payload['shop_menu_image'] ?? null);

            $socialMedia = is_array($payload['social_media'] ?? null) ? $payload['social_media'] : [];
            foreach ($socialMedia as $item) {
                if (is_array($item)) {
                    $this->deleteUploadedFile($item['icon'] ?? null);
                }
            }
        }

        $setting->delete();

        return response()->json(['message' => 'Settings deleted successfully']);
    }

    private function buildPayload(Request $request, array $validated, ?Settings $existing): array
    {
        $existingPayload = is_array($existing?->payload) ? $existing->payload : [];

        $headerLogo = $validated['header_logo_existing']
            ?? ($existingPayload['header_logo'] ?? '');
        if ($request->hasFile('header_logo_file')) {
            $headerLogo = $this->storeUploadedFileToPublic($request->file('header_logo_file'), 'uploads/settings/logos');
            $this->deleteUploadedFile($existingPayload['header_logo'] ?? null);
        }

        $footerLogo = $validated['footer_logo_existing']
            ?? ($existingPayload['footer_logo'] ?? '');
        if ($request->hasFile('footer_logo_file')) {
            $footerLogo = $this->storeUploadedFileToPublic($request->file('footer_logo_file'), 'uploads/settings/logos');
            $this->deleteUploadedFile($existingPayload['footer_logo'] ?? null);
        }

        $shopMenuImage = $validated['shop_menu_image_existing']
            ?? ($existingPayload['shop_menu_image'] ?? '');
        if ($request->hasFile('shop_menu_image_file')) {
            $shopMenuImage = $this->storeUploadedFileToPublic($request->file('shop_menu_image_file'), 'uploads/category');
            $this->deleteUploadedFile($existingPayload['shop_menu_image'] ?? null);
        }

        $socialMedia = is_array($validated['social_media'] ?? null) ? $validated['social_media'] : [];
        $existingSocial = is_array($existingPayload['social_media'] ?? null) ? $existingPayload['social_media'] : [];

        $normalizedSocial = [];
        foreach ($socialMedia as $index => $item) {
            $row = is_array($item) ? $item : [];
            $existingIcon = is_array($existingSocial[$index] ?? null) ? ($existingSocial[$index]['icon'] ?? '') : '';
            $icon = is_string($row['icon'] ?? null) ? $row['icon'] : $existingIcon;

            if ($request->hasFile("social_icon_files.$index")) {
                $icon = $this->storeUploadedFileToPublic($request->file("social_icon_files.$index"), 'uploads/settings/social');
                $this->deleteUploadedFile($existingIcon);
            }

            $normalizedSocial[] = [
                'name' => (string) ($row['name'] ?? ''),
                'link' => (string) ($row['link'] ?? ''),
                'icon' => $icon,
            ];
        }

        return [
            'header_logo' => $headerLogo,
            'footer_logo' => $footerLogo,
            'shop_menu_image' => $shopMenuImage,
            'email' => (string) ($validated['email'] ?? ($existingPayload['email'] ?? '')),
            'location' => (string) ($validated['location'] ?? ($existingPayload['location'] ?? '')),
            'currency' => (string) ($validated['currency'] ?? ($existingPayload['currency'] ?? '')),
            'social_media' => $normalizedSocial,
            'frontend_utils' => $this->normalizeFrontendUtils(
                is_array($validated['frontend_utils'] ?? null)
                    ? $validated['frontend_utils']
                    : (is_array($existingPayload['frontend_utils'] ?? null) ? $existingPayload['frontend_utils'] : []),
            ),
        ];
    }

    private function normalizeFrontendUtils(array $frontendUtils): array
    {
        $fontOptions = is_array($frontendUtils['hero_font_family_options'] ?? null)
            ? $frontendUtils['hero_font_family_options']
            : [];

        $normalizedOptions = array_values(array_filter(array_map(static function ($item) {
            if (! is_array($item)) {
                return null;
            }

            $label = trim((string) ($item['label'] ?? ''));
            $value = trim((string) ($item['value'] ?? ''));

            if ($label === '' || $value === '') {
                return null;
            }

            return [
                'label' => $label,
                'value' => $value,
            ];
        }, $fontOptions)));

        $cssMap = is_array($frontendUtils['hero_font_family_css_map'] ?? null)
            ? $frontendUtils['hero_font_family_css_map']
            : [];

        $normalizedCssMap = [];
        foreach ($cssMap as $key => $value) {
            if (! is_string($key) || trim($key) === '') {
                continue;
            }
            if (! is_string($value) || trim($value) === '') {
                continue;
            }

            $normalizedCssMap[trim($key)] = trim($value);
        }

        return [
            'timeless_font_family' => trim((string) ($frontendUtils['timeless_font_family'] ?? '')),
            'features_font_family' => trim((string) ($frontendUtils['features_font_family'] ?? '')),
            'hero_default_font_family' => trim((string) ($frontendUtils['hero_default_font_family'] ?? '')),
            'hero_font_family_options' => $normalizedOptions,
            'hero_font_family_css_map' => $normalizedCssMap,
            'best_sellers_section' => [
                'title' => trim((string) ($frontendUtils['best_sellers_section']['title'] ?? 'Best Sellers')),
                'position' => max(1, min(6, (int) ($frontendUtils['best_sellers_section']['position'] ?? 3))),
            ],
        ];
    }

    private function resolveBestSellersSectionConfig(): array
    {
        $setting = Settings::orderBy('id', 'desc')->first();
        $payload = is_array($setting?->payload) ? $setting->payload : [];
        $frontendUtils = is_array($payload['frontend_utils'] ?? null) ? $payload['frontend_utils'] : [];
        $bestSellers = is_array($frontendUtils['best_sellers_section'] ?? null)
            ? $frontendUtils['best_sellers_section']
            : [];

        return [
            'title' => trim((string) ($bestSellers['title'] ?? 'Best Sellers')) ?: 'Best Sellers',
            'position' => max(1, min(6, (int) ($bestSellers['position'] ?? 3))),
        ];
    }

    private function normalizeJsonFields(Request $request, array $fields): void
    {
        foreach ($fields as $field) {
            $value = $request->input($field);

            if (! is_string($value)) {
                continue;
            }

            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge([$field => $decoded]);
            }
        }
    }

    private function normalizeEmptyStringFields(Request $request, array $fields): void
    {
        $normalized = [];

        foreach ($fields as $field) {
            $value = $request->input($field);

            if (is_string($value) && trim($value) === '') {
                $normalized[$field] = null;
            }
        }

        if ($normalized !== []) {
            $request->merge($normalized);
        }
    }

    private function storeUploadedFileToPublic(UploadedFile $file, string $relativeDirectory): string
    {
        $directory = public_path(trim($relativeDirectory, '/'));

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());
        $filename = now()->format('YmdHis') . '-' . bin2hex(random_bytes(5));
        if ($extension !== '') {
            $filename .= '.' . $extension;
        }

        $file->move($directory, $filename);

        return '/' . trim($relativeDirectory, '/') . '/' . $filename;
    }

    private function deleteUploadedFile($path): void
    {
        if (! is_string($path)) {
            return;
        }

        $allowedPrefixes = [
            '/uploads/settings/',
            '/uploads/category/',
        ];

        $isAllowed = false;
        foreach ($allowedPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                $isAllowed = true;
                break;
            }
        }

        if (! $isAllowed) {
            return;
        }

        $absolutePath = public_path(ltrim($path, '/'));
        if (File::exists($absolutePath)) {
            File::delete($absolutePath);
        }
    }
}
