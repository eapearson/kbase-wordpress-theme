<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


  <style type="text/css">
  .section {
    padding: 1em 1.5em 2em 1.5em;
    margin: 3em 0 2em 0;
  }
  .section:nth-child(even) {
    background-color: #E0E0E0;
  }
  .section h2 {
    text-align: center;
    margin-bottom: 1em;
  }
  .section p,
  .section ul,
  .section table {
    font-size: 120%;
    line-heigth: 1.5;
  }
  .section ul {
      position: relative;
      left: 1.5em;
      list-style: outside none none;
      padding: 0px;
      line-height: 2em;
  }
  .section ul li {
    line-height: 1.5em;
  }
  .section li:before {
      content: "▶";
      color: #3576BE;
      position: absolute;
      left: -1.5em;
  }
    table.kbase-includes {
      width: 100%;
      margin: 0 auto;
    }
    table.kbase-includes tr td {
      width: 50%;
    }
  table.kbase-includes tr td:nth-child(1) {
    text-align: right;
  }
  </style>
  
  
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
    
    <div class="container-fluid" style="max-width: 960px; margin: 0 auto;">  
 
 <p><?php the_content(); ?></p>
 <?php endwhile; else : ?>
 	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
 <?php endif; ?>
 
   </div>
    
   
<?php get_footer() ?>
