<?php
/**
* 
* 
* @package: @kbase 
* Template Name: Tutorial
*
*/ 
?>
<?php get_header() ?>

<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">
   <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
   <div class="page-wrap page-<?= $post->post_name ?>">
      <div class="row">
         <div class="col-sm-12">
            <h1><?php the_title(); ?></h1>
         </div>
      </div>
      <div class="row">
         <div class="col-sm-12">
							<?php 
							$appId = get_post_meta($post->ID, 'app_id', true);
							if ($appId) {
								?> 

								<div style="margin-bottom: 1em;">
									<a class="btn btn-default" href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>#/narrativemanager/new?app=<?= $appId ?>" target="_blank">
										Launch this App
									</a>
								</div>
								
								<?php
							} else {							
								$methodId = get_post_meta($post->ID, 'method_id', true);
								if ($methodId) {
									?>
								<div style="margin-bottom: 1em;">									
									<a class="btn btn-default" href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>#/narrativemanager/new?method=<?= $methodId ?>" target="_blank">
										Launch this Method
									</a>
								</div>
									<?php									
								}
							}							
							?>
         </div>
      </div>
      <div class="row">
         <div class="col-sm-9">
            <?php the_content(); ?>
						<h2>Other app &amp; method tutorials</h2>
						<p>Find more app &amp; method tutorials <a href="/tutorials">here</a>!</p>
						<h2>Contact us</h2>
						<p>If you have questions, you can <a href="/contact-us">contact us</a>.</p>
         </div>
      </div>
   </div>
   <?php endwhile; else : ?>
      <div class="row">
         <div class="col-sm-9">
            <p>
               <?php _e( 'Sorry, no posts matched your criteria.' ); ?>
            </p>
         </div>
      </div>
   <?php endif; ?>
</div>

<?php get_footer() ?>