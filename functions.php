<?php
/**
 * Functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package dev
 * @since 1.0.0
 */

 array_map(
    function ($file) {
        $filepath = "/includes/{$file}.php";
        require_once get_stylesheet_directory() . $filepath;
    },
    [
        'blocks',
		'post-types'
    ]
);