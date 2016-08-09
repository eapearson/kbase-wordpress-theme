<!-- NOTE: If you need to make changes to this file, copy it to your current theme's main
	directory so your changes won't be overwritten when the plugin is upgraded. -->

<!-- Start of Post Wrap -->
<div class="post hentry ivycat-post">
	<!-- This is the output of the post TITLE -->
  
	<div class="entry-title" style="font-weight: bold;"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></div>
  <div class="entry-date" style="font-style: italic; color: gray;"><?= get_the_date('M j, Y'); ?></div>

	<!-- This is the output of the EXCERPT -->
	<div class="entry-summary">
		<?php the_excerpt(); ?>
	</div>

	<!-- This is the output of the META information -->
	<div class="entry-utility">
	
		
	</div>
</div>
<!-- // End of Post Wrap -->
