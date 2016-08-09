<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">  
    <div class="row">
        <div class="col-sm-8">
            <h1>Glossary Index</h1>
            <?= do_shortcode('[glossary_term_list desc="excerpt" /]'); ?>
        </div>
        <div class="cols-sm-4">
        </div>
    </div>
</div> 

<?php get_footer() ?>
