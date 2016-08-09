<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Wide
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-12">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <h1 style="text-align: left;"><?php the_title(); ?></h1>
      <p><?php the_content(); ?></p>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div> 

<?php get_footer() ?>
