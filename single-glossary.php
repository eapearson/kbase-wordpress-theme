<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
    
  <div class="row">
    <div class="col-sm-8">
        <h1><?php the_title(); ?></h1>
    </div>
    <div class="col-sm-4">
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      <?php the_content(); ?>
    </div>
    <div class="col-sm-4">
      <div><a href="/glossary">Glossary Index</a></div> 
      <h4>Linked on these pages</h4>
      <?= do_shortcode('[glossary_term_usage]Not linked anywhere[/glossary_term_usage]'); ?>
     
    </div>
  </div>
  
  <?php endwhile; else : ?>
  	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
  <?php endif; ?>
  
</div> 

<?php get_footer() ?>
