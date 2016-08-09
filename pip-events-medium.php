<!-- Start of Post Wrap -->
<div class="post hentry ivycat-post event medium">
	<!-- This is the output of the post TITLE -->
  
	<div class="title" style="font-weight: bold;">
    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
  </div>
  <div class="date-location">
  <div class="date" style="font-style: italic; color: gray; display: inline-block;">
    <?= kb_calendar_event_date_range(get_the_ID()); ?>
  </div>
  <div class="time" style="font-style: italic; color: gray; display: inline-block;">    
    <?= kb_calendar_event_time_range(get_the_ID()); ?>    
  </div>
  
  <?php 
  $loc = get_post_meta(get_the_ID(), 'kb_calendar_location', true); 
  if (!empty($loc)):
  ?>
  <div class="location" style="font-style: normal; display: inline-block">
    in <?= $loc ?>
  </div>
  <?php endif; ?>
  </div>

	<!-- This is the output of the EXCERPT -->
	<div class="content" style="font-style: normal;">
		<?php the_excerpt(); ?>
	</div>

</div>
<!-- // End of Post Wrap -->
