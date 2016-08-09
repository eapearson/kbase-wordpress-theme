<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    
    <div class="col-sm-8">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <h1><?php the_title(); ?></h1>
      <div class="post-date"><?php the_date(); ?></div>
      <?php the_content(); ?>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div> 

<?php get_footer() ?>
