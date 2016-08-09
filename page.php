<?php /** * The basic, canonical theme template. * * @package: @kbase * */ ?>
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
         <div class="col-sm-8">
            <?php the_content(); ?>
         </div>
      </div>
   </div>
   <?php endwhile; else : ?>
      <div class="row">
         <div class="col-sm-8">
            <p>
               <?php _e( 'Sorry, no posts matched your criteria.' ); ?>
            </p>
         </div>
      </div>
   <?php endif; ?>
</div>

<?php get_footer() ?>