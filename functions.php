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
		'post-types',
		'api'
    ]
);

add_action('after_setup_theme', function () {
    add_post_type_support('page', 'excerpt');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', [
        'caption',
        'comment-form',
        'comment-list',
        'gallery',
        'search-form',
    ]);

	add_theme_support('editor-styles');
	add_theme_support( 'wp-block-styles' );

	remove_theme_support('core-block-patterns');
});

add_action( 'admin_enqueue_scripts', function( $hook ) {
    if ( 'edit.php' == $hook ) {
		wp_enqueue_style('editor-style', get_stylesheet_directory_uri() . '/assets/css/editor.min.css');
    	wp_enqueue_script( 'editor-script', get_stylesheet_directory_uri() . '/assets/js/editor.min.js');	
        return;
    }

	wp_enqueue_style('admin-style', get_stylesheet_directory_uri() . '/assets/css/admin.min.css');
    wp_enqueue_script( 'admin-script', get_stylesheet_directory_uri() . '/assets/js/admin.min.js');
} );

add_action('wp_enqueue_scripts', function() {
	wp_enqueue_style('main-style', get_stylesheet_directory_uri() . '/assets/css/main.min.css');
	wp_enqueue_script('main-script', get_stylesheet_directory_uri() . '/assets/js/main.min.js');
});