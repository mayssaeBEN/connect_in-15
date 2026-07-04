<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        return Post::with(['user','comments','likes'])
            ->orderBy('created_at','desc')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'content' => ['required', 'string', 'min:1'],
            'image'   => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id'    => (int) $data['user_id'],
            'content'    => $data['content'],
            'image_path' => $imagePath,
        ]);

        return response()->json($post->load('user'), 201);
    }

    public function update(Request $request, Post $post)
    {
        $data = $request->validate([
            'content'      => ['required', 'string', 'min:1'],
            'image'        => ['nullable', 'image', 'max:5120'],
            'remove_image' => ['nullable'],
        ]);

        $post->content = $data['content'];

        $remove = $request->input('remove_image');
        $wantsRemove = ($remove === "1" || $remove === 1 || $remove === true || $remove === "true");

        if ($wantsRemove) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $post->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $post->image_path = $request->file('image')->store('posts', 'public');
        }

        $post->save();

        return response()->json($post->load('user'), 200);
    }

    public function destroy(Post $post)
    {
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
}