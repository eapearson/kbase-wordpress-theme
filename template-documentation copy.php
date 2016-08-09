<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Documentation
*
*/ ?>
<?php get_header() ?>
<div class="container-fluid template-documentation" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">

    <div class="col-sm-8">
      <div class="the-document">
       
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
         <h1 style="margin-bottom: 8px;"><?php the_title(); ?></h1>
         <?php
         # breadcrump...
         $parentId = $post->post_parent;
         $parentPage = get_page($parentId);
         $parentTitle = '<a href="' . get_permalink($parentPage->ID) . '">' . $parentPage->post_title . '</a>';     
         echo '<div style="font-weight: bold;margin-top: 0px;"> in the <i>' . $parentTitle . '</i></div>'; 
         ?>
      
    <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
      </div>
    </div>
    <div class="col-sm-4">
     
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      <div class="the-document">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        
      <p><?php the_content(); ?></p>
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
      </div>
    </div>
    <div class="col-sm-4">
      <h3 style="margin-left: 15px;">Contents</h3>
      <?php
      $menuId = get_post_meta($post->ID, 'menu_id', true);
      $s = '[kb_vertical_menu menuid="' . $menuId . '"]';
      echo do_shortcode($s);
      ?>
    </div>
   
  </div>
</div>
<?php get_footer() ?>