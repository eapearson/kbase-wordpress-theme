<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once('wp_bootstrap_navwalker.php');

register_nav_menus(array(
    'primary' => __('Primary Menu', 'kbase'),
    'footer' => __('Footer Menu', 'kbase')
));

# wp_register_script('jquery', get_template_directory_uri() . '/js/jquery-2.1.1.min.js'); 

wp_register_script('bootstrap', get_template_directory_uri() . '/bootstrap/js/bootstrap.min.js', array('jquery'), '3.2.0', true);
wp_register_script('requirejs', get_template_directory_uri() . '/js/require.js', [], false, false);
//wp_register_script('requireconfig', get_template_directory_uri() . '/js/require-config.js', ['requirejs'], false, false);
//wp_localize_script('requireconfig', 'scriptRootURI', ['path'=>get_template_directory_uri() . '/js']); 
wp_register_script('kb-utils', get_template_directory_uri() . '/js/src/kbaseUtils.js', [], false, false);
wp_register_script('bs-extra', get_template_directory_uri() . '/js/bs-extra.js', [], false, true);

wp_register_style('home-page-2016', get_template_directory_uri() . '/css/home-page-2016.css');
wp_register_style('tile', get_template_directory_uri() . '/css/tile.css', 'all');
wp_register_style('grid', get_template_directory_uri() . '/css/grid.css', 'all');
wp_register_style('bootstrap', get_template_directory_uri() . '/bootstrap/css/bootstrap.min.css');
wp_register_style('bootstrap-theme', get_template_directory_uri() . '/bootstrap/css/bootstrap-theme.css', ['bootstrap']);
wp_register_style('font-awesome', get_template_directory_uri() . '/font-awesome-4.3.0/css/font-awesome.min.css');

function my_format_TinyMCE($in) {
    $in['wp_auto_resize'] = true;
    $in['wp_autoresize'] = true;
    $in['remove_linebreaks'] = false;
    $in['gecko_spellcheck'] = false;
    $in['keep_styles'] = true;
    $in['accessibility_focus'] = true;
    $in['tabfocus_elements'] = 'major-publishing-actions';
    $in['media_strict'] = false;
    $in['paste_remove_styles'] = false;
    $in['paste_remove_spans'] = false;
    $in['paste_strip_class_attributes'] = 'none';
    $in['paste_text_use_dialog'] = true;
    $in['wpeditimage_disable_captions'] = true;
    $in['plugins'] = 'tabfocus,paste,media,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpfullscreen';
    $in['content_css'] = get_template_directory_uri() . "/editor-style.css";
    $in['wpautop'] = false;
    $in['apply_source_formatting'] = false;
    $in['toolbar1'] = 'bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,wp_fullscreen,wp_adv ';
    $in['toolbar2'] = 'formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help ';
    $in['toolbar3'] = '';
    $in['toolbar4'] = '';
    return $in;
}

# add_filter( 'tiny_mce_before_init', 'my_format_TinyMCE' );          
# remove_filter('the_content', 'wpautop');

function kbase_the_content_adjust_urls($content) {
    $host = $_SERVER['HTTP_HOST'];
    $new = preg_replace('/http:\/\/test28\.kbase\.us/', '//' . $host, $content);
    // Ensure any urls using a previous host name are rewritten for the current host.
    // This takes care of hard-coded urls in content.
    // TODO: search and replace once a site has been migrated to a new host.
    $new = preg_replace('/\/\/staging\.kbase\.us/', '//' . $host, $new);
    if ($host !== 'kbase.us') {
        $new = preg_replace('/\/\/kbase\.us/', '//' . $host, $new);
    }
    #if (NARRATIVE_HOST !== 'narrative.kbase.us') {
    $new = preg_replace('/\/\/narrative(.*?)\.kbase\.us/', '//' . KBASE_NARRATIVE_HOST, $new);
    #}
    if (array_key_exists('HTTPS', $_SERVER)) {
        $new = preg_replace('/http:\/\/' . $host . '\//', 'https://' . $host . '/', $new);
    }
    return $new;
}

add_filter('the_content', 'kbase_the_content_adjust_urls');

add_filter('nav_menu_link_attributes', function ($val) {
    $url = $val['href'];
    $url = preg_replace('/\/narrative(.*?)\.kbase\.us/', '/' . KBASE_NARRATIVE_HOST, $url);
    $val['href'] = $url;
    return $val;
});

function kbase_pagination_menu_shortcode($atts, $content = null) {
    $atts = shortcode_atts([
        'menuid' => false
            ], $atts, 'kbase_pagination_menu');
    global $post;
    $pageId = $post->ID;
    $menuId = $atts['menuid'];
    if (!$menuId) {
        $menuId = get_post_meta($pageId, 'menu_id', true);
        if (!$menuId) {
            $parentPage = get_page($post->post_parent);
            if ($parentPage) {
                $menuId = get_post_meta($parentPage->ID, 'menu_id', true);
            }
        }
    }
    if ($menuId) {
        $menuId = intval($menuId);
    } else {
        return "Can't find a menu id";
    }
    $menuItems = wp_get_nav_menu_items($menuId);
    $theMenuItems = '';
    $itemNumber = 0;
    $prevUrl = null;
    $prevItem = false;
    $nextItem = false;
    $getNextItem = false;
    foreach ((array) $menuItems as $key => $menuItem) {
        $itemNumber++;
        $classes = '';
        if ($pageId == $menuItem->object_id) {
            $classes .= 'active';
            $prevItem = $prevUrl;
            $getNextItem = true;
        } elseif ($getNextItem) {
            $nextItem = $menuItem->url;
            $getNextItem = false;
        }
        $prevUrl = $menuItem->url;
        $theMenuItems .= '<li class="' . $classes . '"><a href="' . $menuItem->url . '" title="' . $menuItem->title . '">' . $itemNumber . '</a></li>';
    }
    if ($prevItem) {
        $thePrevButton = '<li><a href="' . $prevItem . '" title=""><span class="glyphicon glyphicon-chevron-left"/></a></li>';
    } else {
        $thePrevButton = '<li class="disabled"><span class="glyphicon glyphicon-chevron-left"/></li>';
    }
    if ($nextItem) {
        $theNextButton = '<li><a href="' . $nextItem . '" title=""><span class="glyphicon glyphicon-chevron-right"/></a></li>';
    } else {
        $theNextButton = '<li class="disabled"><span class="glyphicon glyphicon-chevron-right"/></li>';
    }
    $theMenu = '<ul class="pagination">' . $thePrevButton . $theMenuItems . $theNextButton . '</ul>';
    return $theMenu;
}

add_shortcode('kbase_pagination_menu', 'kbase_pagination_menu_shortcode');

function tobool($value) {
    switch (gettype($value)) {
        case 'boolean':
            return $value;
        case 'NULL':
            return false;
        case 'integer':
        case 'double':
            if ($value === 0) {
                return false;
            } else {
                return true;
            }
        case 'string':
            switch (strtolower($value)) {
                case 't':
                case 'y':
                case 'on';
                case 'yes':
                case 'true':
                    return true;
                default:
                    return false;
            }
    }
}

function kb_vertical_menu_shortcode($atts, $content = null) {
    $atts = shortcode_atts([
        'menuid' => false,
        'numberthem' => true
            ], $atts, 'kb_vertical_menu');
    global $post;
    $pageId = $post->ID;
    $menuId = $atts['menuid'];
    if (!$menuId) {
        $menuId = get_post_meta($pageId, 'menu_id', true);
        if (!$menuId) {
            $parentPage = get_page($post->post_parent);
            if ($parentPage) {
                $menuId = get_post_meta($parentPage->ID, 'menu_id', true);
            }
        }
    }
    if ($menuId) {
        $menuId = intval($menuId);
    } else {
        return "Can't find a menu id";
    }
    $menuItems = wp_get_nav_menu_items($menuId);
    $theMenuItems = '';
    $itemNumber = 0;
    $numberThem = tobool($atts['numberthem']);
    $marker = '';
    foreach ((array) $menuItems as $key => $menuItem) {
        $itemNumber++;
        $classes = '';
        if ($pageId == $menuItem->object_id) {
            $classes .= 'active';
        }
        if ($numberThem) {
            $marker = '<span class="marker">' . $itemNumber . '. </span>';
        }
        $label = $marker . '<span class="title">' . $menuItem->title . '</span>';
        $theMenuItems .= sprintf('<li class="%s"><a href="%s" title="%s">%s</a></li>', $classes, $menuItem->url, $menuItem->title, $label);
    }

    $theMenu = '<ul class="nav nav-pills nav-stacked">' . $theMenuItems . '</ul>';
    return $theMenu;
}

add_shortcode('kb_vertical_menu', 'kb_vertical_menu_shortcode');

function kb_guide_action_shortcode($atts, $content = null) {
    $atts = shortcode_atts([
        'type' => 'doit'
            ], $atts, 'kb_guide_action');
    $out = '<div class="kb-guide-action kb-guide-action-' . $atts['type'] . '">';
    $icon = 'chevron-right';
    switch ($atts['type']) {
        case 'doit': $icon = 'chevron-right';
            break;
    }
    $out .= '<span class="glyphicon glyphicon-' . $icon . '"></span>';
    $out .= do_shortcode($content);
    $out .= '</div>';
    return $out;
}

add_shortcode('kb_guide_action', 'kb_guide_action_shortcode');

add_shortcode('legend', function($atts, $content = null) {
    #$atts = shortcode_atts([
    #], $atts, 'legend');
    return '<div class="legend">' . do_shortcode($content) . '</div>';
});

add_shortcode('legend-item', function($atts, $content = null) {
    $atts = shortcode_atts([
        'marker' => false,
        'color' => 'red'
            ], $atts, 'legend-item');
    return '<div class="-item"><div class="-marker" style="color: ' . $atts['color'] . '">' . $atts['marker'] . '</div><div class="-content">' . do_shortcode($content) . '</div></div>';
});




add_filter('embed_defaults', 'kbase_embed_defaults');

function kbase_embed_defaults($defaults) {
    $defaults['width'] = 800; // or whatever you want
    $defaults['height'] = 450; // or whatever you want
    return $defaults;
}

/* custom posts, for now */
add_action('init', 'kbase_custom_post_video');

function kbase_custom_post_video() {
    register_post_type('kbase_video', [
        'labels' => [
            'name' => 'Videos',
            'singular_name' => 'Video'
        ],
        'public' => true,
        'has_archive' => true,
        'rewrite' => [
            'slug' => 'videos'
        ]
    ]);
}

function date_and_time_to_time($date, $time, $timezone) {

    if (!$time || empty($time)) {
        return null;
    }

    $dateMatches = [];
    $matches = preg_match('/^(....)(..)(..)$/', $date, $dateMatches);
    list($year, $month, $day) = array_slice($dateMatches, 1);


    $timeMatches = [];
    preg_match('/^(..)(..)$/', $time, $timeMatches);
    list($hour, $minute) = array_slice($timeMatches, 1);

    $iso = sprintf('%s-%s-%sT%s:%s:00', $year, $month, $day, $hour, $minute);

    if (!$timezone || empty($timezone)) {
        $timezone = date_default_timezone_get();
    }

    return new DateTime($iso, new DateTimezone($timezone));
}

add_filter('post_limits', function ($limits) {
    if (is_search()) {
        global $wp_query;
        $wp_query->query_vars['posts_per_page'] = -1;
    }
    return $limits;
});

add_filter('kb_include_tutorial_content', function ($content) {
    $up = wp_upload_dir();
    $upUrl = $up['url'];

    $fileSet = get_post_meta(get_the_ID(), 'kb_include_file_set', true);
    $fileName = get_post_meta(get_the_ID(), 'kb_include_file_name', true);
    $fileDir = dirname($fileName);

    # if there is a body tag, extract the content from the body.
    if (preg_match('/<body/', $content)) {
        $bodyFixed = preg_replace('/^.*?<body.*?>(.*?)<\/body>.*$/', '$1', $content);
    } else {
        $bodyFixed = $content;
    }

    # rewrite urls.
    # img src="images" -> img src="/uploads/kbase/<fileset>/<filename-dir>/images"
    # any relative urls are prefixed with the upload dir
    $imagesFixed = preg_replace('/img (.*?)src="([^\/])/', 'img $1src="' . $upUrl . '/' . $fileSet . '/' . $fileDir . '/$2', $bodyFixed);

    # C5 images are stripped of the C5 and prefixed with the upload dir.
    $c5ImagesFixed = preg_replace('/img src="\/files\/.*?\/([^\/]*)"/', 'img src="' . $upUrl . '/' . $fileSet . '/' . $fileDir . '/' . '$1"', $imagesFixed);
    return $c5ImagesFixed;
});

add_filter('kb_include_plain_content', function ($content) {
    return htmlspecialchars($content);
});

#add_filter( 'wpcf7_load_js', '__return_false' );
#add_filter( 'wpcf7_load_css', '__return_false' );

/*
  This is just a quick hack for notifications - there will be a plugin for this soon.
 */

function get_custom_cat_template($single_template) {
    global $post;

    if (in_category('system-maintenance')) {
        $single_template = dirname(__FILE__) . '/category-templates/system-maintenance/single.php';
    }
    return $single_template;
}

add_filter("single_template", "get_custom_cat_template");

add_filter('wp_recaptcha_cf7_shortcode_wrap', function ($content, $tagClass) {
    return '<div class="form-group ' . $tagClass . '">' . $content . '</div>';
}, 10, 2);

# Added to allow editors to work with menus.
// get the the role object
$role_object = get_role('editor');

// add $cap capability to this role object
$role_object->add_cap('edit_theme_options');



include_once('kbase-api.php');
