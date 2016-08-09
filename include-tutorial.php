<?php 
/**
* A content template for the 'tutorial' include doc type.
* 
* @package: @kbase 
*
*/ ?>

<div class="row">
  <div class="col-sm-1">
    
  </div>
  <div class="col-sm-10">
    <?= kb_include_get_include(get_the_ID()); ?>
  </div>
</div>
