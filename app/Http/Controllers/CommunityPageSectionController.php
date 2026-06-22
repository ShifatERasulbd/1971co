<?php

namespace App\Http\Controllers;

use App\Models\CommunityPageSection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class CommunityPageSectionController extends Controller
{
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

        return response()->json($sections);
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

        $section = CommunityPageSection::updateOrCreate(
            ['key' => $request->input('key')],
            $updates
        );

        return response()->json($section, 200);
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

        return response()->json($section);
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
                'button_text' => 'Learn More',
                'button_url' => '/about',
                'status' => 'active',
            ],
            [
                'key' => 'community-center',
                'title' => 'Community Center',
                'description' => 'Programs and support initiatives section.',
                'button_text' => 'Explore Programs',
                'button_url' => '/community',
                'status' => 'active',
            ],
            [
                'key' => 'gallery',
                'title' => 'Community Gallery',
                'description' => 'Moments from the community photo showcase.',
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
