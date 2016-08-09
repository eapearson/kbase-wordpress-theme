<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>

<div class="container-fluid staff-member" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-12">
      
     <div class="post hentry ivycat-post event medium">
  
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
     	 <h1 class="title" style="font-weight: bold;">
         
         
         <?php 
         $useTitle = get_post_meta(get_the_ID(), 'kb_include_use_title', true);
         if ($useTitle && ($useTitle === 'yes')) {
           the_title(); 
         } ?>
           
       </h1>
       <?php the_content(); ?>       
       <?php 
       $docType = get_post_meta($post->ID, 'kb_include_document_type', true);
       get_template_part('include', $docType)
       ?>
     
     <?php endwhile; else : ?>
     	<p><?php _e( 'Sorry, I could not find that event.' ); ?></p>
     <?php endif; ?>
      
    </div>
  </div>
</div> 

<?php get_footer() ?>
