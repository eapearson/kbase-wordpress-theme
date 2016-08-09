<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid staff-member" style="max-width: 960px; margin: 0 auto;">  
  <div class="row">
    
    <div class="col-sm-8">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
         <?php $custom 	= get_post_custom(); ?>
      <div class="item">
        <h1><?php the_title(); ?></h1>
        <h4 class="title" ><?= $custom['_staff_member_title'][0]; ?></h4>
        <div style="float: left; margin: 0 10px 0 0;"><?php the_post_thumbnail(); ?></div>
        <?php the_content(); ?>
      </div>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div> 

<?php get_footer() ?>
