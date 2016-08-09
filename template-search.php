<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Search Page
*
*/ ?>
<?php get_header() ?>

   <div class="row">
    <div class="col-sm-8">
      <h1>Search Page</h1>
      <?= get_search_form(); ?>
    </div>
  </div>
 

<?php get_footer() ?>
