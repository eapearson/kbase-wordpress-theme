<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


  
  <div class="row">
    <div class="col-md-8">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <h1><?php the_title(); ?></h1>
      <p><?php the_content(); ?></p>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
    
    <div class="col-md-4">
      <div class="well">
        <h2>News</h2>
       <?php echo do_shortcode('[display-posts category="news" posts_per_page="-1" include_date="true" order="DSC" orderby="date"]'); ?>
      </div>
      <div class="well">
        <h2>Events</h2>
        <p>events here...</p>
      </div>
    </div>
    
  </div>
 

<?php get_footer() ?>
