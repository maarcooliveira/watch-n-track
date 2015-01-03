/* This script file is inserted in Netflix pages' DOM.
	This is the only way to get access to the variables
	defined in the scripts from the page. The information
	about the movie or show is is then sent thru a document
	event, that is captured in contentscript.js. */

var video = netflix.cadmium.metadata.getMetadata().video;

var title = video.title;
var type = video.type;

if (type === "movie") {
	var year = video.year;
	var duration = video.creditsOffset;

	var event = document.createEvent("CustomEvent");  
	event.initCustomEvent("MovieCheckinEvent", true, true, {
		"title": title,
		"year": year,
		"duration": duration
	});
	window.dispatchEvent(event);
} 

else if (type === "show") {
	var active_video = netflix.cadmium.metadata.getActiveVideo();
	var active_season = netflix.cadmium.metadata.getActiveSeason();
	
	var year = video.seasons[0].year;
	var duration = active_video.creditsOffset;
	var episode_title = active_video.title;
	var episode = active_video.seq;
	var season = active_season.seq;

	var event = document.createEvent("CustomEvent");  
	event.initCustomEvent("ShowCheckinEvent", true, true, {
		"title": title,
		"year": year,
		"duration": duration,
		"episode_title": episode_title,
		"episode": episode,
		"season": season
	});
	window.dispatchEvent(event);
}