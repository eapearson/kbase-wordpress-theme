<?php
/* API */

function kbase_api_init() {
	global $kbase_api_notifications;
	
	$kbase_api_notifications = new KBase_API_Notifications();
	add_filter('json_endpoints', [$kbase_api_notifications, 'register_routes']);
	# add_filter('json_endpoints', [$kbase_api_recentupdates, 'register_routes']);
    
}
add_action('wp_json_server_before_serve', 'kbase_api_init');


class KBase_API_Notifications {
	public function register_routes($routes) {
		$routes['/kbase/notifications/currentissues'] = [
			[ [$this,'get_current_issues'], WP_JSON_Server::READABLE],
		#	[ [$this, 'new_post'], WP_JSON_Server::CREATABLE | WP_JSON_SERVER::ACCEPT_JSON],
		];

		$routes['/kbase/notifications/maintenance'] = [
			[ [$this,'get_maintenance'], WP_JSON_Server::READABLE],
		#	[ [$this, 'new_post'], WP_JSON_Server::CREATABLE | WP_JSON_SERVER::ACCEPT_JSON],
		];
        
        $routes['/kbase/notifications/recentupdates'] = [
            [ [$this, 'get_recent_updates'], WP_JSON_Server::READABLE]
        ];
        
        $routes['/kbase/notifications/relevant'] = [
            [ [$this, 'get_relevant_notifications'], WP_JSON_Server::READABLE]
        ];
		
		#$routes['/kbase/notifications/(?P(<id>\d+)'] = [
		#	[ [$this, 'get_post'], WP_JSON_Server::READABLE],
		#	[ [$this, 'edit_post'], WP_JSON_Server::EDITABLE | WP_JSON_Servers::ACCEPT_JSON],
		#	[ [$this, 'delete_post'], WP_JSON_Server::DELETABLE]
		#];
		
		return $routes;
	}
	
	public function get_current_issues() {
		$query = [
			'category_name' => 'system-issue',
			'meta_query' => [
               
                 ['relation' => 'AND',
					['key' => 'kb_notification_start_at',
					 'value' => date('c'),
					 'type' => 'DATETIME',
					 'compare' => '<=' 
					 ],
                     ['relation' => 'OR',
  						['key' => 'kb_notification_end_at',
  						 'value' => date('c'),
  						 'type' => 'DATETIME',
  						 'compare' => '>=' 
  						 ],
   						['key' => 'kb_notification_end_at',
   						 'compare' => 'NOT EXISTS'
   						 ]
                     ]
                 ] 
			]
		];
		$nq = new WP_Query($query);
		$result = [];
		$i = 0;
		if ($nq->have_posts()) {
			while ($nq->have_posts()) {
				$nq->the_post();
                $n = $this->get_notification_json($nq->post);
				array_push($result, $n);
			}
		}
		
		return $result;
	}
    
    public function get_prop($arr, $prop, $defaultValue=null) {
        if (array_key_exists($prop, $arr)) {
            return $arr[$prop][0];
        } else {
            return $defaultValue;
        }
    }
    
    public function wp_gmt_to_iso8601 ($dateString) {
        if ($dateString && count($dateString) > 0) {
            $ds = preg_split('/ /', $dateString);
            return $ds[0] . 'T' . $ds[1] . '-00:00';
        } else {
            return null;
        }
        # return $dateString;
    }
    
    public function get_notification_json($post) {
        $id = $post->ID;
        $user = get_userdata($post->post_author);
        $custom = get_post_custom($id);
        #$post_cats = wp_get_post_categories($id, [
        #    'fields' => ['slugs']
        #]);
        #$cats = [];
        #foreach ($post_cats as $c) {
        #    $cat = get_categories($c);
        #    array_push($cats, $cat->slug);
        #}
		return [
            'id' => $id,
            'addedAt' => $this->wp_gmt_to_iso8601($post->post_date_gmt),
            'addedBy' =>  $user->user_login, #$user->first_name . ' ' . $user->last_name,
            'updatedAt' => $this->wp_gmt_to_iso8601($post->post_modified_gmt),
            'updatedBy' => $user->user_login,
			'title' => $post->post_title,
			'notification' => $post->post_excerpt,
			'description' => $post->post_content,
            'url' => get_permalink($id),
            'status' => $post->post_status,
            'type' => $this->get_prop($custom, 'kb_notification_type'),
			'startAt' => $this->get_prop($custom, 'kb_notification_start_at'),
			'endAt' => $this->get_prop($custom, 'kb_notification_end_at')
		];
    }
    
	public function get_maintenance() {
		$query = [
			'category_name' => 'system-maintenance',
			'meta_query' => [
                'relation' => 'OR',
				['key' => 'kb_notification_end_at',
				 'value' => date('c'),
				 'type' => 'DATETIME',
				 'compare' => '>=' 
				 ],
                 ['relation' => 'AND',
					['key' => 'kb_notification_start_at',
					 'value' => date('c'),
					 'type' => 'DATETIME',
					 'compare' => '<=' 
					 ],
                     ['relation' => 'OR',
  						['key' => 'kb_notification_end_at',
  						 'value' => date('c'),
  						 'type' => 'DATETIME',
  						 'compare' => '>=' 
  						 ],
   						['key' => 'kb_notification_end_at',
   						 'compare' => 'NOT EXISTS'
   						 ]
                     ]
                 ] 
			]
		];
		$nq = new WP_Query($query);
		$result = [];
		$i = 0;
		if ($nq->have_posts()) {
			while ($nq->have_posts()) {
				$nq->the_post();
                $n = $this->get_notification_json($nq->post);
				array_push($result, $n);
			}
		}
		
		return $result;
	}
    
	public function get_recent_updates() {
        $date = new DateTime();
        $date->sub(new DateInterval('P30D'));
        
		$query = [
			'category_name' => 'system-update',
			'meta_query' => [
				['key' => 'kb_notification_start_at',
				 'value' => $date->format('c'),
				 'type' => 'DATETIME',
				 'compare' => '>=' 
				 ]
			]
		];
		$nq = new WP_Query($query);
		$result = [];
		$i = 0;
		if ($nq->have_posts()) {
			while ($nq->have_posts()) {
				$nq->the_post();
                $n = $this->get_notification_json($nq->post);
				array_push($result, $n);
			}
		}
		
		return $result;
	}
    
	public function get_relevant_notifications() {
        $date = new DateTime();
        $date->sub(new DateInterval('P30D'));
        
		$query = [
			'category_name' => 'system-notifications',
			'meta_query' => [
				['key' => 'kb_notification_start_at',
				 'value' => $date->format('c'),
				 'type' => 'DATETIME',
				 'compare' => '>=' 
				 ]
			]
		];
		$nq = new WP_Query($query);
		$result = [];
		$i = 0;
		if ($nq->have_posts()) {
			while ($nq->have_posts()) {
				$nq->the_post();
                $n = $this->get_notification_json($nq->post);
				array_push($result, $n);
			}
		}
		
		return $result;
	}
	
}
