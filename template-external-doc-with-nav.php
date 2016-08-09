<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: External Doc with Nav
*
*/ ?>
<?php get_header() ?>
<style type="text/css">
.template-external-doc p {
  text-indent: 0;
  margin-bottom: 0.5em;
}
</style>
<div class="container-fluid template-external-doc" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-12">
     <div class="the-document">    
        <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
       <p><?php the_content(); ?></p>
       <?php endwhile; else : ?>
       	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
       <?php endif; ?>
     </div>
    </div>
  </div>
 
    
    
    <div class="row">   
     
      <div class="col-sm-12">
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <h1 style="margin-bottom: 20px; text-align: center;"><?php the_title(); ?></h1>
      <?php endwhile; else : ?>
     	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
      </div>
    </div>
    
 
  <div class="row">   
    <div class="col-sm-4">
      <?php
      $fileset = get_post_meta($post->ID, 'kb_include_file_set', true);
      $fileName = get_post_meta($post->ID, 'kb_include_file_name', true);
      $fileType = get_post_meta($post->ID, 'kb_include_file_type', true);
      $s = '[kb_include_file fileset="' . $fileset . '" filename="' . $fileName . '_nav' . '" filetype="'.$fileType.'"]';
      echo do_shortcode($s);
      ?>
    </div>
    <div class="col-sm-8">
      <?php
      $fileset = get_post_meta($post->ID, 'kb_include_file_set', true);
      $fileName = get_post_meta($post->ID, 'kb_include_file_name', true);
      $fileType = get_post_meta($post->ID, 'kb_include_file_type', true);
      $s = '[kb_include_file fileset="' . $fileset . '" filename="' . $fileName . '" filetype="'.$fileType.'"]';
      echo do_shortcode($s);
      ?>
    </div>
  </div>
</div>
<?php get_footer() ?>