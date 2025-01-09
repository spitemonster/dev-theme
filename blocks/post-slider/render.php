<?php
	$selected_posts = $attributes["selectedPosts"];
	$post_ids = array_map(function($item) {
		return (int)$item["id"];
	}, $selected_posts);

	$posts = get_posts([
		'include' => $post_ids,
		'numberposts' => 3,
		'post_type' => $attributes["selectedPostType"]
	]);
?>
<div class="post-slider blaze-slider">
	<div class="blaze-container">
		<div class="blaze-track-container">
			<ul class="blaze-track">
			<?php foreach ($posts as $post): 
				$featured_image_url = get_the_post_thumbnail_url($post);
				$image_url = $featured_image_url ?: get_option("fallback_image");

				$permalink = get_the_permalink($post);
				?>

				<li>
					<a class="post-card" href="<?= $permalink; ?>">
						<figure>
							<?php if (!empty($image_url)): ?>
								<img src="<?= $image_url ?>" alt="<?= $post->title; ?>">
							<?php endif; ?>

							<figcaption>
								<?= $post->post_excerpt ?: $post->post_title; ?>
							</figcaption>
						</figure>
					</a>
				</li>
				
			<?php endforeach; ?>
			</ul>
		</div>
	</div>
</div>