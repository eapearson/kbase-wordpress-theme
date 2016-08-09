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
   
    <div class="col-sm-8">
      
     <!-- Start of Post Wrap -->
     <div class="post hentry ivycat-post event medium">
     	<!-- This is the output of the post TITLE -->
  
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
     	<h1 class="title" style="font-weight: bold;">
         <?php the_title(); ?>
       </h1>
       <div class="date-location">
       <div class="date" style="font-style: italic; color: gray; display: inline-block;">
         <?php
         $start = new DateTime(get_post_meta(get_the_ID(), 'kb_calendar_start', true)); 
         $end = new DateTime(get_post_meta(get_the_ID(), 'kb_calendar_end', true));
    
         if ($start->format('Y') === $end->format('Y')) {
           if ($start->format('m') == $end->format('m')) {
             if ($start->format('d') == $end->format('d')) {
               echo $start->format('M j, Y');
             } else {
               echo $start->format('M j') . ' - ' . $end->format('j, Y');
             }
           } else {
             echo $start->format('M j') . ' - ' . $end->format('M j, Y');
           }
         } else {
           echo $start->format('M j, Y') . ' - ' . $end->format('M d, Y');
         }
         ?>
       </div>
  
       <?php 
       $loc = get_post_meta(get_the_ID(), 'kb_calendar_location', true); 
       if (!empty($loc)):
       ?>
       <div class="location" style="font-style: normal; display: inline-block">
         in <?= $loc ?>
       </div>
       <?php endif; ?>
       </div>
       
       <?php 
       $url = get_post_meta(get_the_ID(), 'kb_calendar_url', true); 
       if (!empty($url)):
       ?>
       <div class="link" style="font-style: normal; display: inline-block">
         Event Link <a href="<?= $url ?>" target="_blank"><?= $url ?></a>
       </div>
       <?php endif; ?>
       </div>

     	<!-- This is the output of the EXCERPT -->
     	<div class="content" style="font-style: normal;">
     		<?php the_content(); ?>
     	</div>

     </div>
     <!-- // End of Post Wrap -->
     
     <?php endwhile; else : ?>
     	<p><?php _e( 'Sorry, I could not find that event.' ); ?></p>
     <?php endif; ?>
     
    </div>
  </div>
</div> 

<?php get_footer() ?>
