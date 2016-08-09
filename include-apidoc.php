<?php 
/**
* A content template for the 'tutorial' include doc type.
* 
* @package: @kbase 
*
*/ ?>

<div class="row">
  <div class="col-sm-4">
    <?= kb_include_get_include_suffix(get_the_ID(), '_nav'); ?>
  </div>
  <div class="col-sm-8">
    <?= kb_include_get_include(get_the_ID()); ?>
  </div>
</div>