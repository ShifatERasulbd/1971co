<?php

namespace App\Http\Controllers;

use App\Models\CommunityPageSection;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class CommunityPageSectionController extends Controller
{
    private function featureUploadsDirectory(): string
    {
        return public_path('uploads/community/features');
    }

    private function storeFeatureImage(UploadedFile $uploadedFile): string
    {
        $directory = $this->featureUploadsDirectory();
        File::ensureDirectoryExists($directory);

        $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'webp');
        $filename = time() . '_' . uniqid('community_feature_', true) . '.' . $extension;
        $uploadedFile->move($directory, $filename);

        return 'uploads/community/features/' . $filename;
    }

    private function resolvePublicPath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (
            str_starts_with($path, 'http://') ||
            str_starts_with($path, 'https://') ||
            str_starts_with($path, 'data:') ||
            str_starts_with($path, '/')
        ) {
            return $path;
        }

        if (File::exists(public_path($path))) {
            return '/' . ltrim($path, '/');
        }

        return $path;
    }

    private function transformSectionForResponse(CommunityPageSection $section): array
    {
        $data = $section->toArray();

        $data['contentTitle'] = $section->content_title;
        $data['sectionDescription'] = $section->section_description;
        $data['buttonText'] = $section->button_text;
        $data['buttonUrl'] = $section->button_url;
        $data['featureImage'] = $this->resolvePublicPath($section->feature_image);
        $data['featureItems'] = is_array($section->feature_items) ? $section->feature_items : [];
        $data['communityImage'] = $this->resolvePublicPath($section->community_image);
        $data['communityItems'] = is_array($section->community_items) ? $section->community_items : [];
        $data['galleryItems'] = is_array($section->gallery_items) ? $section->gallery_items : [];

        if (!empty($data['galleryItems'])) {
            $data['galleryItems'] = array_map(function (array $item) {
                $item['src'] = $this->resolvePublicPath($item['src'] ?? null);
                return $item;
            }, $data['galleryItems']);
        }

        return $data;
    }

    /**
     * Get all community page sections
     */
    public function index(): JsonResponse
    {
        $sections = CommunityPageSection::orderBy('created_at', 'asc')->get();

        if ($sections->isEmpty()) {
            // Return default sections if none exist in database
            return response()->json($this->getDefaultSections());
        }

        return response()->json($sections->map(fn (CommunityPageSection $section) => $this->transformSectionForResponse($section)));
    }

    /**
     * Get all community page sections for public pages
     */
    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    /**
     * Store or update a community page section
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string',
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'contentTitle' => 'nullable|string',
            'heading' => 'nullable|string',
            'sectionDescription' => 'nullable|string',
            'buttonText' => 'nullable|string',
            'buttonUrl' => 'nullable|string',
            'featureImage' => 'nullable|string|max:65535',
            'featureItems' => 'nullable|array',
            'featureItems.*.id' => 'nullable|string|max:100',
            'featureItems.*.icon' => 'nullable|string|max:100',
            'featureItems.*.title' => 'required_with:featureItems|string|max:255',
            'featureItems.*.description' => 'required_with:featureItems|string|max:1200',
            'communityImage' => 'nullable|string|max:65535',
            'communityItems' => 'nullable|array',
            'communityItems.*.id' => 'nullable|string|max:100',
            'communityItems.*.icon' => 'nullable|string|max:100',
            'communityItems.*.title' => 'required_with:communityItems|string|max:255',
            'communityItems.*.description' => 'required_with:communityItems|string|max:1200',
            'galleryItems' => 'nullable|array',
            'galleryItems.*.id' => 'nullable|string|max:100',
            'galleryItems.*.src' => 'required_with:galleryItems|string|max:65535',
            'galleryItems.*.alt' => 'nullable|string|max:255',
            'galleryItems.*.label' => 'nullable|string|max:255',
            'galleryItems.*.date' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $columns = Schema::getColumnListing('community_page_sections');

        $updates = [
            'status' => $validated['status'],
        ];

        if (in_array('title', $columns, true)) {
            $updates['title'] = $validated['title'] ?? ucfirst(str_replace('-', ' ', $validated['key']));
        }

        if (in_array('description', $columns, true)) {
            $updates['description'] = $validated['description'] ?? null;
        }

        if (in_array('content_title', $columns, true)) {
            $updates['content_title'] = $validated['contentTitle'] ?? null;
        }

        if (in_array('heading', $columns, true)) {
            $updates['heading'] = $validated['heading'] ?? null;
        }

        if (in_array('section_description', $columns, true)) {
            $updates['section_description'] = $validated['sectionDescription'] ?? null;
        }

        if (in_array('button_text', $columns, true)) {
            $updates['button_text'] = $validated['buttonText'] ?? null;
        }

        if (in_array('button_url', $columns, true)) {
            $updates['button_url'] = $validated['buttonUrl'] ?? null;
        }

        if (in_array('feature_image', $columns, true)) {
            $updates['feature_image'] = $validated['featureImage'] ?? null;
        }

        if (in_array('feature_items', $columns, true)) {
            $updates['feature_items'] = $validated['featureItems'] ?? [];
        }

        if (in_array('community_image', $columns, true)) {
            $updates['community_image'] = $validated['communityImage'] ?? null;
        }

        if (in_array('community_items', $columns, true)) {
            $updates['community_items'] = $validated['communityItems'] ?? [];
        }

        if (in_array('gallery_items', $columns, true)) {
            $updates['gallery_items'] = $validated['galleryItems'] ?? [];
        }

        $section = CommunityPageSection::updateOrCreate(
            ['key' => $request->input('key')],
            $updates
        );

        return response()->json($this->transformSectionForResponse($section->fresh()), 200);
    }

    /**
     * Upload feature section image from page builder
     */
    public function uploadFeatureImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);

        $path = $this->storeFeatureImage($validated['image']);

        return response()->json([
            'path' => $path,
            'url' => '/' . ltrim($path, '/'),
        ], 201);
    }

    /**
     * Get a single community page section
     */
    public function show(string $key): JsonResponse
    {
        $section = CommunityPageSection::where('key', $key)->first();

        if (!$section) {
            return response()->json(['error' => 'Section not found'], 404);
        }

        return response()->json($this->transformSectionForResponse($section));
    }

    /**
     * Delete a community page section
     */
    public function destroy(string $key): JsonResponse
    {
        $section = CommunityPageSection::where('key', $key)->first();

        if (!$section) {
            return response()->json(['error' => 'Section not found'], 404);
        }

        $section->delete();

        return response()->json(['message' => 'Section deleted'], 200);
    }

    /**
     * Get default sections for initialization
     */
    private function getDefaultSections(): array
    {
        return [
            [
                'key' => 'hero',
                'title' => 'Hero Section',
                'description' => 'Top campaign headline and CTA.',
                'content_title' => 'Together We Grow',
                'heading' => '$0.50 FROM EVERY PURCHASE YOU MAKE SUPPORTS GARMENT\'S WORKERS\' CHILDREN',
                'section_description' => 'Every purchase makes a difference. We donate $0.50 from every order to support workers\' children in our community — helping create brighter futures through care, education, and opportunity.',
                'button_text' => 'Let\'s Make a Purchase',
                'button_url' => '/products',
                'status' => 'active',
            ],
            [
                'key' => 'features',
                'title' => 'Impact Features',
                'description' => 'Education, care, and opportunity cards.',
                'feature_image' => '/uploads/heroes/images/hero1.webp',
                'feature_items' => [
                    [
                        'id' => 'education',
                        'icon' => 'graduation-cap',
                        'title' => 'Education',
                        'description' => 'School supplies, tuition assistance, and scholarships that keep kids in the classroom.',
                    ],
                    [
                        'id' => 'care',
                        'icon' => 'heart-handshake',
                        'title' => 'Care',
                        'description' => 'Healthcare, nutrition, and safe spaces for the children of the people who make our garments.',
                    ],
                    [
                        'id' => 'opportunity',
                        'icon' => 'sprout',
                        'title' => 'Opportunity',
                        'description' => 'Mentorship and skills programs that open doors to brighter, self-made futures.',
                    ],
                ],
                'button_text' => 'Learn More',
                'button_url' => '/about',
                'status' => 'active',
            ],
            [
                'key' => 'community-center',
                'title' => 'Community Center',
                'description' => 'Programs and support initiatives section.',
                'content_title' => 'Community Center',
                'heading' => 'A SPACE BUILT FOR THE PEOPLE WHO MAKE US.',
                'community_image' => '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp',
                'community_items' => [
                    [
                        'id' => 'learning-hub',
                        'icon' => 'book-open',
                        'title' => 'Learning Hub',
                        'description' => 'Workshops, library access, and skill-building sessions led by community members.',
                    ],
                    [
                        'id' => 'health-wellness',
                        'icon' => 'heart-pulse',
                        'title' => 'Health & Wellness',
                        'description' => 'Regular health check-ups, awareness sessions, and on-call counseling support.',
                    ],
                    [
                        'id' => 'social-support',
                        'icon' => 'users',
                        'title' => 'Social Support',
                        'description' => 'Community events, peer groups, and family engagement programs.',
                    ],
                    [
                        'id' => 'recreation',
                        'icon' => 'sparkles',
                        'title' => 'Recreation',
                        'description' => 'Spaces for relaxation, cultural activities, and team-building moments.',
                    ],
                ],
                'button_text' => 'Explore Programs',
                'button_url' => '/community',
                'status' => 'active',
            ],
            [
                'key' => 'gallery',
                'title' => 'Community Gallery',
                'description' => 'Moments from the community photo showcase.',
                'gallery_items' => [
                    [
                        'id' => 'community-1',
                        'src' => '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp',
                        'alt' => 'Children participating in a classroom activity.',
                        'label' => 'Community',
                        'date' => '2026-06-18',
                    ],
                    [
                        'id' => 'community-2',
                        'src' => '/uploads/about/story/1781528584_about_story_6a2ff8086e82f3.63671374.webp',
                        'alt' => 'Students listening during a learning session.',
                        'label' => 'Learning Session',
                        'date' => '2026-06-12',
                    ],
                    [
                        'id' => 'community-3',
                        'src' => '/uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg',
                        'alt' => 'Community program moment with children.',
                        'label' => 'Community Program',
                        'date' => '2026-06-10',
                    ],
                    [
                        'id' => 'community-4',
                        'src' => '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg',
                        'alt' => 'Mentorship and care initiative.',
                        'label' => 'Mentorship',
                        'date' => '2026-06-07',
                    ],
                    [
                        'id' => 'community-5',
                        'src' => '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp',
                        'alt' => 'Shared community space and daily activities.',
                        'label' => 'Shared Space',
                        'date' => '2026-06-04',
                    ],
                    [
                        'id' => 'community-6',
                        'src' => '/uploads/heroes/images/1780912831_image.webp',
                        'alt' => 'A support event for garment workers families.',
                        'label' => 'Support Event',
                        'date' => '2026-06-01',
                    ],
                ],
                'button_text' => 'View Gallery',
                'button_url' => '#gallery',
                'status' => 'active',
            ],
            [
                'key' => 'newsletter',
                'title' => 'Newsletter',
                'description' => 'Email signup section at the end of page.',
                'button_text' => 'Subscribe',
                'button_url' => '#newsletter',
                'status' => 'active',
            ],
        ];
    }
}
