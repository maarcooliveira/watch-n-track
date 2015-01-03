/* This file contains functions responsible for inserting the data-capture
	script inside the Netflix page and adding listener to receive this data
	and redirect it to the listener in background.js. These functions run 
	everytime the user opens a page in http://*.netflix.com/*.
*/


/* timeout to execute inject_script so the page has enough time to load the
	data into its variables. It runs only if Netflix and Trakt are enabled
	by the user on settings. */
chrome.storage.sync.get('track_netflix', function (obj) {
	var track_netflix = obj['track_netflix'];
	chrome.storage.sync.get('tracker_trakt', function (obj) {
		var tracker_trakt = obj['tracker_trakt'];

		if (track_netflix === true && tracker_trakt === true) {
			setTimeout(inject_script, 5000);
		}

	});
});


/* Create a script tag into the page document and insert the content from
	get-data.js into it.  */
function inject_script(){
	var script = document.createElement('script');
	script.type="text/javascript";
	script.src = chrome.extension.getURL('js/get-data.js');

	document.getElementsByTagName('head')[0].appendChild(script);
}


/* Add a listener to the ShowCheckinEvent so the data from the script loaded
	into the page can be recovered. The data sent by the sendMessage function
	is later caught by the listener in background.js */
window.addEventListener("ShowCheckinEvent", function (e) {
  	var data = e.detail;

  	chrome.runtime.sendMessage({
		greeting: "NotifyWatching",
		title: data.title
	});
  	
  	chrome.storage.sync.get('checkin_time', function (obj) {
  		var checkin_time = obj['checkin_time'];

		setTimeout(function(){
			  	chrome.runtime.sendMessage({
					greeting: "CheckinShow",
					title: data.title,
					year: data.year,
					duration: data.duration,
					episode_title: data.episode_title,
					episode: data.episode,
					season: data.season
				});
		}, parseInt(checkin_time));
  	});
  	
});


/* Add a listener to the MovieCheckinEvent so the data from the script loaded
	into the page can be recovered. The data sent by the sendMessage function
	is later caught by the listener in background.js */
window.addEventListener("MovieCheckinEvent", function (e) {
  	var data = e.detail;

  	chrome.runtime.sendMessage({
		greeting: "NotifyWatching",
		title: data.title
	});

  	chrome.storage.sync.get('checkin_time', function (obj) {
  		var checkin_time = obj['checkin_time'];

		setTimeout(function(){
	  	  	chrome.runtime.sendMessage({
	  			greeting: "CheckinMovie",
	  			title: data.title,
	  			year: data.year,
	  			duration: data.duration
	  		});
		}, parseInt(checkin_time));
  	});
});