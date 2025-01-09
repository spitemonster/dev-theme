<?php
$_BLOCK_SCOPE_NAME = 'kj';
$_BLOCK_DIRS = glob(get_stylesheet_directory() . '/blocks/*/', GLOB_ONLYDIR);

add_action('init', function () use ($_BLOCK_DIRS) {
    foreach ($_BLOCK_DIRS as $block_dir) {
		$block_json = $block_dir . 'block.json';

		if (!file_exists($block_json)) {
			continue;
		}

        register_block_type(dirname($block_json));
    }
});

// enqueue editor scripts and styles
add_action('enqueue_block_editor_assets', function() use ($_BLOCK_DIRS, $_BLOCK_SCOPE_NAME) {
	// in the editor i don't really care to do a bunch of lookups; it probably isn't hurting performance that bad 
	foreach ($_BLOCK_DIRS as $block_dir) {
		$block_json = $block_dir . 'block.json';

		if (!file_exists($block_json)) {
			continue;
		}
		
		$block_name = basename($block_dir);
		$scoped_name = $_BLOCK_SCOPE_NAME . '/' . $block_name;
		// _path is used for checking if a file exists
		$block_dist_path = trailingslashit(get_stylesheet_directory() . '/assets/blocks/' . $block_name);
		
		// uri is for enqueuing
		$block_dist_uri = trailingslashit(get_template_directory_uri() . '/assets/blocks/' . $block_name);

		// no point in running if there's no main editor script
		if (!file_exists($block_dist_path . 'index.min.js')) {
			continue;
		}

		$settings = array();

		$editor_script_name = $block_name . '-editor-script';
		$editor_style_name = $block_name . '-editor-style';
		$view_style_name = $block_name . '-view-style';
		$view_script_name = $block_name . '-view-script';

		wp_enqueue_script(
			$editor_script_name, 
			$block_dist_uri . 'index.min.js', 
			array('wp-blocks', 'wp-element', 'wp-editor')
		);

		$settings['editor_script'] = $editor_script_name;

		// only enqueue scripts and styles that exist
		if (file_exists($block_dist_path . 'editor.min.css') && has_block($scoped_name)) {
			wp_enqueue_style(
				$editor_style_name, 
				$block_dist_uri . 'editor.min.css', 
				array(), 
				filemtime($block_dist_path . 'editor.min.css'), 
				false
			);

			$settings['editor_style'] = $editor_style_name;
		}

		// want to bring in main styles
		if (file_exists($block_dist_path . 'style.min.css') && has_block($scoped_name)) {
			wp_enqueue_style(
				$view_style_name, 
				$block_dist_uri . 'style.min.css', 
				array(), 
				filemtime($block_dist_path . 'style.min.css'), 
				false
			);

			$settings['style'] = $view_style_name;
		}

		// might remove but may want to include view scripts in the editor
		if (file_exists($block_dist_path . 'view.min.js') && has_block($scoped_name)) {
			wp_enqueue_script(
				$view_script_name, 
				$block_dist_uri . 'view.min.js', 
				array('wp-blocks', 'wp-element', 'wp-editor')
			);

			$settings['view_script'] = $view_script_name;
		}

		register_block_type($block_json, $settings);
	}
}, 10, 2);

// front end scripts and styles
add_action('enqueue_block_assets', function () use ($_BLOCK_DIRS, $_BLOCK_SCOPE_NAME)  {
	$block_cache_key = 'block_view_assets';

	// a little worried about a bunch of file_exists lookups on the user side
	// so we use a transient to store the presence of view scripts and styles
	// on enqueue, test if any directories inside /blocks have been updated
	// if so, clear the transient and rebuild it
	$last_modified = array_reduce($_BLOCK_DIRS, function ($carry, $dir) {
        return max($carry, filemtime($dir));
    }, 0);

	$cached_last_modified = get_transient($block_cache_key . '_timestamp');

	if ($cached_last_modified != $last_modified) {
		delete_transient($block_cache_key);
		set_transient($block_cache_key . "_timestamp", $last_modified, HOUR_IN_SECONDS);
	}

    $block_assets = get_transient($block_cache_key);

    if ($block_assets === false) {
        $block_assets = [];

        foreach ($_BLOCK_DIRS as $block_dir) {
            $block_name = basename($block_dir);
            $block_dist_path = trailingslashit(get_stylesheet_directory() . '/assets/blocks/' . $block_name);

            $block_assets[$block_name] = [
                'has_script' => file_exists($block_dist_path . 'view.min.js'),
                'has_style' => file_exists($block_dist_path . 'style.min.css'),
            ];
        }
        set_transient($block_cache_key, $block_assets, HOUR_IN_SECONDS);
    }

	foreach ($block_assets as $block_name => $files) {
		$scoped_name = $_BLOCK_SCOPE_NAME . '/' . $block_name;

		$block_dist_path = trailingslashit(get_stylesheet_directory() . '/assets/blocks/' . $block_name);
		$block_dist_uri = trailingslashit(get_template_directory_uri() . '/assets/blocks/' . $block_name);

		if (!has_block($scoped_name)) {
			continue;
		}

		if ($files['has_script']) {
			wp_enqueue_script(
				$block_name . '-view-script', 
				$block_dist_uri . 'view.min.js', 
				array('wp-blocks', 'wp-element', 'wp-editor'),
				filemtime($block_dist_path . 'view.min.js')
			);
		}

		if ($files['has_style']) {
			wp_enqueue_style(
				$block_name . '-view-style', 
				$block_dist_uri . 'style.min.css', 
				array(), 
				filemtime($block_dist_path . 'style.min.css')
			);
		}
	}
});
