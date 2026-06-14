<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;


class HeroController extends Controller
{
    //

    public function index(): JsonResponse
    {
        $heros=Hero::orderby('id','desc')->get();
        return response()->json($heros);
    }

    public function publicHero(): JsonResponse
    {
        $hero = Hero::query()->latest('id')->first();

        return response()->json($hero);
    }

    public function publicHeroes(): JsonResponse
    {
        $heroes = Hero::query()->latest('id')->get();

        return response()->json($heroes);
    }

    public function store(Request $request):JsonResponse
    {
        $validated=$request->validate([
            'title'=>['required','string','max:255'],
            'description'=>['required','string'],
            'title_display_mode'=>['nullable','in:single,double'],
            'title_font_size'=>['nullable','integer','min:20','max:220'],
            'title_font_family'=>['nullable','string','max:100'],
            'description_font_size'=>['nullable','integer','min:10','max:100'],
            'description_font_family'=>['nullable','string','max:100'],
            'text_offset_x'=>['nullable','integer','min:-60','max:60'],
            'text_offset_y'=>['nullable','integer','min:-60','max:60'],
            'title_offset_x'=>['nullable','integer','min:-60','max:60'],
            'title_offset_y'=>['nullable','integer','min:-60','max:60'],
            'description_offset_x'=>['nullable','integer','min:-60','max:60'],
            'description_offset_y'=>['nullable','integer','min:-60','max:60'],
            'button_offset_x'=>['nullable','integer','min:-60','max:60'],
            'button_offset_y'=>['nullable','integer','min:-60','max:60'],
            'button_enabled'=>['nullable','boolean'],
            'button_url'=>['nullable','string','max:2048'],
            'image_url'=>['nullable','string','max:2048'],
            'video_url'=>['nullable','string','max:2048'],
            'image'=>['nullable','image','mimes:jpeg,png,jpg,gif,webp','max:2048'],
            'video'=>['nullable','file','mimes:mp4,mov,avi,webm','max:122880'],
        ]);

        if (!empty($validated['image_url']) && !$request->hasFile('image')) {
            $validated['image'] = $validated['image_url'];
        }

        if (!empty($validated['video_url']) && !$request->hasFile('video')) {
            $validated['video'] = $validated['video_url'];
        }

        unset($validated['image_url'], $validated['video_url']);

        // image upload
        if($request->hasFile('image')){
            $image=$request->file('image');
            $imageDirectory=public_path('uploads/heroes/images/');
            File::ensureDirectoryExists($imageDirectory);
            $imageName=time().'_image.'.$image->getClientOriginalExtension();
            $image->move($imageDirectory,$imageName);
            $validated['image']='uploads/heroes/images/'.$imageName;

        }
        
        // video upload
        if($request->hasFile('video')){
            $video=$request->file('video');
            $videoDirectory=public_path('uploads/heroes/videos/');
            File::ensureDirectoryExists($videoDirectory);
            $videoName=time().'_video.'.$video->getClientOriginalExtension();
            $video->move($videoDirectory,$videoName);
            $validated['video']='uploads/heroes/videos/'.$videoName;
        }

        $hero=Hero::create($validated);
        return response()->json($hero,201);
    }

    public function show(Hero $hero):JsonResponse
    {
        return response()->json($hero);
    }

    public function update(Request $request,Hero $hero):JsonResponse
    {
        $validated=$request->validate([
            'title'=>['nullable','string','max:255'],
            'description'=>['nullable','string'],
            'title_display_mode'=>['nullable','in:single,double'],
            'title_font_size'=>['nullable','integer','min:20','max:220'],
            'title_font_family'=>['nullable','string','max:100'],
            'description_font_size'=>['nullable','integer','min:10','max:100'],
            'description_font_family'=>['nullable','string','max:100'],
            'text_offset_x'=>['nullable','integer','min:-60','max:60'],
            'text_offset_y'=>['nullable','integer','min:-60','max:60'],
            'title_offset_x'=>['nullable','integer','min:-60','max:60'],
            'title_offset_y'=>['nullable','integer','min:-60','max:60'],
            'description_offset_x'=>['nullable','integer','min:-60','max:60'],
            'description_offset_y'=>['nullable','integer','min:-60','max:60'],
            'button_offset_x'=>['nullable','integer','min:-60','max:60'],
            'button_offset_y'=>['nullable','integer','min:-60','max:60'],
            'button_enabled'=>['nullable','boolean'],
            'button_url'=>['nullable','string','max:2048'],
            'image_url'=>['nullable','string','max:2048'],
            'video_url'=>['nullable','string','max:2048'],
            'image'=>['nullable','image','mimes:jpeg,png,jpg,gif,webp','max:2048'],
            'video'=>['nullable','file','mimes:mp4,mov,avi,webm','max:122880'],
        ]);

        if (!empty($validated['image_url']) && !$request->hasFile('image')) {
            $validated['image'] = $validated['image_url'];
        }

        if (!empty($validated['video_url']) && !$request->hasFile('video')) {
            $validated['video'] = $validated['video_url'];
        }

        unset($validated['image_url'], $validated['video_url']);

        // image upload
        if($request->hasFile('image')){
            $image=$request->file('image');
            $imageDirectory=public_path('uploads/heroes/images/');
            File::ensureDirectoryExists($imageDirectory);
            $imageName=time().'_image.'.$image->getClientOriginalExtension();
            $image->move($imageDirectory,$imageName);
            $validated['image']='uploads/heroes/images/'.$imageName;
        }

        // video upload
        if($request->hasFile('video')){
            $video=$request->file('video');
            $videoDirectory=public_path('uploads/heroes/videos/');
            File::ensureDirectoryExists($videoDirectory);
            $videoName=time().'_video.'.$video->getClientOriginalExtension();
            $video->move($videoDirectory,$videoName);
            $validated['video']='uploads/heroes/videos/'.$videoName;
        }

        $hero->update($validated);
        return response()->json($hero);
    }

    public function destroy(Hero $hero):JsonResponse
    {
        $filepath=public_path($hero->image);
        if($hero->image && file_exists($filepath)){
            unlink($filepath);
        }
        $videofilepath=public_path($hero->video);
        if($hero->video && file_exists($videofilepath)){
           
            if(file_exists($videofilepath)){
                unlink($videofilepath);
            }
        }
        $hero->delete();
        return response()->json(null, 204);
    }
}
