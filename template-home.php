<?php 
/**
* A page theme which is just like the home page. For mocking up new home pages, or for using on the home page. 
* 
* @package: @kbase 
* Template Name: Home
*
*/ ?>
<?php get_header() ?>

<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-md-12">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      
      <?php the_content(); ?>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div> 

<?php get_footer() ?>
