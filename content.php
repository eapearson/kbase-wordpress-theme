<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>


	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<?php if ( is_sticky() && is_home() && ! is_paged() ) : ?>
		<div class="featured-post">
			<?php _e( 'Featured post', 'kbase' ); ?>
		</div>
		<?php endif; ?>
		<header class="entry-header">
     

      <!-- TITLE -->
			<?php if ( is_single() ) : ?>
			<h1 class="entry-title"><?php the_title(); ?></h1>
			<?php else : ?>
			<h2 class="entry-title">
				<a href="<?php the_permalink(); ?>" rel="bookmark"><?php the_title(); ?></a>
			</h2>
			<?php endif; // is_single() ?>
      
      
      
      <!-- TYPE -->
      <div class="post-type">
          
          in <?php echo get_post_type_object(get_post_type(get_the_ID()))->labels->name; ?>
      </div>
      
      <!-- THUMBMAIL -->
      <!-- need to fix this in the stylesheet... -->
			<?php if ( ! post_password_required() && ! is_attachment() ) :
        echo '<div style="float: left; margin-right: 10px;">';
				the_post_thumbnail();
        echo '</div>';
			endif; ?>
      
      <!-- no commenting at kbase - we need to disable this per post and globally too. -->
      
			<?php if ( comments_open() ) : ?>
				<div class="comments-link">
					<?php comments_popup_link( '<span class="leave-reply">' . __( 'Leave a reply', 'kbase' ) . '</span>', __( '1 Reply', 'kbase' ), __( '% Replies', 'kbase' ) ); ?>
				</div><!-- .comments-link -->
			<?php endif; // comments_open() ?>
		</header><!-- .entry-header -->

		<?php if ( is_search() ) : // Only display Excerpts for Search ?>
		<div class="entry-summary">
			<?php the_excerpt(); ?>
		</div><!-- .entry-summary -->
		<?php else : ?>
		<div class="entry-content">
			<?php the_content( __( 'Continue reading <span class="meta-nav">&rarr;</span>', 'kbase' ) ); ?>
			<?php wp_link_pages( array( 'before' => '<div class="page-links">' . __( 'Pages:', 'kbase' ), 'after' => '</div>' ) ); ?>
		</div><!-- .entry-content -->
		<?php endif; ?>

    <!-- removed entry meta -->
		<div style="clear:both;"></div>
	</article><!-- #post -->
  
  
