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
    <div class="col-sm-4">     
    </div>
    <div class="col-sm-8">
      <div class="the-document">
       
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
         <h1 style="margin-bottom: 8px;"><?php the_title(); ?></h1>
         <?php
         # breadcrump...
         $parentPage = get_page($post->post_parent);
         if ($parentPage) {
            $menuId = get_post_meta($parentPage->ID, 'menu_id', true);
            $printPage = get_post_meta($parentPage->ID, 'print_page', true);
         } else {
            $menuId = get_post_meta($post->ID, 'menu_id', true);
            $printPage = get_post_meta($post->ID, 'print_page', true);
         }

         if ($post->ID == $parentPage->ID) {
            $invisible = 'visibility: hidden;';
         } else {
            $invisible = '';
         }

         $parentTitle = '<a href="' . get_permalink($parentPage->ID) . '">' . $parentPage->post_title . '</a>';     
         echo '<div style="font-weight: bold;margin-top: 0px;'.$invisible.'"> in the <i>' . $parentTitle . '</i></div>'; 
         ?>
      
      <?php endwhile; else : ?>
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
      </div>
    </div>
    
  </div>
  <div class="row">
    <div class="col-sm-4">
      <h3 style="margin-left: 15px;">Contents</h3>
      <?php
      # $menuId = get_post_meta($post->ID, 'menu_id', true);
      $s = '[kb_vertical_menu menuid="' . $menuId . '"]';
      echo do_shortcode($s);
      ?>
    </div>
    <div class="col-sm-8">
      <div class="the-document">
       <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <style type="text/css">
           nav.kbase-guide-menu .paginination {
              margin: 0;
           }
         </style>
         <nav class="kbase-guide-menu">
         <div style="display: inline-block; vertical-align: middle;">
         <?= do_shortcode('[kbase_pagination_menu menuid="' . $menuId . '"]'); ?>
         </div>
         <?php if ($printPage) { ?>
         <a class="btn btn-primary" href="/<?= $printPage ?>" style="margin-left: 6px; margin-top: -6px;" target="_blank">
            <span class="glyphicon glyphicon-print"></span>
         </a>
         <?php } ?>
         </nav>
         <p><?php the_content(); ?></p>
        <?= do_shortcode('[kbase_pagination_menu menuid="' . $menuId . '"]'); ?>
       <?php endwhile; else : ?>
         <p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
       <?php endif; ?>
      </div>
    </div>
  </div>
</div>
<?php get_footer() ?>