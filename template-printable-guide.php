<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Printable Guide
*
*/ ?>
<?php get_header('printable') ?>

<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-10">
        <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
          <div class="page-<?= $post->post_name ?>">
            <h1><?php the_title(); ?></h1>
            <?php the_content(); ?>
          </div>
        <?php endwhile; else : ?>
        	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
        <?php endif; ?>        
      
       <?php
        global $post;
        $pageId = $post->ID;
        $menuId = get_post_meta($pageId, 'menu_id', true);
        if ($menuId) {
          $menuId = intval($menuId);
					$menuItems = wp_get_nav_menu_items($menuId);
	        foreach ( (array)$menuItems as $key => $menuItem) {
	          $classes = '';
	          $page = get_post($menuItem->object_id);
	          echo '<h2>';
	           echo apply_filters('the_title', $page->post_title);
	           echo '</h2>';
	           echo apply_filters('the_content', $page->post_content);
	        }
				}
      ?>
    </div>   
  </div>
</div> 

<?php get_footer('printable') ?>
