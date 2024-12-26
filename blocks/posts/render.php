<?php
	$post_type = $attributes['postType'];
	$post_count = $attributes['postCount'];

	$posts = get_posts([
		'post_type' => $post_type,
		'posts_per_page' => $post_count
	])
?>
<p <?php echo get_block_wrapper_attributes(); ?>>
	<ul>
		<?php foreach ($posts as $post): ?>
			<li>
				<a href="<?= get_permalink($post) ?>"><?= $post->post_title; ?></a>
			</li>
		<?php endforeach; ?>
	</ul>
</p>
