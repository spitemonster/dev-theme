<?php
$block_dirs = glob(get_stylesheet_directory() . '/blocks/*/');

add_action('init', function () use ($block_dirs) {
    foreach ($block_dirs as $block_dir) {
		$block_json = $block_dir . 'block.json';

		if (!file_exists($block_json)) {
			continue;
		}

        register_block_type_from_metadata(dirname($block_json));
    }
});

// enqueue editor scripts and styles
add_action('enqueue_block_editor_assets', function() use ($block_dirs) {
	foreach ($block_dirs as $block_dir) {
		$block_json = $block_dir . 'block.json';

		if (!file_exists($block_json)) {
			continue;
		}
		
		$block_name = basename($block_dir);
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
		if (file_exists($block_dist_path . 'editor.min.css')) {
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
		if (file_exists($block_dist_path . 'style.min.css')) {
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
		if (file_exists($block_dist_path . 'view.min.js')) {
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
add_action('enqueue_block_assets', function () use ($block_dirs)  {
	foreach ($block_dirs as $block_dir) {
		$block_json = $block_dir . 'block.json';

		if (!file_exists($block_json)) {
			continue;
		}

		$block_name = basename($block_dir);
		$block_dist_path = trailingslashit(get_stylesheet_directory() . '/assets/blocks/' . $block_name);
		$block_dist_uri = trailingslashit(get_template_directory_uri() . '/assets/blocks/' . $block_name);

		$view_script_name = $block_name . '-view-script';
		$view_style_name = $block_name . '-view-style';

		if (file_exists($block_dist_path . 'view.min.js')) {
			wp_enqueue_script(
				$view_script_name, 
				$block_dist_uri . 'view.min.js', 
				array('wp-blocks', 'wp-element', 'wp-editor')
			);
		}

		if (file_exists($block_dist_path . 'style.min.css')) {

			wp_enqueue_style(
				$view_style_name, 
				$block_dist_uri . 'style.min.css', 
				array(), 
				filemtime($block_dist_path . 'style.min.css'), 
				false
			);
		}
	}
});
