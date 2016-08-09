<?php /** * The basic, canonical theme template. * * @package: @kbase * Template Name: Wide * */ ?>
<?php include_once( get_template_directory() . '/inc/narrative_method_store.php'); ?>
<?php get_header() ?>

<style type="text/css">
   .appx {
      border: 1px silver solid;
      border-radius: 6px;
      padding: 6px;
      margin: 12px 0 12px 0;
   }
   
   .app .name,
   .method .name {
      font-weight: bold;
      font-size: 120%;
      
   }
   .method-title, .app-title {
      margin-top: 20px;
      font-size: 120%;
      font-weight: bold;
   }
   /*.app .title, .method .title {
margin: 6px 0 0 0;
font-weight: bold;
color: gray;
}
*/
   
   .app .content,
   .method .content {
      margin: 16px 0 6px 0;
   }
   
   .page-apps img.screengrab {
      max-width: 600px;
   }
</style>

<div class="container-fluid page-apps" style="max-width: 1024px; margin: 0 auto;">
   <div class="row">
      <div class="col-sm-12">


         <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
         <h1 style="text-align: left;"><?php the_title(); ?></h1>
         <p>
            <?php the_content(); ?>
         </p>
         <?php endwhile; else : ?>
         <p>
            <?php _e( 'Sorry, no posts matched your criteria.' ); ?>
         </p>
         <?php endif; ?>

      </div>
   </div>
   <div class="row">


    <div class="col-sm-12">
      
      
      <h2>Apps</h2>
      <?php
      $url = 'https://kbase.us/services/narrative_method_store/rpc';
      $nms = new NarrativeMethodStore((object)['url' => $url]);
      $apps = $nms->list_apps_full_info();
      # var_dump($apps);
      # note that apps DO NOT have an active category flag.
      # echo '<div class="label label-success">Found ' . count($apps) . ' Apps</div>';

      $apps = array_filter($apps, function ($x) {
          # exclude inactive items.
          if (array_search('inactive', $x->categories) !== false) {
             return false;
          } else {
             return true;
          }
        });

      usort($apps, function ($a, $b) {
        return strcasecmp($a->name, $b->name);
      });
      function isBlank($s) {
        if (!$s) {
          return true;
        }
        if (strlen(trim($s)) == 0) {
          return true;
        }
        if (trim($s) == '&nbsp;') {
          return true;
        }
        return false;
      }
      function show ($s, $defaultText) {
        if (isBlank($s)) {
          echo '<p>' . $defaultText .'</p>';
        } else {
          echo $s;
        }
      }
      ?>
      <?php 
         foreach ($apps as $app) {
           $appId = $app->id; 
        ?>
            <div class="app-title"><?= $app->name ?></div>
            <div>
               <?= $app->subtitle ?>
            </div>
              
       <?php } ?>
      
       <h2>Methods</h2>
      <?php
        $methods = $nms->list_methods_full_info();
        # var_dump($methods); 
        $methods = array_filter($methods, function ($x) {
          if (array_search('active', $x->categories) === false) {
             return false;
          } else if (array_search('viewers', $x->categories) !== false) {
             return false;
          } else {
             return true;
          }
        });
        usort($methods, function ($a, $b) {
          return strcasecmp($a->name, $b->name);
        });
        # echo '<div class="label label-success">Found ' . count($methods) . ' Methods</div>';
      ?>
          <?php 
         foreach ($methods as $method) {
        ?>
            <div class="method-title"><?= $method->name ?></div>
            <div>
               <?= $method->subtitle ?>
            </div>
              
       <?php } ?>
       
       
    </div>
    
    
    
    
   </div>
</div>


<?php get_footer() ?>
