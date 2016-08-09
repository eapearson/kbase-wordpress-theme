<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
* Template Name: Wide
*
*/ ?>

<?php include_once( get_template_directory() . '/inc/workspace.php'); ?>
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
			<!--
      <a class="btn btn-primary" href="/apps-print" style="margin-left: 6px; margin-top: -6px;" target="_blank">
         <span class="glyphicon glyphicon-print"></span>
      </a>
				-->
				<br><br>
				
				<?php
					
				function niceElapsedTime($dateString) {
					if (!$dateString) {
						return '';
					}
					$d = new DateTime($dateString);
					$now = new DateTime('now');
					$diff = $now->diff($d);
					#return 'test:' . $diff->y;
					# var_dump($diff);
					if ($diff->y) {
						return $d->format('M j, Y');
					} elseif ($diff->m) {
						return $d->format('M j');
					} elseif ($diff->d) {
						if ($diff->d == 1) {
							return 'yesterday';
						} else if ($diff->d < 7) {
							return $diff->d . ' days ago';
						} else {
							return $d->format('M j');
						}
					} elseif ($diff->h) {
						if ($diff->h == 1) {
							if ($diff->m) {
								return $diff->h . ' hour, ' . $diff->m . ' minutes ago';
							} else {
								return $diff->h . ' hour ago';
							}
						} else {
							return $diff->h . ' hours ago';
						}
					} elseif ($diff->m) {
						if ($diff->m == 1) {
							if ($diff->s) {
								return $diff->m . ' min, ' . $diff->s . ' sec ago';
							} else {
								return $diff->m . 'min, ' . $diff->s . 'sec ago';
							}
						} else {
							return $diff->m . ' minutes ago';
						}
					} elseif ($diff->s) {
						return $diff->s . ' seconds ago';
					}
						
					
				}
				
				function niceRunTime($mseconds) {
					if (!$mseconds) {
						return '';
					}
					$seconds = round($mseconds/1000);
					$minutes = floor($seconds/60);
					$seconds = $seconds % 60;
					$hours = floor($minutes/60);
					$minutes = $minutes % 60;
					$days = floor($hours/24);
					$hours = $hours % 24;
					$showSeconds = false;
					if ($days) {
						return ($days?$days.'d':'') . ($hours?' '.$hours.'h': '');
					} else if ($hours) {
						return ($hours?' '.$hours.'h':'') . ($minutes?' '.$minutes.'m':'');
					} else {
						return ($minutes?' '.$minutes.'m':'') . ($seconds && $showSeconds?' '.$seconds.'s':'');
					}
				}
					
				?>
      
      <?php
      $url = 'https://kbase.us/services/ws';
      $wsclient = new Workspace((object)['url' => $url]);
			
      $url = 'https://kbase.us/services/narrative_method_store/rpc';
      $nmsClient = new NarrativeMethodStore((object)['url' => $url]);
			$appMap = (object)[];
      $apps = $nmsClient->list_apps_full_info();
			foreach ($apps as $app) {
				$appMap->{$app->id} = $app->name;
			}
			$methodMap = (object)[];
      $methods = $nmsClient->list_methods_full_info();
			foreach ($methods as $method) {
				$methodMap->{$method->id} = $method->name;
			}
			
			
			$ver = $wsclient->ver();
			
			# echo '<p>Workspace version is ' . $ver .'</p>';
			
			$workspaces = $wsclient->list_workspace_info((object)[
				'excludeGlobal' => 0, 
				'showDeleted' => 0
			]);
				
				/*
				typedef tuple<
				0 ws_id id, 
				1 ws_name workspace, 
				2 username owner, 
				3 timestamp moddate,
				4 int object, 
				5 permission user_permission, 
				6 permission globalread,
				7 lock_status lockstat, 
				8 usermeta metadata> workspace_info;
				*/
			# echo '<p>There are ' . count($workspaces) . ' public workspaces.';
				
			$narratives = array_values(array_filter($workspaces, function ($workspace) {
					return (property_exists($workspace[8], 'narrative')
                                && preg_match('/^\d+$/', $workspace[8]->narrative)
							    && property_exists($workspace[8], 'narrative_nice_name')
							    && (!property_exists($workspace[8], 'is_temporary') ||
										$workspace[8]->is_temporary == 'false'));
					}));
					
  		$narratives = array_map(function($ws) {
				return (object)[
					'id' => $ws[0],
					'workspace' => $ws[1],
					'owner' => $ws[2],
					'moddate' => $ws[3],
					'object_id' => $ws[4],
					'user_permission' => $ws[5],
					'globalread' => $ws[6],
					'lockstat' => $ws[7],
					'meta' => $ws[8]
					// 'ref' => $ws[0] . '/' . $ws[4],
					// 'ref2' => $ws[0] . '_' . $ws[4],
				];
			}, $narratives);
					
			
			
			
			$refs = array_map(function($ws) {
				return (object)['ref' => $ws->id . '/' . $ws->meta->narrative];
			}, $narratives);
			
			/*
			typedef tuple<
			0 obj_id objid, 
			1 obj_name name, 
			2 type_string type,
		  3 timestamp save_date, 
			4 int version, 
			5 username saved_by,
		  6 ws_id wsid, 
			7 ws_name workspace, 
			8 string chsum, 
			9 int size, 
			10 usermeta meta>
			object_info;
			*/
			function prop_json_decode(&$obj, $prop) {
				if (property_exists($obj, $prop)) {
					$obj->{$prop} = json_decode($obj->{$prop});
				};
			}
			$objects = array_map(function($obj) use ($appMap, $methodMap){
				if ($obj) {
					$newObj = (object)[
						'objid' => $obj[0],
						'name' => $obj[1],
						'type' => $obj[2],
						'save_date' => $obj[3],
						'version' => $obj[4],
						'saved_by' => $obj[5],
						'ws_id' => $obj[6],
						'ws_name' => $obj[7],
						'checksum' => $obj[8],
						'size' => $obj[9],
						'meta' => $obj[10],
						'ws_obj_id' => 'ws.' . $obj[6] . '.obj.' . $obj[0]
					];
					$meta = $obj[10];
					prop_json_decode($meta, 'apps');
					prop_json_decode($meta, 'methods');
					prop_json_decode($meta, 'job_info');
					prop_json_decode($meta, 'data_dependencies');
					$appWeight = 0;
					if (@$meta->methods->app) { 
						$appWeight += count((array)$meta->methods->app);
						$apps = [];
						foreach ((array)$meta->methods->app as $k => $v) {
                            // WORKAROUND: There are cases in which the app and method ids in a narrative do 
                            // not match the narrative method store, for some reason. Could be out of date
                            // narratives.
                            // TODO: report these somehow...
                            if (property_exists($appMap, $k)) { 
                                array_push($apps, (object)['id' => $k, 'name' => $appMap->{$k}]);
                            }
						}
						usort($apps, function ($a,$b) {
							return strcasecmp($a->name,$b->name);
						});
						$newObj->apps = $apps;						
					}
					
					if (@$meta->methods->method) {
						$appWeight += count((array)$meta->methods->method);
						$methods = [];
						foreach ((array)$meta->methods->method as $k => $v) {
                            if (property_exists($methodMap, $k)) {
                                array_push($methods, (object)['id' => $k, 'name' => $methodMap->{$k}]);
                            }
						}
						usort($methods, function ($a,$b) {
							return strcasecmp($a->name,$b->name);
						});
						$newObj->methods = $methods;						
					}
					
					$newObj->app_weight = $appWeight;
					
					$codeWeight = $appWeight;
					if (@$meta->methods->ipython->code) {
						$codeWeight += $meta->methods->ipython->code;
					}
					$newObj->code_weight = $codeWeight;
					
					$cellWeight = $codeWeight;
					if (@$meta->methods->ipython->markdown) {
						$cellWeight += $meta->methods->ipython->markdown;
					}
					$newObj->cell_weight = $cellWeight;
					
					return $newObj;
				} else {
					return null;
				}
			}, $wsclient->get_object_info($refs, true, true)); 
			
			
			$i = 0;
			foreach ($narratives as $narrative) { 
				$narrative->object = $objects[$i];
				$i++;
			}
			
			$narratives = array_filter($narratives, function ($x) {
				return ($x->object !== null);
			});

			$sortBy = 'weight';
			switch ($sortBy) {
			case 'title':				
					usort($narratives, function ($a, $b) {
						return strcasecmp($a->meta->narrative_nice_name, $b->meta->narrative_nice_name);
					});
					break;
		  case 'weight':
				usort($narratives, function ($a, $b) {
					return ($b->object->code_weight - $a->object->code_weight);
				});
				break;
			}
			
			$none = '-';
			
			echo '<p>There are ' . count($narratives) . ' Public Narratives.</p>';
			?>
			
      <div class="apps-list">
        <div class="panel-group" id="methods" role="tablist" aria-multiselectable="true"  style="margin-top: 1em;">
			
			<?php 			
			foreach ($narratives as $narrative)	{
			?>
		      <div class="panel panel-default">
		        <div class="panel-heading" role="tab" id="heading_method_<?= $methodId ?>"> 
		          <table width="100%" cellpadding="0" cellspacing="0" style="margin-left: -8px;">
		            <tr>
		             <td style="width: 12%;" valign="top">
		               <span class="fa-stack fa-2x" style="width: 70px;">
		                	<span class="fa fa-square fa-stack-2x" style="color: rgb(103, 58, 183);"></span> 
		                	<span class="fa fa-inverse fa-stack-1x fa-file" style=""></span> 
		               </span>
		             </td>
		             <td valign="top" style="width: 88%; padding-top: 6px;">
		                <h3 class="panel-title">
		                  <a data-toggle="collapse" class="collapsed" data-parent="#methods" href="#collapse_method_<?= $narrative->id ?>" aria-expanded="false" aria-controls="collapse_method_<?= $narrative->id ?>">
		                    <?= $narrative->meta->narrative_nice_name ?>
		                  </a>            
		                </h3>
		              <p class="panel-subtitle"><?= $narrative->owner ?></p>
		               </td>
		            </tr>
		          </table>
						</div>
		      </div>
		      <div id="collapse_method_<?= $narrative->id ?>" class="panel-collapse collapse" role="tabpanel" aria-labeled-by="heading_method_<?= $narrative->id ?>">
		          <div class="panel-body">
		            <div class="details">
									<table class="table ">
										<tr>
											<th width="20%">
												
											</th>
											<td>
												<a href="https://narrative.kbase.us/narrative/<?= $narrative->object->ws_obj_id ?>" target="_blank">Open Narrative</a>
											</td>
										</tr>
										
										<tr>
											<th width="20%">
												Last Saved
											</th>
											<td>
												<?= niceElapsedTime($narrative->object->save_date) ?>
											</td>
										</tr>
										<tr>
											<th>
												Version
											</th>
											<td>
												<?= $narrative->object->version ?>
											</td>
										</tr>
										<!--
										<tr>
											<th>
												Saved By
											</th>
											<td>
												<?= $narrative->object->saved_by ?>
											</td>
										</tr>
											-->
										<tr>
											<th>
												Weight (app/code/cell)
											</th>
											<td>
												<?= $narrative->object->app_weight ?>/<?= $narrative->object->code_weight ?>/<?= $narrative->object->cell_weight ?>
												
											</td>
										</tr>
											
										<tr>
											<th>
												Apps
											</th>
											<td>
												<?php
												$apps = @$narrative->object->apps;
												# $apps = @$narrative->object->meta->methods->app;
												if ($apps && count((array)$apps) > 0) {
													foreach ($apps as $app) {
														echo $app->name . '<br>';
													}
												} else {
													echo $none;
												}
													
												?>
												
											</td>
										</tr>
										<tr>
											<th>
												Methods
											</th>
											<td>
												<?php
												$methods = @$narrative->object->methods;
#												$methods = @$narrative->object->meta->methods->method;
												if ($methods && count((array)$methods) > 0) {
													foreach ($methods as $method) {
														echo $method->name . '<br>';
													}
												} else {
													echo $none;
												}
													
												?>
											</td>
										</tr>
										<tr>
											<th>
												Code Cells
											</th>
											<td>
												<?php
												$codeCells = @$narrative->object->meta->methods->ipython->code;
												if ($codeCells) {
													echo $codeCells;
												} else {
													echo $none;
												}	
												?>
											</td>
										</tr>
										<tr>
											<th>
												Text Cells
											</th>
											<td>
												<?php
												$textCells = @$narrative->object->meta->methods->ipython->markdown;
												if ($textCells) {
													echo $textCells; 
												} else {
													echo $none;
												}	
												?>
												
											</td>
										</tr>
										<tr>
											<th>
												Total Run Time
											</th>
											<td>
												<?php
												$runTime = @$narrative->object->meta->job_info->run_time;
												if ($runTime) {
													echo niceRunTime($runTime); 
												} else {
													echo $none;
												}	
												?>
											</td>
										</tr>
									</table>
		           			
		            </div>
		          </div>
		      </div>
			
			<?php	}	?>
			
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