<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'content' => ['required', 'string', 'min:1'],
            'image'   => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('comments', 'public');
        }

        $comment = Comment::create([
            'post_id'    => $post->id,
            'user_id'    => (int) $data['user_id'],
            'content'    => $data['content'],
            'image_path' => $imagePath,
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function update(Request $request, Comment $comment)
    {
        $data = $request->validate([
            'content'      => ['required', 'string', 'min:1'],
            'image'        => ['nullable', 'image', 'max:5120'],
            'remove_image' => ['nullable'],
        ]);

        $comment->content = $data['content'];

        $remove = $request->input('remove_image');
        $wantsRemove = ($remove === "1" || $remove === 1 || $remove === true || $remove === "true");

        if ($wantsRemove) {
            if ($comment->image_path) {
                Storage::disk('public')->delete($comment->image_path);
            }
            $comment->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($comment->image_path) {
                Storage::disk('public')->delete($comment->image_path);
            }
            $comment->image_path = $request->file('image')->store('comments', 'public');
        }

        $comment->save();

        return response()->json($comment->load('user'), 200);
    }

    public function destroy(Comment $comment)
    {
        if ($comment->image_path) {
            Storage::disk('public')->delete($comment->image_path);
        }

        $comment->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
} 