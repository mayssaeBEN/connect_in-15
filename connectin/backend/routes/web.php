<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    // Ton front build est dans public/feed/index.html
    return response()->file(public_path('feed/index.html'));
})->where('any', '.*'); 