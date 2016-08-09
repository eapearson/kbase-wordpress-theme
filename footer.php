      <div class="sticky-push"></div>
    </div>
    <div class="container-fluid sticky-footer  kbase-footer">
        <div class="row">
          <div class="col-md-12">
            <div class="footer-bar">
              
              <?php wp_nav_menu([
                'theme_location' => 'footer',
                'container' => 'div',
                'container_class' => 'kbase-footer-menu',
                'after' => ' <span class="footer-sep"></span> '
                ]);
              ?>
              
              <!-- hard code the social icons for now -->
             
              <a href="https://www.facebook.com/pages/DOE-Systems-Biology-Knowledgebase/148332628600806" target="_blank" style="height: 24px; display: inline-block;" class="menu-item"><img src="<?= get_template_directory_uri(); ?>/images/facebook-icon.png"></a>
             
              <span class="footer-sep"></span> 
              
              <a href="https://twitter.com/DOEKbase" target="_blank"><img src="<?= get_template_directory_uri(); ?>/images/twitter-icon.png"></a>
              
              <span class="footer-sep"></span> 
            
              <a href="http://science.energy.gov/ber/">
                <img  src="/wp-content/uploads/2014/09/doe_office_of_science_250.png" alt="doe_office_of_science_250.png" width="250" height="42" target="_blank" />
              </a>
              
            </div>
          </div>
        </div>
    </div>   
    <!-- Latest compiled and minified JavaScript -->
   <?php wp_footer(); ?>
  </body>
</html>
