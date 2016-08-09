<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Wide
*
*/ ?>
<?php include_once( get_template_directory() . '/inc/narrative_method_store.php'); ?>
<?php get_header() ?>

<style type="text/css">
.appx {
  border: 1px silver solid;
  border-radius: 6px;
  padding: 6px;
  margin: 12px 0 12px 0;
}
.app .name, .method .name {
  font-weight: bold;
  font-size: 120%;>
}
/*.app .title, .method .title {
margin: 6px 0 0 0;
font-weight: bold;
color: gray;
}
*/
.app .content, .method .content {
  margin: 16px 0 6px 0;
}

.page-apps img.screengrab {
   max-width: 600px;
}

   
.page-apps [data-toggle="collapse"]::after {
  margin-left: 6px;
  font-family: "FontAwesome";
  font-style: normal;
  font-weight: normal;
  font-size: 90%;
  width: 12px;
  color: silver;
  line-height: 1;
  vertical-align: baseline;
  content: "\f078 ";
}
.page-apps [data-toggle="collapse"].collapsed::after {
  content: "\f054 ";
}
   
</style>

<div class="container-fluid page-apps" style="max-width: 1024px; margin: 0 auto;">  
  <div class="row">
    <div class="col-sm-9">
     
        
               <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <h1 style="text-align: left;"><?php the_title(); ?></h1>
      <?php endwhile; else : ?>
        <p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
           
     
    </div>
  </div>
  <div class="row">
    
    <div class="col-sm-9">
      <button class="button" id="openall">Open All</button>
      <script>
      jQuery('#openall').on('click', function (e) {       
        var button = jQuery(this);
        if (button.text() === 'Open All') {
          jQuery('.page-apps .collapse').collapse('show');
          button.text('Close All');
        } else {
          jQuery('.page-apps .collapse').collapse('hide');
          button.text('Open All');
        }
      });
      </script>
      <a class="btn btn-primary" href="/apps-print" style="margin-left: 6px; margin-top: -6px;" target="_blank">
         <span class="glyphicon glyphicon-print"></span>
      </a>
      
      <h2>Apps</h2>
      <?php
      $url = 'https://kbase.us/services/narrative_method_store/rpc';
      $nms = new NarrativeMethodStore((object)['url' => $url]);
      $apps = $nms->list_apps_full_info();
      # note that apps DO NOT have an active category flag.
 # but now they DO have an inactivate category.
      $apps = array_filter($apps, function ($x) {
          # exclude inactive items.
          if (array_search('inactive', $x->categories) !== false) {
             return false;
          } else {
             return true;
          }
        });
      echo '<div class="label label-success">Found ' . count($apps) . ' Apps</div>';
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
      <div class="apps-list">
        <div class="panel-group" id="apps" role="tablist" aria-multiselectable="true"  style="margin-top: 1em;"> 
          <?php 
          foreach ($apps as $app) {
            $appId = $app->id; 
          ?>
          <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="heading_app_<?= $appId ?>">
             <table width="100%" cellpadding="0" cellspacing="0" style="margin-left: -8px;">
                <tr>
                 <td style="width: 11%;" valign="top">
                  
                   <span class="fa-stack fa-2x" style="width: 70px;">
                    <span class="fa fa-square fa-stack-2x" style="color: rgb(0, 150, 136);"></span> 
                    <span class="fa fa-inverse fa-stack-1x fa-cubes" style=""></span> 
                    </span>
                 </td>
                 <td valign="top" style="width: 89%; padding-top: 6px;">
             
                    <h3 class="panel-title">
                      <a data-toggle="collapse" class="collapsed" data-parent="#apps" href="#collapse_app_<?= $appId ?>" aria-expanded="false" aria-controls="collapse_app_<?= $appId ?>">
                        <?= $app->name ?>
                      </a>            
                    </h3>
                    <p class="panel-subtitle"><?= $app->subtitle ?></p>
              
                 </td>
                 </tr>
               </table>
            </div>
            <div id="collapse_app_<?= $appId ?>" class="panel-collapse collapse" role="tabpanel" aria-labeled-by="heading_app_<?= $appId ?>">
              <div class="panel-body">
                <div class="app">
              
                  <!--<div class="authors">
                    <div class="title">Authors</div>
                    <div class="content">
                    <?php echo join('<br>', $app->authors); ?>
                    </div>
                    </div>
                  -->
                  <h4 class="title">Description</h4>
                  <div class="description"><?= $app->description ?></div>
                   <?php foreach ($app->screenshots as $screenshot) { 
                     $url = KBASE_SERVICE_URL_BASE . '/narrative_method_store' . $screenshot->url;
                     # echo $url
                     ?>
                    <img src="<?= $url ?>" class="screengrab">
                  <?php } ?>
                    <h4>Links</h4>
                    <ul>
                      <li><a href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>/#/narrativestore/app/<?= $appId ?>" target="_blank">App Details</a></li>
                      <li><a href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>/#/narrativemanager/new?app=<?= $appId ?>" target="_blank">Launch in New Narrative</a></li>
                    </ul>
                    
                    <!--
                    <div class="technical-description">
                    <div class="title">Technical Description</div>
                    <div class="content"><?php show($app->technical_description, 'No technical description available'); ?></div>
                    </div>
                    -->
                </div>
              </div>
            </div>
          </div>
     
        <?php } ?>
        </div>
      </div>
       
      <!-- METHODS begin -->

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
        echo '<div class="label label-success">Found ' . count($methods) . ' Methods</div>';
      ?>
      <div class="apps-list">
        <div class="panel-group" id="methods" role="tablist" aria-multiselectable="true"  style="margin-top: 1em;"> 
          <?php 
            foreach ($methods as $method) {
              $methodId = $method->id; 
               
              # $methodDetails = $nms->get_method_full_info($methodId);
              // var_dump($appSpec);
          ?> 
          <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="heading_method_<?= $methodId ?>"> 
             

             <table width="100%" cellpadding="0" cellspacing="0" style="margin-left: -8px;">
                <tr>
                 <td style="width: 12%;" valign="top">
                  
                   <span class="fa-stack fa-2x" style="width: 70px;">
                    <span class="fa fa-square fa-stack-2x" style="color: rgb(103, 58, 183);"></span> 
                    <span class="fa fa-inverse fa-stack-1x fa-cube" style=""></span> 
                    </span>
                 </td>
                 <td valign="top" style="width: 88%; padding-top: 6px;">
             
             
             
                    <h3 class="panel-title">
                      <a data-toggle="collapse" class="collapsed" data-parent="#methods" href="#collapse_method_<?= $methodId ?>" aria-expanded="false" aria-controls="collapse_method_<?= $methodId ?>">
                        <?= $method->name ?>
                      </a>            
                    </h3>
                  <p class="panel-subtitle"><?= $method->subtitle ?></p>
                   </td>
                </tr>
               </table>
          </div>
          <div id="collapse_method_<?= $methodId ?>" class="panel-collapse collapse" role="tabpanel" aria-labeled-by="heading_method_<?= $methodId ?>">
            <div class="panel-body">
              <div class="method">
                <!--<div class="authors">
                  <div class="title">Authors</div>
                  <div class="content">
                  <?php echo join('<br>', $method->authors); ?>
                  </div>
                  </div>
                  -->
                    <h4 class="title">Description</h4>
                    <div class="description"><?= $method->description ?></div>
                   <?php foreach ($method->screenshots as $screenshot) { 
                     $url = KBASE_SERVICE_URL_BASE . '/narrative_method_store' . $screenshot->url;
                     
                     # echo $url; echo '<br>'
                     ?>
                    <img src="<?= $url ?>" class="screengrab">
                  <?php } ?>
                  <!--
                    <div class="technical-description">
                    <div class="title">Technical Description</div>
                    <div class="content"><?php show($method->technical_description, 'No technical description available'); ?></div>
                    </div>
                    -->
                  </div>
                    <h4>Links</h4>
                      <ul>
                        <li><a href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>/#/narrativestore/method/<?= $methodId ?>" target="_blank">Method Details</a></li>
                        <li><a href="<?= KBASE_FUNCTIONAL_SITE_URL_BASE ?>/#/narrativemanager/new?method=<?= $methodId ?>" target="_blank">Launch</a></li>
                      </ul>
                </div>
              </div>
            </div>

          <?php } ?>
        </div>
      </div> 
      <!-- METHODS end -->
    </div>
    <div class="col-sm-3">
      <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <p><?php the_content(); ?></p>
      <?php endwhile; else : ?>
        <p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div> 

<script>
/*jQuery('.collapse').on('shown.bs.collapse', function () {
  console.log('scroll to ' + jQuery(this).offset().top);
  jQuery(this).scrollTop(jQuery(this).offset().top);
});
*/
</script>

<?php get_footer() ?>
