<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Création d’un utilisateur
        $user = User::create([
            'name' => 'Teddy',
            'email' => 'teddy@test.com',
            'password' => Hash::make('password'),
        ]);

        // Création de 3 posts
        $post1 = Post::create([
            'user_id' => $user->id,
            'content' => 'Premier post ',
            'status' => 'published',
        ]);

        $post2 = Post::create([
            'user_id' => $user->id,
            'content' => 'Deuxième post ',
            'status' => 'published',
        ]);

        $post3 = Post::create([
            'user_id' => $user->id,
            'content' => 'Troisième post ',
            'status' => 'published',
        ]);

        // Ajouter des commentaires
        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $user->id,
            'content' => 'Premier commentaire',
        ]);

        Comment::create([
            'post_id' => $post2->id,
            'user_id' => $user->id,
            'content' => 'Deuxième commentaire',
        ]);

        // Ajouter un like
        Like::create([
            'post_id' => $post1->id,
            'user_id' => $user->id,
        ]);
    }
} 