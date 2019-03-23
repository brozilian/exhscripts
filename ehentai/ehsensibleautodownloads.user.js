// ==UserScript==
// @name           Sensible sized E-Hentai Automated Downloads 
// @description    A modified version of E-Hentai Automated Downloads by etc. that selects between resized and uncompressed archives based on size and also ignores out of date torrents.
// @namespace      https://greasyfork.org/users/212175-brozilian
// @author         brozilian
// @version        2.1
// @include        http://e-hentai.org/*
// @include        https://e-hentai.org/*
// @include        http://exhentai.org/*
// @include        https://exhentai.org/*
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlHttpRequest
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM.setValue
// @grant          GM.getValue
// @run-at         document-start
// ==/UserScript==
// 
// Based on version 2.1.3 of E-Hentai Automated Downloads by etc see https://sleazyfork.org/en/scripts/1604-e-hentai-automated-downloads . Thanks to etc for the original.

//
// Settings can now be found at top of ehentai settings page and should persist through versions.
//
//
//
//
//
//
//
//


if (typeof(GM_getValue) !== 'undefined') {var imageSizeLimit = GM_getValue('imageSizeLimit', 1500);
                                          var downloadIfNoTorrentFound = GM_getValue('downloadIfNoTorrentFound', true);
                                          var saveDownloadsAsVisits = GM_getValue('saveDownloadsAsVisits', false);}
		else if (typeof(GM) !== 'undefined'){var imageSizeLimit = GM.getValue('imageSizeLimit', 1500);
                                             var downloadIfNoTorrentFound = GM.getValue('downloadIfNoTorrentFound', true);
                                             var saveDownloadsAsVisits = GM.getValue('saveDownloadsAsVisits', false);}
		else reject(new Error('GM methods not working')); 


var storageName = "ehVisited"; //name of object, to avoid clash with old installs

if(localStorage.getItem(storageName) && saveDownloadsAsVisits){
   var countDownloads = true;
   var sto = localStorage.getItem(storageName);
   var vis = JSON.parse(sto); 
   function ehvStore(data) { 
     var ccc = data.galleryId + "." + data.galleryToken;
     vis["data"][ccc] = Date.now();
     localStorage.setItem(storageName, JSON.stringify(vis));
   }
} else var countDownloads = false;


if (typeof(Promise) === 'undefined') {
	console.warn('Browser does not support promises, aborting.');
	return;
}

/*-----------------------
  Assets (icons and GIFs)
  -----------------------*/

var ASSETS = {

	downloadIcon: generateSvgIcon(1792, 'rgb(0,0,0)',
		'M1344 1344q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 ' +
		'45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t' +
		'68-28h465l135 136q58 56 136 56t136-56l136-136h464q40 0 68 28t28 68zm-325-569q17 41-14 70l-448 448q-' +
		'18 19-45 19t-45-19l-448-448q-31-29-14-70 17-39 59-39h256v-448q0-26 19-45t45-19h256q26 0 45 19t19 45' +
		'v448h256q42 0 59 39z'
	),

	torrentIcon: generateSvgIcon(1792, 'rgb(0,0,0)',
		'M1216 928q0-14-9-23t-23-9h-224v-352q0-13-9.5-22.5t-22.5-9.5h-192q-13 0-22.5 9.5t-9.5 22.5v352h-224q' +
		'-13 0-22.5 9.5t-9.5 22.5q0 14 9 23l352 352q9 9 23 9t23-9l351-351q10-12 10-24zm640 224q0 159-112.5 2' +
		'71.5t-271.5 112.5h-1088q-185 0-316.5-131.5t-131.5-316.5q0-130 70-240t188-165q-2-30-2-43 0-212 150-3' +
		'62t362-150q156 0 285.5 87t188.5 231q71-62 166-62 106 0 181 75t75 181q0 76-41 138 130 31 213.5 135.5' +
		't83.5 238.5z'
	),

	pickerIcon: generateSvgIcon(1792, 'rgb(252,0,97)',
		'M1333 566q18 20 7 44l-540 1157q-13 25-42 25-4 0-14-2-17-5-25.5-19t-4.5-30l197-808-406 101q-4 1-12 1' +
		'-18 0-31-11-18-15-13-39l201-825q4-14 16-23t28-9h328q19 0 32 12.5t13 29.5q0 8-5 18l-171 463 396-98q8' +
		'-2 12-2 19 0 34 15z'
	),

	doneIcon: generateSvgIcon(1792, 'rgb(0,0,0)',
		'M1412 734q0-28-18-46l-91-90q-19-19-45-19t-45 19l-408 407-226-226q-19-19-45-19t-45 19l-91 90q-18 18-1' +
		'8 46 0 27 18 45l362 362q19 19 45 19 27 0 46-19l543-543q18-18 18-45zm252 162q0 209-103 385.5t-279.5 2' +
		'79.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5' +
		' 103 385.5z'
	),

	loadingGif: 'url(data:image/gif;base64,' +
		'R0lGODlhEgASAMQaAHl5d66urMXFw3l5dpSUk5WVlKOjoq+vrsbGw6Sko7u7uaWlpbm5t3h4doiIhtLSz4aGhJaWlsbGxNHRzrC' +
		'wr5SUkqKiobq6uNHRz4eHhf///wAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAaACwAAAAAEgASAAAFaq' +
		'AmjmRplstyrkmbrCNFaUZtaFF0HvyhWRZNYVgwBY4BEmFJOB1NlYpJoYBpHI7RZXtZZb4ZEbd7AodFDIYVAjFJJCYA4ISoI0hyu' +
		'UnAF2geDxoDgwMnfBoYiRgaDQ1WiIqPJBMTkpYaIQAAIfkEBQoAGgAsAQABABAAEAAABWSgJo4aRZEoeaxHOiqKFsyBtizopV9y' +
		'nfwJ0o43MhgNKAYjZbGQJBLXKBLRIK4IaWFbEHgFUoKYoPFKRZUK6fFIORwojBxDytgzpDkdANDc8SQTExp8fBoQEGcDiwNnJA0' +
		'NLiEAACH5BAUKABoALAEAAQAQABAAAAVloCaOmqKQKHmtVzpKksa2FIUiOKIxjHb8B5JgKCAFjgHUMHUkPR6u0WKhwVgx0YQ2cc' +
		'W6DGCDZjKJiiwWEgCQikRQ6zWpQC+QBviBxuHQEP4EKA0NGhmGGRoVFWaHiGYjEBAuIQAAIfkEBQoAGgAsAQABABAAEAAABWSgJ' +
		'o6aJJEoiaxIOj6PJsyCpigopmNyff0X0o43AgZJk0mKwSABAK4RhaJ5PqOH7GHAHUQD4ICm0YiKwCSHI7VYoDLwDClBT5Di8khE' +
		'Y+gbUBAQGgWEBRoWFmYEiwRmJBUVLiEAACH5BAUKABoALAEAAQAQABAAAAVloCaO2vOQKImtWDoCgMa2koTCsDZNGuIjpIFwQBI' +
		'YBahGI2UkORyukUKhyVgz0Yv2csW6thcNBBIVMRikSCRFoaAK8ALpQD+QCHiCZrHQBP4BKBUVGgmGCX6BUQaMBmUkFhYuIQAAIf' +
		'kEBQoAGgAsAQABABAAEAAABWagJo4aAJAoaZrp6DjaIA/a86BZnmlNo2FADEm3GwWFJAgkNZmQIpHWSCLRFK4FKWKLIHgJUoFYo' +
		'KlUpCIxabFIKRSohDxButgvJIPeoKFQNHd4JBYWGgeHBxoMDGgBjgFoJI4tIQAAIfkEBQoAGgAsAQABABAAEAAABWSgJo6a45Ao' +
		'ma1ZOkaRxrYAgBZ4oUGQVtckgpBAGhgHqEol1WiQFgvX6PHQJK4JKWaLMXgNWq7GYpGKJhMShZKSSFCH+IGEqCNIgXxAo1BoBIA' +
		'CKHkaF4YXf4JSh4hmIwwMLiEAACH5BAUKABoALAEAAQAQABAAAAVloCaOWhSRKFmsRToui0bMhOY4aKInWlVpmWCGZCgaSMIhyW' +
		'JJQSAkCsU1AgA0h+yBarUGvgHqYDzQfKmiRoOkUKQeD9RlfiFh7hgSvS6RaPB5JAwMGgiGCBoTE2gCjQJoJI0uIQAAOw==)'

};

/*---------
  Utilities
  ---------*/

function generateSvgIcon(size, color, data) {
	return format('url("data:image/svg+xml,' + 
		'<svg width=\'{0}\' height=\'{0}\' viewBox=\'0 0 {0} {0}\' xmlns=\'http://www.w3.org/2000/svg\'>' +
		'<path fill=\'{1}\' d=\'{2}\'/></svg>")', size, color, data);
}

function createButton(data) {
	var result = document.createElement(data.hasOwnProperty('type') ? data.type : 'a');
	if (data.hasOwnProperty('className')) result.className = data.className;
	if (data.hasOwnProperty('title')) result.title = data.title;
	if (data.hasOwnProperty('onClick')) {
		result.addEventListener('mouseup', data.onClick, false);
		result.addEventListener('click', function(e) { e.preventDefault(); }, false);
		result.addEventListener('contextmenu', function(e) { e.preventDefault(); }, false);
	}
	if (data.hasOwnProperty('parent')) data.parent.appendChild(result);
	if (data.hasOwnProperty('target')) result.setAttribute('target',data.target);
	if (data.hasOwnProperty('style'))
		result.style.cssText = Object.keys(data.style).map(function(x) { return x + ': ' + data.style[x] + 'px'; }).join('; ');
	return result;
}

function format(varargs) {
	var pattern = arguments[0];
	for (var i=1;i<arguments.length;++i) 
		pattern = pattern.replace(new RegExp('\\{' + (i-1) + '\\}', 'g'), arguments[i]);
	return pattern;
}

function xhr(data) {
	return new Promise(function(resolve, reject) {
		var request = {
			method: data.method,
			url: data.url,
			onload: function() { resolve.apply(this, arguments); },
			onerror: function() { reject.apply(this, arguments); }
		};
		if (data.headers) request.headers = data.headers;
		if (data.body && data.body.constructor == String) request.data = data.body;
		else if (data.body) request.data = JSON.stringify(data.body);
		if (typeof(GM_xmlhttpRequest) !== 'undefined') GM_xmlhttpRequest(request);
		else if (typeof(GM) !== 'undefined') GM.xmlHttpRequest(request);
		else reject(new Error('Could not submit XHR request'));
	});
}

function parseHTML(html) {
	var div = document.createElement('div');
	div.innerHTML = html.replace(/src=/g, 'no-src=');
	return div;
}

function updateUI(data) {
	if (!data || data.error) return;
	var temp = (data.isTorrent ? torrentQueue[data.galleryId] : archiveQueue[data.galleryId]);
	temp.button.className = temp.button.className.replace(/\s*working/, '') + ' requested';
    
    if (countDownloads) ehvStore(data);
  
}

function handleFailure(data) {
	if (!data) return;
	var temp = (data.isTorrent ? torrentQueue[data.galleryId] : archiveQueue[data.galleryId]);
	temp.button.className = temp.button.className.replace(/\s*working/, '');
	if (data.error == 'could not find any suitable torrent' && downloadIfNoTorrentFound){
  
    temp.button.previousSibling.dispatchEvent(new MouseEvent("mouseup")); 
      
    }else if (data.error !== 'aborted')
		alert('Could not complete operation.\nReason: ' + (data.error || 'unknown'));
}

function xpathFind(root, nodeType, text) {
	return document.evaluate('.//' + (nodeType || '*') + '[contains(text(), "' + text + '")]', root, null, 9, null).singleNodeValue;
}

function pickTorrent(candidates, lastUpdateDate) {
	var currentScore = 0, currentCandidate = null;
	// Get max values
	var maxSeeds = candidates.reduce(function(p,n) { return Math.max(p, n.seeds); }, 0);
	var maxSize  = candidates.reduce(function(p,n) { return Math.max(p, n.size); }, 0); 
	// Calculate scores
	candidates.forEach(function(candidate) {
		var seedScore = candidate.seeds / maxSeeds;
		var sizeScore = candidate.size / maxSize;
		// Total score
		var score = seedScore * sizeScore ;
		if (currentScore >= score) return;
		currentScore = score;
		currentCandidate = candidate;
	});
	return currentCandidate; 
}

/*--------------
  Download Steps
  --------------*/

function obtainArchiverKey(data) {
	return xhr({
		method: 'GET',
		url: format('{0}//{1}/g/{2}/{3}?random={4}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken, Date.now())
	})
	.then(function(response) {
		var div = parseHTML(response.responseText);
		var target = div.querySelector('[onclick*="archiver.php"]');
		if (!target) data.error = 'could not resolve archiver key';
		else {
			var tokens = target.getAttribute('onclick').match(/or=([^'"]+)/);
			if (!tokens) data.error = 'could not resolve archiver key';
			else data.archiverKey = tokens[1];
		}
		if (data.error) return Promise.reject(data);
		else return data;
	});
}

function obtainTorrentFile(data) {
	return xhr({
		method: 'GET',
		url: format('{0}//{1}/gallerytorrents.php?gid={2}&t={3}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken)
	})
	.then(function(response) {
		var div = parseHTML(response.responseText);
		var forms = div.querySelectorAll('form'), candidates = [ ];
		var findValue = function(text) {
			var target = xpathFind(forms[i], 'span', text);
			return (target ? target.nextSibling.textContent.trim() : null);
		};
		for (var i=0;i<forms.length;++i) {
			var link = forms[i].querySelector('a');
			if (!link) continue;
			// Gather torrent data
			var posted = new Date(findValue('Posted')), size = findValue('Size'),
			seeds = parseInt(findValue('Seeds'), 10) || 0;
			size = parseFloat(size, 10) * (/MB/i.test(size) ? 1024 : (/GB/i.test(size) ? 1024 * 1024 : 1));
			// Ignore torrents with invalid sizes or no seeds or older than newest update
			if (size === 0 || size > (data.size * 1.05) || size > (imageSizeLimit * data.length) || seeds === 0 || (posted < data.date)) continue;
			candidates.push({ link: link.href, date: posted, size: size, seeds: seeds });
		}
        if (candidates.length === 0) data.error = 'could not find any suitable torrent';
		else data.fileUrl = pickTorrent(candidates, data.date).link
		if (data.error) return Promise.reject(data);
		else return data;
	});
}

function confirmDownloadRequest(data) {
	return xhr({
		method: 'GET',
		url: format('{0}//{1}/archiver.php?gid={2}&token={3}&or={4}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken,
			data.archiverKey.replace(/--/, '-'))
	})
	.then(function(response) {
		var div = parseHTML(response.responseText);
		var costLabel = xpathFind(div, '*', 'Download Cost:');
		var sizeLabel = xpathFind(div, '*', 'Estimated Size:');
		if (!costLabel || !sizeLabel)
			return data;
		var cost = costLabel.textContent.replace(/^.+:/, '').trim();
		var size = sizeLabel.textContent.replace(/^.+:/, '').trim();
		var proceed = confirm(format('Size: {0}\nCost: {1}\n\nProceed?', size, cost));
		if (proceed) return data;
		data.error = 'aborted';
		return Promise.reject(data);
	});
}

function confirmDownloadRequestResized(data) {
	return xhr({
		method: 'GET',
		url: format('{0}//{1}/archiver.php?gid={2}&token={3}&or={4}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken,
			data.archiverKey.replace(/--/, '-'))
	})
	.then(function(response) {
      	var div = parseHTML(response.responseText);
		var cost = document.evaluate("/div[1]/div[1]/div[2]/div/strong", div, null, 9, null).singleNodeValue.textContent.trim();
		var size = document.evaluate("/div[1]/div[1]/div[2]/p/strong", div, null, 9, null).singleNodeValue.textContent.trim();
		var proceed = confirm(format('Size: {0}\nCost: {1}\n\nProceed?', size, cost));
		if (proceed) return data;
		data.error = 'aborted';
		return Promise.reject(data);
	});
}

function submitDownloadRequest(data) {
	return xhr({
		method: 'POST',
		url: format('{0}//{1}/archiver.php?gid={2}&token={3}&or={4}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken,
			data.archiverKey.replace(/--/, '-')),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: 'dltype=org&dlcheck=Download+Original+Archive',
	})
	.then(function(response) {
		var div = parseHTML(response.responseText);
		var target = div.querySelector('#continue > a');
		if (target) url = target.href;
		else {
			var targets = div.querySelectorAll('script');
			for (var i=0;i<targets.length;++i) {
				var match = targets[i].textContent.match(/location\s*=\s*"(.+?)"/);
				if (!match) continue;
				url = match[1];
				break;
			}
		}
		if (url) data.archiverUrl = url;
		else data.error = 'could not resolve archiver URL';
		if (data.error) return Promise.reject(data);
		else return data;
	});
}
function submitDownloadRequestResized(data) {
	return xhr({
		method: 'POST',
		url: format('{0}//{1}/archiver.php?gid={2}&token={3}&or={4}',
			window.location.protocol, window.location.host, data.galleryId, data.galleryToken,
			data.archiverKey.replace(/--/, '-')),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: 'dltype=res&dlcheck=Download+Resample+Archive',
	})
	.then(function(response) {
		var div = parseHTML(response.responseText);
		var target = div.querySelector('#continue > a');
		if (target) url = target.href;
		else {
			var targets = div.querySelectorAll('script');
			for (var i=0;i<targets.length;++i) {
				var match = targets[i].textContent.match(/location\s*=\s*"(.+?)"/);
				if (!match) continue;
				url = match[1];
				break;
			}
		}
		if (url) data.archiverUrl = url;
		else data.error = 'could not resolve archiver URL';
		if (data.error) return Promise.reject(data);
		else return data;
	});
}

function waitForDownloadLink(data) {
	return xhr({
		method: 'GET',
		url: data.archiverUrl
	})
	.then(function(response) {
		if (/The file was successfully prepared/i.test(response.responseText)) {
			var div = parseHTML(response.responseText);
			var target = div.querySelector('#db a');
			if (target) {
				var archiverUrl = new URL(data.archiverUrl);
				data.fileUrl = archiverUrl.protocol + '//' + archiverUrl.host + target.getAttribute('href');
			} else data.error = 'could not resolve file URL';
		} else
			data.error = 'archiver did not provide file URL';
		if (data.error) return Promise.reject(data);
		else return data;
	})
	.catch(function() {
		if (data.error) return Promise.reject(data);
		data.error = 'could not contact archiver';
		if (/https/.test(window.location.protocol)) {
			data.error += '; this is most likely caused by mixed-content security policies enforced by the' +
				' browser that need to be disabled by the user. If you have no clue how to do that, you' +
				' should probably Google "how to disable mixed-content blocking".';
		} else {
			data.error += '; please check whether your browser is not blocking XHR requests towards' +
				' 3rd-party URLs';
		}
		return Promise.reject(data);
	});
}

function downloadFile(data) {
	var a = document.createElement('a');
	a.href = data.fileUrl;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	document.body.appendChild(a);
	return Promise.resolve(data);
}
 
function getGalleryData(target) { 
	return xhr({method: 'GET', url: target}).then(function(response) {
		var div = parseHTML(response.responseText);
		gallerySize = xpathFind(div, 'td', 'File Size:').nextSibling.textContent.trim();
		if (gallerySize) gallerySize = parseFloat(gallerySize, 10) * (/MB/i.test(gallerySize) ? 1024 : (/GB/i.test(gallerySize) ? 1024 * 1024 : 1)) ; //in KB
		var galleryLength = xpathFind(div, 'td', 'Length:').nextSibling.textContent.trim().split(' ')[0];
		var galleryDate = new Date(xpathFind(div, 'td', 'Posted:').nextSibling.textContent.trim());
		return [galleryDate, gallerySize, galleryLength];
	});
}

/*----------------
  State Management
  ----------------*/

var archiveQueue = { }, torrentQueue = { };

function requestDownload(e) {
	var isTorrent = /torrentLink/.test(e.target.className);
	if (/working|requested/.test(e.target.className)) return; 
	if (e.which !== 1 && (e.which !== 3 || isTorrent)) return;
	e.preventDefault();
	e.stopPropagation();
	e.target.className += ' working';
	var tokens = e.target.getAttribute('target').match(/\/g\/(\d+)\/([0-9a-z]+)/i);
	var galleryId = parseInt(tokens[1], 10), galleryToken = tokens[2];
	var askConfirmation = (!isTorrent && e.which === 3);
	if (isTorrent) {
		// Try to find out gallery's last update date if possible
		var galleryDate = xpathFind(document, 'td', 'Posted:'); // gallery page
		if (galleryDate) galleryDate = galleryDate.nextSibling;
		else // thumbnail mode
			galleryDate = document.evaluate('./ancestor::tr/td[@class="itd"]', e.target, null, 9, null).singleNodeValue;
		if (galleryDate !== null) galleryDate = new Date(galleryDate.textContent.trim());
		// Gather data
		torrentQueue[galleryId] = { token: galleryToken, button: e.target };
		obtainTorrentFile({ galleryId: galleryId, galleryToken: galleryToken, isTorrent: true, date: galleryDate })
			.then(downloadFile)
			.then(updateUI)
			.catch(handleFailure);
		
	} 
    if(!isTorrent) {
		archiveQueue[galleryId] = { token: galleryToken, button: e.target };
		var promise = obtainArchiverKey({ galleryId: galleryId, galleryToken: galleryToken, isTorrent: false });
		if (askConfirmation) promise = promise.then(confirmDownloadRequest);
		promise
			.then(submitDownloadRequest)
			.then(waitForDownloadLink)
			.then(downloadFile)
			.then(updateUI)
			.catch(handleFailure);
	}
	return false;
}

async function requestDownloadResized(e) { 
	var isTorrent = /torrentLink/.test(e.target.className);
	if (/working|requested/.test(e.target.className)) return; 
	if (e.which !== 1 && (e.which !== 3 || isTorrent)) return;
	e.preventDefault();
	e.stopPropagation();
	e.target.className += ' working';
	var tokens = e.target.getAttribute('target').match(/\/g\/(\d+)\/([0-9a-z]+)/i);
	var galleryId = parseInt(tokens[1], 10), galleryToken = tokens[2];
	var askConfirmation = (!isTorrent && e.which === 3);
	if (window.location.href == e.target.getAttribute('target')){ 
		var gallerySize = xpathFind(document, 'td', 'File Size:').nextSibling.textContent.trim();
		if (gallerySize) gallerySize = parseFloat(gallerySize, 10) * (/MB/i.test(gallerySize) ? 1024 : (/GB/i.test(gallerySize) ? 1024 * 1024 : 1)) ; //in KB
		var galleryLength = xpathFind(document, 'td', 'Length:').nextSibling.textContent.trim().split(' ')[0];
		var galleryDate = new Date(xpathFind(document, 'td', 'Posted:').nextSibling.textContent.trim());
	} else {
		var [galleryDate, gallerySize, galleryLength] = await getGalleryData(e.target.getAttribute('target'));
	} 
    if (isTorrent)  {
		// Gather data
		torrentQueue[galleryId] = { token: galleryToken, button: e.target };
		obtainTorrentFile({ galleryId: galleryId, galleryToken: galleryToken, isTorrent: true, date: galleryDate , size: gallerySize, length: galleryLength })
			.then(downloadFile)
			.then(updateUI)
			.catch(handleFailure);
	}
	if (!isTorrent) { 
		if((gallerySize/galleryLength) < imageSizeLimit ){ 
			archiveQueue[galleryId] = { token: galleryToken, button: e.target };
			var promise = obtainArchiverKey({ galleryId: galleryId, galleryToken: galleryToken, isTorrent: false });
			if (askConfirmation) promise = promise.then(confirmDownloadRequest);
			promise
				.then(submitDownloadRequest)
				.then(waitForDownloadLink)
				.then(downloadFile)
				.then(updateUI)
				.catch(handleFailure);
		} else { 
			archiveQueue[galleryId] = { token: galleryToken, button: e.target };
			var promise = obtainArchiverKey({ galleryId: galleryId, galleryToken: galleryToken, isTorrent: false });
			if (askConfirmation) promise = promise.then(confirmDownloadRequestResized);
			promise
				.then(submitDownloadRequestResized)
				.then(waitForDownloadLink)
				.then(downloadFile)
				.then(updateUI)
				.catch(handleFailure);
		}
	} 
	return false;
}

/*--------
  UI Setup
  --------*/

window.addEventListener('load', function() {
  
    document.querySelectorAll('.gl3m, .gl3c, .gl1e').forEach((button) => {button.onclick = null});

    // button generation (thumbnail)
    var thumbnails = document.querySelectorAll('.gl3t'), n = thumbnails.length;
	while (n-- > 0) {
		createButton({
			title: 'Automated download',
			target: thumbnails[n].querySelector('a').href,
			className: 'automatedButton downloadLink',
			onClick: requestDownloadResized,
			style: { bottom: 0, right: -2 },
			parent: thumbnails[n]
		});
		createButton({
			title: 'Torrent download',
			target: thumbnails[n].querySelector('a').href,
			className: 'automatedButton torrentLink',
			onClick: requestDownloadResized,
			style: { bottom: 0, left: -1 },
			parent: thumbnails[n]
		});
	}


	// button generation (extended)
	var erows = document.querySelectorAll('.gl1e > div > a'), n = erows.length;
	while (n-- > 0) {
		createButton({
			type: 'div',
			title: 'Automated Resized download',
			target: erows[n].href,
			className: 'automatedInline downloadLink',
			onClick: requestDownloadResized,
            style: { 'margin-left': 33 },
			parent: erows[n].parentNode.parentNode.nextSibling.firstChild.firstChild.lastChild
		});
		createButton({
			type: 'div',
			title: 'Torrent download', 
			target: erows[n].href,
			className: 'automatedInline torrentLink',
			onClick: requestDownloadResized,
            style: {  'margin-left': 10 },
			parent: erows[n].parentNode.parentNode.nextSibling.firstChild.firstChild.lastChild
		});
		
	}
  
	// button generation (compact)
	var crows = document.querySelectorAll('.gl3c > div > a'), n = crows.length;
	while (n-- > 0) {
		createButton({
			type: 'div',
			title: 'Automated Resized download',
			target: crows[n].href,
			className: 'automatedInline downloadLink',
			onClick: requestDownloadResized,
            style: { bottom: 0, right: -1 },
			parent: crows[n].parentNode 
		});
		createButton({
			type: 'div',
			title: 'Torrent download', 
			target: crows[n].href,
			className: 'automatedInline torrentLink',
			onClick: requestDownloadResized,
            style: { bottom: 23, right: -1 },
			parent: crows[n].parentNode 
		});
		
	}
  
  //button generation (minimal)
	var rows = document.querySelectorAll('.gl3m > div > a'), n = rows.length;
	while (n-- > 0) {
		createButton({
			type: 'div',
			title: 'Automated Resized download',
			target: rows[n].href,
			className: 'automatedInline downloadLink',
			onClick: requestDownloadResized,
            style: { bottom: 0, right: 0 },
			parent: rows[n].parentNode 
		});
		createButton({
			type: 'div',
			title: 'Torrent download', 
			target: rows[n].href,
			className: 'automatedInline torrentLink',
			onClick: requestDownloadResized,
            style: { bottom: 0, right: 23 },
			parent: rows[n].parentNode 
		});
		
	}

	// button generation (gallery)
	var krows = document.querySelectorAll('#gd5'), n = krows.length;
	while (n --> 0) {
		createButton({
			type: 'div',
			title: 'Automated resized download',
			target: window.location.href,
			className: 'automatedInline downloadLink',
			onClick: requestDownloadResized,
            style: { left: 23 },
			parent: krows[n] 
		});
		createButton({
			type: 'div',
			title: 'Torrent download', 
			target: window.location.href,
			className: 'automatedInline torrentLink',
			onClick: requestDownloadResized,
            style: { left: 0 },
			parent: krows[n] 
		});
	}
	
	/*
	var bigThumbnail = document.querySelector('#gd1 > div');
	if (bigThumbnail !== null) {
		createButton({
			title: 'Automated download',
			target: window.location.href,
			className: 'automatedButton downloadLink',
			onClick: requestDownload,
			style: { bottom: 0, right: 0 },
			parent: bigThumbnail
		});
		createButton({
			title: 'Torrent download',
			target: window.location.href,
			className: 'automatedButton torrentLink',
			onClick: requestDownload,
			style: { bottom: 0, left: 0 },
			parent: bigThumbnail
		});
	}
	*/
  
  
	// document style
	var style = document.createElement('style');
	style.innerHTML =
		// Icons and colors
		'.downloadLink  { background-image: ' + ASSETS.downloadIcon + '; background-color: rgb(220,98,98); }' +
		'.torrentLink  { background-image: ' + ASSETS.torrentIcon + '; background-color: rgb(98,182,210); }' +
		'.requested  { background-image: ' + ASSETS.doneIcon + '; }' +
		'.requested, .working { background-color: rgba(128,226,126,1); }' +
		'.working { background-image: ' + ASSETS.loadingGif + ' !important; background-repeat: no-repeat; }' +
		'.automatedPicker { background-image: ' + ASSETS.pickerIcon + '; }' +
		'.automatedButton:hover, .automatedInline:hover { background-color: rgba(255,199,139,1) }' +
		// Positioning
		'#gd1 > div, .gl3t, .gl1e > div { position: relative; }' +
		'div.it4 { position: absolute!important; right: 0px!important; }' + //compensating for buttons
		'div.it5 { position: absolute!important; left: 48px!important; height: 14px !important;}' +
		'div.i {  margin-left: -16px!important; }' + 
		'div.in { margin-left: -42px!important; margin-top: 3px!important; background: black!important; }' + 
		'div.in:hover { opacity: 0!important;}' + 
		'div.it3 { margin-top: -6px!important; }' +
		'td.itu {overflow: hidden !important; position: absolute !important; height: 14px !important;}' +
		// Backgrounds
		'.automatedButton { background-size: 20px 20px; background-position: 5px 5px; background-repeat: no-repeat; }' +
		'.automatedPicker { background-size: 12px 12px; background-position: 2px 2px; background-repeat: no-repeat; }' +
		'.automatedInline { background-size: 13px 13px; background-position: 5px 5px; background-repeat: no-repeat; }' +
		// Others (thumbnail mode)
		'.automatedButton { display: none; position: absolute; text-align: left; cursor: pointer;' +
			'color: white; margin-right: 1px; font-size: 20px; line-height: 11px; width: 28px; height: 28px; }' +
		'.automatedButton.downloadLink  { border-radius: 0 0 5px 0 !important; }' +
		'.automatedButton.torrentLink  { border-radius: 0 0 0 5px !important; }' +
		'#gd1 > div > .automatedButton { border-radius: 0 0 0 0 !important; }' +
		'.automatedButton.working { font-size: 0px; }' +
		'#gd1 > div:hover .automatedButton, .gl3t:hover .automatedButton, .gl1e > div:hover .automatedButton,' +
		' .automatedButton.working, .automatedButton.requested { display: block !important; }' +
      //  ' .gl3e > .gldown > a {left: -30px; position: absolute;}' +
		// Others (list mode)
		'.automatedPicker { width: 16px; height: 16px; float: left; cursor: pointer; }' + 
		'.automatedPicker > div { display: none; z-index: 2; position: absolute; top: -4px; text-align: center; }' +
		'.automatedPicker:hover > div, .automatedPicker > div:hover { display: block; }' +
		'.automatedInline { position: absolute; z-index: 2; border: 1px solid black; width: 23px; height: 23px; display: inline-block; }' +
		'.automatedInline:first-child { border-right: none !important; }';
	document.head.appendChild(style);

  //store value for gallery size threshold
  if (window.location.pathname == "/uconfig.php"){
    var sdcheckstate = '';
    if(downloadIfNoTorrentFound){sdcheckstate ='checked="true"';}
    var ehcheckstate = '';
    if(saveDownloadsAsVisits){ehcheckstate ='checked="true"';}
    var settingsdiv = document.createElement('div');
    var ehvisitedsetting = '<span>Count downloaded galleries in E-H Visited script (requires https://sleazyfork.org/en/scripts/377945-e-h-visited )</span><input id="ehvisitedcountdownloads" type="checkbox" ' + ehcheckstate  + '><br>';
    
    settingsdiv.innerHTML = '<h2>Sensible sized E-Hentai Automated Downloads settings</h2><br><span>Image size limit in KB. Default is 1500 i.e. 1.5MB </span>' + 
                            '<input id="imagesizeconfig" type="text" value=' + imageSizeLimit +' ><br><span>Start a direct download if no appropriate torrent is ' + 
                            'available </span><input id="autodownload" type="checkbox" ' + sdcheckstate  + '><br>' + ehvisitedsetting + '<input type="button" id="savescriptsettings" value="Save">'; 
      
    document.getElementById("outer").insertBefore(settingsdiv, document.getElementById("profile_outer"));
    
    document.getElementById("savescriptsettings").addEventListener("click", function(){
      if (isNaN(document.getElementById("imagesizeconfig").value)){
        alert('Needs to be a number');
      } else if (typeof(GM_setValue) !== 'undefined') {
        GM_setValue('downloadIfNoTorrentFound', document.getElementById("autodownload").checked);
        GM_setValue('saveDownloadsAsVisits', document.getElementById("ehvisitedcountdownloads").checked);
        GM_setValue('imageSizeLimit', document.getElementById("imagesizeconfig").value);
      } else if (typeof(GM) !== 'undefined') {
          GM.setValue('downloadIfNoTorrentFound', document.getElementById("autodownload").checked);
          GM.setValue('saveDownloadsAsVisits', document.getElementById("ehvisitedcountdownloads").checked);
          GM.setValue('imageSizeLimit', document.getElementById("imagesizeconfig").value);
      } else reject(new Error('GM methods not working'));
    })
    
  }
  
   
  
  
  
}, false);
