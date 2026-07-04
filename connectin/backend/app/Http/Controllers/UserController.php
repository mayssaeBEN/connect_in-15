<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // GET /api/users/{user}
    public function show(User $user)
    {
        return response()->json(['user' => $user], 200);
    }

    // PUT /api/users/{user}
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->save();

        return response()->json(['user' => $user], 200);
    }

    // PUT /api/users/{user}/password
    public function updatePassword(Request $request, User $user)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:4'],
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour'], 200);
    }

    /**
     * DELETE /api/users/{user}
     * Body JSON: { "mode": "delete_content" | "keep_content" }
     *
     * - delete_content : supprime posts + commentaires via cascade (FK user_id->users onDelete cascade)
     * - keep_content   : garde posts/commentaires en les réassignant à "Utilisateur supprimé"
     * Dans tous les cas : supprime l'utilisateur + supprime ses likes. :contentReference[oaicite:1]{index=1}
     */
    public function destroy(Request $request, User $user)
    {
        $data = $request->validate([
            'mode' => ['required', 'in:delete_content,keep_content'],
        ]);

        // 1) Toujours supprimer ses likes
        // (la table likes a probablement un FK cascade, mais on le fait explicitement)
        \DB::table('likes')->where('user_id', $user->id)->delete();

        if ($data['mode'] === 'keep_content') {
            // On réassigne posts + commentaires à un utilisateur "Utilisateur supprimé"
            $deletedUser = User::firstOrCreate(
                ['email' => 'deleted@connectin.local'],
                [
                    'name' => 'Utilisateur supprimé',
                    'password' => Hash::make(bin2hex(random_bytes(16))),
                ]
            );

            \DB::table('posts')->where('user_id', $user->id)->update(['user_id' => $deletedUser->id]);
            \DB::table('comments')->where('user_id', $user->id)->update(['user_id' => $deletedUser->id]);
        }

        // 2) Supprimer le compte
        $user->delete();

        return response()->json(['message' => 'Compte supprimé'], 200);
    }
} 