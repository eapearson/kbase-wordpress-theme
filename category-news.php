<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Wide
*
*/ ?>
<?php get_header() ?>

<style type="text/css">
.category-news .item {
  margin-top: 16px;
}
.category-news .item .date {
  font-style: italic;
}
.section-heading {
  margin-top: 16px;
  border-radius: 6px;
  padding: 6px;
  border: none;
  background-color: gray;
  color: silver;
  font-weight: bold;
  text-align: center;
}
</style>
<div class="container-fluid category-news" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-12">
      <h1>News</h1>
    </div>
    <div class="col-sm-6">
    </div>
    <div class="col-sm-6">
      <?php $itemNumber = 0; ?>
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <div class="item">
        <?php if ($itemNumber === 0): ?>
          <!-- full display for the first -->
          <div class="section-heading">Current Article</div>
          <h2 style="text-align: left;"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
          <div class="date"><?php the_date(); ?></div>
          <?php the_content(); ?>
          <div class="section-heading">Recent Articles</div>
        <?php else: ?>
          <!-- compact display for the rest -->
          <h3 style="text-align: left;"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
          <div class="date"><?php the_date(); ?></div>      
          <?php the_excerpt(); ?>          
        <?php endif; ?>
      </div>
      
        <?php $itemNumber++; ?>
      <?php endwhile; else : ?>        
      	<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
        
    </div>
  </div>
</div> 

<?php get_footer() ?>
