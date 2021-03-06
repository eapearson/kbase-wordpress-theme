<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    
    <link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/favicon.ico" />
  
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name')?></title>
  
    <link rel="profile" href="http://gmpg.org/xfn/11" />
  
    <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
  
    <?php if (is_singular() && get_option('thread_comments')) wp_enqueue_script('comment-reply'); ?>
    

    <?php
    wp_enqueue_style('grid');
    wp_enqueue_style('bootstrap');
    wp_enqueue_style('bootstrap-theme'); 
    wp_enqueue_style('font-awesome');
    wp_enqueue_script('jquery'); 
    wp_enqueue_script('bootstrap'); 
    // wp_enqueue_script('requireconfig'); 
    wp_enqueue_script('kb-utils'); 
    wp_enqueue_script('bs-extra'); 
    wp_head(); 
    
    ?>
  <link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>" type="text/css" media="screen" />
  </head>
  <body class="kbase-theme">
    <?php include_once(get_template_directory() . '/analyticstracking.php'); ?>
    <div class="container-fluid" style="margin: 0 0 12px 0;padding: 0;">
          <div class="navbar navbar-default" role="navigation">
            <div class="container-fluid">
              <!-- Brand and toggle get grouped for better mobile display -->
              <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                </button>
                <a class="navbar-brandx" href="<?php bloginfo('url')?>">
                  <img src="<?= content_url('/uploads/2014/11/kbase-logo-web.png') ?>" alt="<?php bloginfo('name')?>">
                </a>
              </div>

              <!-- Collect the nav links, forms, and other content for toggling -->
              
             
            </div><!-- /.container-fluid -->
          </div>
    </div>
    
		<!--- Notifications here -->
		<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">
			
			<?php
			# notification query
			# echo(date('c'));
			$query = [
				'category_name' => 'system-maintenance',
				'meta_query' => [
					['key' => 'kb_notification_end_at',
					 'value' => date('c'),
					 'type' => 'DATETIME',
					 'compare' => '>=' 
					 ]
				]
			];
			$nq = new WP_Query($query);
			# echo $nq->request;
			if ($nq->have_posts()) { 
				$postsId = uniqid();
		  ?>
			
			<div class="notifications" id="notifications_<?= $postsId ?>">
				<?php while ($nq->have_posts()) {	
					$nq->the_post();
				?>
					<div>
						<div class="alert alert-danger">
							<div class="row">
								<div class="col-sm-7">
									<b><a href="<?= get_permalink($nq->post->ID) ?>"><?= $nq->post->post_title ?></a></b>
									<span data-method="nice-elapsed" 
								          data-arg-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>"
										  data-arg-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></span>	
								</div>
								<div class="col-sm-5" style="text-align: right;">
									<span data-method="nice-timerange"
									      data-arg-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>"
										  data-arg-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></span>	
								</div>
							</div>			
						</div>
					</div>
				<?php } ?>
				
				<div>
				
				<script>
						jQuery(document).ready(function ($) {
							$('#notifications_<?= $postsId ?> [data-method]').each(function () {
								var method = $(this).data('method');
								var result;
								switch (method) {
								case 'nice-timezone-offset': 
									result = window.kbase.Utils.niceTimezoneOffset();
									break;
								case 'nice-timerange':
									var from = $(this).data('arg-from');
									var to = $(this).data('arg-to');
									var fromDate = window.kbase.Utils.iso8601ToDate(from);
									var toDate = window.kbase.Utils.iso8601ToDate(to);
									result = window.kbase.Utils.niceTimerange(fromDate, toDate, {showDay: true});
									break;
								case 'nice-elapsed': 
									var from = $(this).data('arg-from');
									var to = $(this).data('arg-to');
									var fromDate = window.kbase.Utils.iso8601ToDate(from);
									var toDate = window.kbase.Utils.iso8601ToDate(to);
									result = window.kbase.Utils.niceElapsedTimeRange(fromDate, toDate);
									break;
								}
								if (result) {
									$(this).text(result); 
								}
						  });
						});
					</script>
			</div>
			
			<?php
		    } else {
					# show nothing.
		 } ?>
			
			
		</div>
		
		<!--- to here -->			
			
