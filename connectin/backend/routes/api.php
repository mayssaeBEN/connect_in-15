<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// USERS / PROFILE
Route::get('/users/{user}', [UserController::class, 'show']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::put('/users/{user}/password', [UserController::class, 'updatePassword']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);

// POSTS
Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']); // multipart ok
Route::put('/posts/{post}', [PostController::class, 'update']);
Route::delete('/posts/{post}', [PostController::class, 'destroy']);

// COMMENTS
Route::post('/posts/{post}/comments', [CommentController::class, 'store']); // multipart ok
Route::put('/comments/{comment}', [CommentController::class, 'update']);
Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

// LIKES
Route::post('/posts/{post}/likes', [LikeController::class, 'store']);
Route::delete('/posts/{post}/likes/{like}', [LikeController::class, 'destroy']); 