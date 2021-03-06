<?php 
/**
* The basic, canonical theme template.
* 
* @package: @kbase 
*
*/ ?>
<?php 
wp_enqueue_style('grid');
get_header() ?>
<style type="text/css">
.tile {
  margin: 10px;
  padding: 10px;
  box-sizing: border-box;
  background-color: #EEEEEE;
  border-radius: 4px;
  vertical-align: middle;
  min-height: 200px;
  border: 2px transparent solid;
}
.tile.-blue {
    background-color: #61C1C9;
}
.tile.-orange {
    background-color: #BDCD31;
}
.tile.-green {
    background-color: #FECB0D;
}

.tile .-content {
  xpadding: 10px;
  xborder:1px red solid;
}
.tile.main {
}
.tile ul {
   font-size: 100%;
    xposition: relative;
    xleft: 1.5em;
    xlist-style: outside none none;
    padding: 10px;
    line-height: 2.5em;
    width: 100%;
}
.tile ul li {
  line-height: 1.5em;
}
.tile li:xbefore {
    xcontent: "▶";
    xcolor: #3576BE;
    xposition: absolute;
    xleft: -1.5em;
}
.tile.-clickable {
    cursor: pointer;
    }
.tile.-clickable:hover {
    border: 2px silver solid;
}
.tile .front {
  display: block;
  cursor: pointer;
  text-align: center;
}
.tile .back {
  display: none;
  cursor: pointer;
}

.ktile {
    display: inline-block;
}
</style>


<div class="kgrid">
	<div class="-row -same-height">
		<div class="-col -span-1-2" style="vertical-align: middle;">
			<div class="tile -content">
				<h1>
					KBase 
				</h1>
				<p>
					a platform for comparative functional genomics and systems biology for microbes, plants and their communities 
				</p>
			</div>
		</div>
		<div class="-col -span-1-4" style="text-align: center; vertical-align: middle; line-height: 100%">
			<div class="tile -content">
				<button type="button" class="btn btn-lg btn-primary">
					Learn More 
				</button>
			</div>
		</div>
		<div class="-col -span-1-4" style="text-align: center; vertical-align: middle;">
			<div class="tile -content" style="vertical-align: middle;">
				<button type="button" class="btn btn-lg btn-primary">
				Sign In 
				</button>
			</div>
		</div>
	</div>
</div>


<div class="kgrid">
	<div class="-row -same-height">
		<div class="-col -span-1-4" style="vertical-align: middle;">
			<div class="tile -content -clickable -orange">
				<div class="front">
					<h2>
						How Does it Work 
					</h2>
				</div>
				<div class="back">
					<ul>
						<li>
							Sign Up for an Account
						</li>
						<li>
							Create a new Narrative
						</li>
						<li>
						    Share it with coworkers
						</li>
						<li>
							Upload your Data 
						</li>
						
						<li>
							Build your analysis 
						</li>
						<li>
							Share your discoveries with the world 
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="-col -span-1-4" >
			<div class="tile -content -clickable -green">
			    <div class="front">
					<h2>
						News
					</h2>
				</div>
				<div class="back">
					<ul>
						<li>
							<a href="">SciPy: The KBase Narrative Interface - Bioinformatics for the 99%</a>
							<br>Jul 13, 2014
						</li>
						<li>
							<a href="">ASPB 2014 and Software Carpentry workshop</a>
							<br>Jul 8, 2014
						</li>
						<li>
							<a href="">KBase talk and posters at ISMB 2014</a><br>
							Jul 7, 2014
						</li>
						
					</ul>
				</div>
			</div>
		</div>
		<div class="-col -span-1-2" style="vertical-align: middle;">
			<div class="tile -content -clickable -blue">
				<div class="front">
					<h2>
						What can you do in KBase? 
					</h2>
				</div>
				<div class="back">
					<ul>
						<li>
							Efficiently 
							<strong>
								annotate 
							</strong>
							new microbial genomes and 
							<strong>
								infer 
							</strong>
							metabolic and regulatory networks 
						</li>
						<li>
							Transform network inferences into metabolic 
							<strong>
								models 
							</strong>
							and 
							<strong>
								map missing reactions 
							</strong>
							to genes using novel data reconciliation tools 
						</li>
						<li>
							Test microbial ecological hypotheses through 
							<strong>
								taxonomic and functional analysis 
							</strong>
							of quality-assessed metagenomic data 
						</li>
						<li>
							Discover genetic 
							<strong>
								variations 
							</strong>
							within plant populations and map these to complex organismal traits 
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="-row -same-height">
		<div class="-col -span-1-4" style="text-align: center; vertical-align: middle; line-height: 100%">
			<div class="tile -content -clickable">
				<div class="front">
				</div>
				<div class="back">
				</div>
			</div>
		</div>
		<div class="-col -span-1-2" style="text-align: center; vertical-align: middle;">
			<div class="tile -clickable -content">
				<div class="front">
					<h2>
						KBase Includes 
					</h2>
				</div>
				<div class="back">
					<table class="table kbase-includes">
						<tr>
							<td>
								33 
							</td>
							<td>
								<a href="/data/data-types/">
									biological data types 
								</a>
							</td>
						</tr>
						<tr>
							<td>
								22,253 
							</td>
							<td>
								<a href="https://narrative.kbase.us/functional-site/#/search/?q=bacteria%20archaea&amp;category=genomes&amp;page=1&amp;itemsPerPage=10">
									microbial genomes 
								</a>
							</td>
						</tr>
						<tr>
							<td>
								96 
							</td>
							<td>
								<a href="https://narrative.kbase.us/functional-site/#/search/?q=eukaryota&amp;category=genomes&amp;page=1&amp;itemsPerPage=10">
									eukaryotic genomes 
								</a>
								(56 
								<a href="https://narrative.kbase.us/functional-site/#/search/?q=viridiplantae&amp;category=genomes">
									plants 
								</a>
								) 
							</td>
						</tr>
						<tr>
							<td>
								15,462 
							</td>
							<td>
								<a href="https://narrative.kbase.us/functional-site/#/search/?q=*&amp;category=metagenomes&amp;itemsPerPage=10">
									metagenomic datasets 
								</a>
							</td>
						</tr>
						<tr>
							<td>
								13,111 
							</td>
							<td>
								public reference models 
							</td>
						</tr>
						<tr>
							<td>
								Over XXX 
							</td>
							<td>
								analysis 
								<a href="/developer-zone/services/">
									methods 
								</a>
							</td>
						</tr>
						<tr>
							<td>
								12 
							</td>
							<td>
								easy to use 
								<a href=" ">
									apps 
								</a>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<div class="-col -span-1-4" style="vertical-align: middle;">
            <div class="tile -content -clickable -green">
			    <div class="front">
					<h2>
						Events
					</h2>
				</div>
				<div class="back">
					<ul>
						<li>
							Jan 9, 2015<br>
							<a href="">KBase at the Plant & Animal Genome (PAG) Conference, 2015</a>
						</li>
						<li>
							Feb 22, 2015<br>
							<a href="">DOE Genomic Sciences 2015 Contractors-Grantees Meeting</a>
						</li>
						<li>
							Mar 23, 2015<br>
							<a href="">JGI User Meeting</a>
						</li>
						<li>
							May 29, 2015<br>
							<a href="">American Society of Microbiology (ASM) 2015 Annual Meeting</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<script type="text/javascript">
require(['jquery', 'domReady!'], function ($) {

    function adjustRowHeight(el) {
        //console.log('here');
        var row = $(el);
        var maxHeight = 0;
        row.children('.-col').each(function () {
            var tile = $(this).children('.tile');
            tile.css('height', '');
 //           console.log('tile: ' + $(tile).height());
            maxHeight = Math.max(maxHeight, $(tile).height());
        });
        console.log(maxHeight);
        row.children('.-col').each(function () {
            var tile = $(this).children('.tile');
            tile.height(maxHeight);
        });
    }
  
    $('.kgrid .-row.-same-height').each(function() {adjustRowHeight($(this))});
   
   
    $('.tile.-clickable').on('click', function (e) {
        var clickable = this;
        /* with animation -- needs more work
        $(this).children('.front').toggle({duration: 400, queue: true});
        $(this).children('.back').toggle({
            duration: 400, 
            queue: true, 
            complete: function() {
                $(clickable).parents('.-row.-same-height').each(function() {adjustRowHeight($(this))});
            }});
            */
          $(this).children('.front').toggle();
        $(this).children('.back').toggle();
        $(this).parents('.-row.-same-height').each(function() {adjustRowHeight($(this))});
    });
    
   /* $('.front').on('click', function (e) {
        $(this).hide();
        $(this).siblings('.back').show();
        // $(this).parents('.-row.-same-height').each(function () {console.log('there')});
        $(this).parents('.-row.-same-height').each(function() {adjustRowHeight($(this))});
    });
    $('.back').on('click', function (e) {
        $(this).hide();
        $(this).siblings('.front').show();
        $(this).parents('.-row.-same-height').each(function() {adjustRowHeight($(this))});
    });
    */

});
</script>
    
    
<?php get_footer() ?>
