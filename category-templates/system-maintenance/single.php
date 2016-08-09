<?php /** * The basic, canonical theme template. * * @package: @kbase * */ ?>
<?php get_header() ?>


<div class="container-fluid" style="max-width: 1024px; margin: 0 auto;">
   <div class="row" style="margin-bottom: 2em;">
      <div class="col-sm-12">
         <div class="label label-default" style="font-size: 150%; font-weight: bold;">System Notification</div>
      </div>
   </div>
   <?php $postsId=uniqid(); ?>
   <?php if ( have_posts() ) { ?>
     <div id="system_maintenance_<?= $postsId ?>">
     
    <?php 
     while ( have_posts() ) {
        the_post(); ?>

  
      <div class="row">
         <div class="col-sm-12">
            <h1><?= get_the_title() ?></h1>
         </div>
      </div>

      <div class="row">
         <div class="col-sm-10">
            <h3>When?</h3>
            <div data-method="nice-elapsed" style="font-style: italic; margin-bottom: 0.5em;" data-arg-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>" data-arg-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></div>

            <div>
               on <span data-method="nice-timerange" style="font-style: italic; margin-bottom: 1em;" data-arg-from="<?= get_post_custom_values('kb_notification_start_at')[0] ?>" data-arg-to="<?= get_post_custom_values('kb_notification_end_at')[0] ?>"></span> <sup>*</sup>
            </div>
            <h3>Summary</h3>
            <div class="-excerpt" style="font-style: italic; margin-bottom: 1em;">
               <?= get_the_excerpt() ?>
            </div>
            <h3>Description</h3>
            <div class="-content" style="margin-bottom: 1em;">
               <?php the_content() ?>
            </div>
         </div>
      </div>
      <hr width="80%" style="margin-left: auto; margin-right: auto; border-color: #e0e0e0;">
      <p id="localtimenote"><sup>*</sup> Time is expressed in your local timezone as defined by your web browser (which is <span data-method="nice-timezone-offset"></span>).</p>
   
<?php } ?>
  
  </div>

  <script>
   jQuery(document).ready(function ($) {
      $('#system_maintenance_<?= $postsId ?> [data-method]').each(function () {
         var method = $(this).data('method');
         var result;
         switch (method) {
         case 'nice-timezone-offset':
            result = window.kbase.Utils.niceTimezoneOffset();
            break;
         case 'nice-timerange':
            var from = $(this).data('arg-from');
            var to = $(this).data('arg-to');
            var fromDate = window.kbase.Utils.iso8601ToDate(from);
            var toDate = window.kbase.Utils.iso8601ToDate(to);
            result = window.kbase.Utils.niceTimerange(fromDate, toDate, {
               showDay: true
            });
            break;
         case 'nice-elapsed':
            var from = $(this).data('arg-from');
            var to = $(this).data('arg-to');
            var fromDate = window.kbase.Utils.iso8601ToDate(from);
            var toDate = window.kbase.Utils.iso8601ToDate(to);
            result = window.kbase.Utils.niceElapsedTimeRange(fromDate, toDate);
            break;
         }
         if (result) {
            $(this).text(result);
         }
      });
   });
</script>

<?php } else { ?>

<p>
   <?php _e( 'Sorry, no posts matched your criteria.' ); ?>
</p>

<?php } ?>
</div>

<?php get_footer() ?>
