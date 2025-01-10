<?php

function init_fallback_image_endpoint() {
    register_rest_route('site-settings/v1', '/fallback-image', [
        'methods' => 'GET',
        'callback' => function() {
            return get_option('fallback_image');
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'init_fallback_image_endpoint');