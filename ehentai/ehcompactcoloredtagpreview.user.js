// ==UserScript==
// @name           Compact color coded ExHentai & g.E-Hentai Tags Preview 
// @description	   When you hover over a gallery it shows the tags, pink for female blue for male. More compact. Also shows number of pages!
// @namespace      https://greasyfork.org/users/212175-brozilian
// @author         brozilian
// @version        1.2
// @include        http://e-hentai.org/*
// @include        https://e-hentai.org/*
// @include        http://exhentai.org/*
// @include        https://exhentai.org/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==
//Based off of DP's v0.4.3.0 https://sleazyfork.org/en/scripts/24442-custom-exhentai-g-e-hentai-tags-preview, remainder of comments from that version kept below


/*
v0.4.3.0
made the preview window extend upwards instead of downwards per request of: https://greasyfork.org/en/forum/discussion/13956/x

v0.4.2.1
fix for g.e-hentai.org -> e-hentai gallery url change
+ the url for g.e-hentai.org gallery got changed to just the e-hentai.org domain

v0.4.2.0
made #info_div box MUCH easier to read
+ add margins all around to separate namespaces
replaced </br> with <div> tags
+ this removed code that got rid of any extra new lines at the beginning
+ </br> tags are no longer neccesary with the div tags adding margins
replaced <b> with <span> tags


v0.4.1.4
made namespaces easier to read by adding bolding and tabs
explicitly put in http and https for security purposes

v0.4.1.3
fixed the extra new line bug
the new code is used to see if there's a new line at the beginning, followed by a <br/> tag

v0.4.1.2
use regex to fix female namespace
re-ordered the namespaces to the same order as e-hentai's namespaces

known bugs:
1
+ sometimes there's an extra new line after the title

v0.4.1
based on https://greasyfork.org/en/scripts/4066-exhentai-g-e-hentai-tags-preview
fixed to work on http and https
changed to use ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js to use https

separated these namespaces with new lines:
{
reclass
language
parody
character
group
artist
male
female
misc
}

known bugs:
1
+ sometimes there's an extra new line after the title
2
+ the female namespace gets cut off by a new line
+ this happens when there's a female namespace, but no male namespace

*/

/*

https://greasyfork.org/en/scripts/4066-exhentai-g-e-hentai-tags-preview
+ based off of Version 0.4 of ExHentai & g.E-Hentai Tags Preview by Federico

see:
https://greasyfork.org/en/forum/discussion/5067/x
https://greasyfork.org/en/forum/discussion/11458/x
http://stackoverflow.com/questions/5752829/regular-expression-for-exact-match-of-a-word
+ for searching for almost exact matches
http://stackoverflow.com/questions/1571648/html-tab-space-instead-of-multiple-non-breaking-spaces-nbsp
+ for adding tabs
http://stackoverflow.com/questions/3511707/apply-space-between-divs
+ adding margins between divs
http://stackoverflow.com/questions/183532/what-is-the-difference-between-html-tags-div-and-span
+ differences between div and span
https://greasyfork.org/en/scripts/21167-eh-tag-exposer-and-hider/code
+ good reference in terms of figuring out how to format and style the box
*/

 
	$('body').append('<div id="info_div">Loading...</div>');
	$('#info_div').hide()
	.css('position', 'absolute')
	.css('padding', '5px')
	.css('z-index', '1000')
	.css('max-width', '250px')
		if (window.location.toString().indexOf('e-hentai.org') >= 0) {
		var color = "#5c0d11";
		$('#info_div').css('background-color', '#edebdf')
		.css('color', color)
		.css('border', '1px solid ' + color);
        var boycolor = "#1c41b0";
        var girlcolor = "MediumVioletRed ";
	} else {
		var color = "#dddddd";
		$('#info_div').css('background-color', '#4f535b')
		.css('color', color)
		.css('border', '1px solid ' + color);
        var boycolor = "lightblue";
        var girlcolor = "lightpink";
	}
	var tags = new Array();
	var titles = new Array();
	$('.it5,.id3').css('z-index', '100'); //Semi-fix for EH Plus
	$('.it5,.id3').mouseover(function() {
		var index = parseInt($('.it5,.id3').index(this));
	/*	$(this).children().children().attr("title", "");
		if (tags[index] == null) {
			var gal_url = $(this).find('a:last').attr('href');
			$.ajax({
				url:gal_url,
				type:'get',
				dataType:'html',
				success:function(data)
				{ 
					var _html= $(data);
                    uglytags = _html.find('#taglist table').html().replace(/<\/a>/g, ", </a>");
                    tags[index] = $(uglytags).text().slice(0,-2);
                    titles[index] = _html.find('#gn').text();
					insertStuff(titles[index], tags[index]);
				}
			});
		} else {
			*/
			insertStuff(titles[index], tags[index]);
	//	}
	}).mousemove(function(pos) {
		{
		// comment out one of these variables in order to pick what method of displaying a window you prefer
		//h = 200; // change this value to affect the height of the tags preview window. positive values move the window up. negative values move the window down
		h = $('#info_div').height();

		tempHeight = (pos.pageY-h);
		$('#info_div').show()
		.css('top', tempHeight).css('left', pos.pageX+10);
		}
	}).mouseout(function() {
		$('#info_div').html("Loading...");
		$('#info_div').hide();
	});

		$('.it5,.id3').each(function() {
		var index = parseInt($('.it5,.id3').index(this));
		$(this).children().children().attr("title", "");
			var gal_url = $(this).find('a:last').attr('href');
			$.ajax({
				url:gal_url,
				type:'get',
				dataType:'html',
				success:function(data)
				{ 
					var _html= $(data);
                    uglytags = _html.find('#taglist table').html().replace(/<\/a>/g, ", </a>"); 
                    tags[index] = $(uglytags).text().slice(0,-2);
					
					          tags[index] = "<span style='font-weight: bold;'>Pages: </span><span>" + _html.find('#gdd table').text().match(/\d+(?= page)/g) + ", " + tags[index] ;
                    titles[index] = _html.find('#gn').text() ;
					          
					insertStuff(titles[index], tags[index]);
				}
			});
			});
	
    function insertStuff(title, index) {
        var index = index.replace('reclass:', "</span><span style='font-weight: bold;'>reclass:</span><span> ");
		// reclass is the very first namespace that appears at the top of the document.
		// so I gave this namespace a full-length horizontal rule for the title. also giving it a height of 2px
		// non-title namespaces will have left and right margins of 32px
        var index = index.replace(/\blanguage:\b/, "</span><span style='font-weight: bold;'>Language:</span><span> ");
        var index = index.replace(/\bparody:\b/, "</span><span style='font-weight: bold;'>Parody:</span><span> ");
        var index = index.replace(/\bcharacter:\b/, "</span><span style='font-weight: bold;'>Character:</span><span> ");
        var index = index.replace(/\bgroup:\b/, "</span><span style='font-weight: bold;'>Group:</span><span> ");
        var index = index.replace(/\bartist:\b/, "<span style='font-weight: bold;'>Artist:</span><span> ");
        var index = index.replace(/(\bmale:\b)/, "</span><span style='font-weight: bold; color: "+ boycolor +";'>Male:</span><span style='color:  "+ boycolor +";'> ");
		// using \b will ensure that strings like "female" won't trigger the new line accidentally
        var index = index.replace(/(\bfemale:\b)/, "</span><span style='font-weight: bold; color: "+ girlcolor +";'>Female:</span><span style='color:  "+ girlcolor +";'> ");
        var index = index.replace(/\bmisc:\b/, "</span><span style='font-weight: bold;'>Misc:</span> ");
        
		
        $('#info_div').html("<span style='font-weight: bold;'>" + title + "</span><div style='margin-top: 2px; margin-bottom: 2px; height: 1px; background-color: " + color + ";'></div>" + index);
    }
