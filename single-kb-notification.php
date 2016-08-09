<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row" style="margin-bottom: 2em;">
    <div class="col-sm-12">
			<div class="label label-default" style="font-size: 150%; font-weight: bold;">System Notification</div>
		</div> 
	</div>
<?php $postsId = uniqid(); ?>
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	
	<div  id="system_maintenance_<?= $postsId ?>">
	 <div class="row">
    <div class="col-sm-12">
  				<h1><?= get_the_title() ?></h1>
		</div>
	 </div>
		
		 <div class="row" >
    <div class="col-sm-10">
					
					<h3>When? <sup>*</sup></h3>
					<div data-calc="date-range" style="font-style: italic; margin-bottom: 0.5em;">
						<span data-output="elapsed"></span>
						<span data-date-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>"></span>
						<span data-date-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></span>	
					</div>

					<div data-calc="date-range" style="font-style: italic; margin-bottom: 1em;">
						on <span data-output="timerange"></span>
						<div data-date-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>"></div>
						<div data-date-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></div>	
					</div>
								
						
					<h3>Summary</h3>
					<div class="-excerpt" style="font-style: italic; margin-bottom: 1em;"><?= get_the_excerpt() ?></div>

					<h3>Description</h3>
					<div class="-content" style="margin-bottom: 1em;"><?= get_the_content() ?></div>
				 
    </div>
	</div>
</div>
				 
				 
				<script>
					jQuery(document).ready(function ($) {
						console.log($('#system_maintenance_<?= $postsId ?> [data-calc="date-range"]'));
						$('#system_maintenance_<?= $postsId ?> [data-calc="date-range"]').each(function() {
							// console.log($(this).find('[data-from]'));
							var from = $(this).find('[data-date-from]').data('date-from');
							var to = $(this).find('[data-date-to]').data('date-to'); 
						
							var fromDate = window.kbase.Utils.iso8601ToDate(from);
							var toDate = window.kbase.Utils.iso8601ToDate(to);
							// var to = $(this).data('date-to');
							// $(this).data('output', from + ', ' + to);
							// console.log(from); console.log($(this).find(to));
							var out = window.kbase.Utils.niceTimerange(fromDate, toDate, {showDay: true});
							$(this).find('[data-output="timerange"]').html(out);
							$(this).find('[data-output="elapsed"]').html(window.kbase.Utils.niceElapsedTimeRange(fromDate, toDate));
							
							
						});
					});
				</script>
				 
				 

      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
  </div>
</div> 

<?php get_footer() ?>
