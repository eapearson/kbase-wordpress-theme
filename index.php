<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 960px; margin: 0 auto;">  
  <div class="row">
    
    <!--
      <div class="col-md-3">
      <div class="well">
        <h2>Left Col</h2>
        <p>Stuff here</p>
      </div>
    </div>
      -->
    <div class="col-sm-2">
    </div>
    <div class="col-sm-8">
      <div class="the-content">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <h1><?php the_title(); ?></h1>
      <div class="post-date"><?php the_date(); ?></div>
      <?php the_content(); ?>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
      </div>
    </div>
    <div class="col-sm-2">
    </div>
  </div>
</div> 

<?php get_footer() ?>
