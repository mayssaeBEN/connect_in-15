<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /**
     * Toggle like:
     * - si l'utilisateur a déjà liké -> on supprime (unlike)
     * - sinon -> on crée (like)
     */
    public function store(Request $request, Post $post)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userId = (int)$data['user_id'];

        $existing = Like::where('post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'status' => 'unliked',
                'post_id' => $post->id,
                'user_id' => $userId,
            ], 200);
        }

        Like::create([
            'post_id' => $post->id,
            'user_id' => $userId,
        ]);

        return response()->json([
            'status' => 'liked',
            'post_id' => $post->id,
            'user_id' => $userId,
        ], 201);
    }

    public function destroy(Post $post, Like $like)
    {
        $like->delete();
        return response()->json(['message' => 'Deleted'], 200);
    }
} 