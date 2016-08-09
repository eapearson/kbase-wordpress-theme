<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>

<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">
    <div class="search">
     <div class="row">
       <div class="col-sm-8">
         <h1 class="page-title"><?php printf( __( 'Search Results for: %s', 'kbase' ), get_search_query() ); ?></h1>
         <p>Found <?php global $wp_query; echo $wp_query->found_posts ?> items</p>

         <?php if ( have_posts() ) { 
              while ( have_posts() ) {
                  the_post();
                  get_template_part( 'content', get_post_format() );
              }
            } else {
              get_template_part( 'content', 'none' );
            }
         ?>
       </div>
     </div>
   </div>
</div>
 

<?php get_footer() ?>
