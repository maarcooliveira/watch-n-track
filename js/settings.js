/* Default setting values */
var default_checkin_time = 600000;
var default_track_netflix = false;
var default_tracker_trakt = false;


/* Call the functions that load the stored setting values into the html page */
$( document ).ready(function() {
	document.getElementById("save").addEventListener("click", save_settings);

	loadCheckinTime();
	loadIsNetflixOn();
	loadIsTraktOn();
});


/* Load the waiting time before checking-in each show or movie.
   If the value is not stored on the Chrome storage, the default
   value is used. */
function loadCheckinTime(){
	chrome.storage.sync.get('checkin_time', function (obj) {
		var checkin_time = obj['checkin_time'];

		if (checkin_time)
			$('#checkin-time').val(checkin_time/60000);
		else
			$('#checkin-time').val(default_checkin_time/60000);
	});
}


/* Load the setting that enable or disable Netflix tracking.
   If the value is not defined, the default (false) is used */
function loadIsNetflixOn(){
	chrome.storage.sync.get('track_netflix', function (obj) {
		var isOn = obj['track_netflix'];

		if (isOn === true) 
			$('#track-netflix').prop('checked', true);
		else
			$('#track-netflix').prop('checked', false);
	});
}


/* Load the setting that enable or disable the use of trakt
   for tracking the streaming activity. False is used if the
   value is not defined on the storage. */
function loadIsTraktOn(){
	chrome.storage.sync.get('tracker_trakt', function (obj) {
		var isOn = obj['tracker_trakt'];
		
		if (isOn === true) 
			$('#tracker-trakt').prop('checked', true);
		else
			$('#tracker-trakt').prop('checked', false);
	});
}


/* Get the data from the settings page, checks if the user
   put a valid value for checkin time and store the values. */
function save_settings(){
	var checkin_time = $("#checkin-time").val();

	if (checkin_time > 0 && checkin_time !== ''){
		checkin_time *= 60000;
		
		var track_netflix = $("#track-netflix").prop('checked');
		var tracker_trakt = $("#tracker-trakt").prop('checked');

		chrome.storage.sync.set({'checkin_time': checkin_time}, function() {
			chrome.storage.sync.set({'track_netflix': track_netflix}, function() {
				chrome.storage.sync.set({'tracker_trakt': tracker_trakt}, function() {

				});
			});
		});
		window.alert('Settings saved');
	}
	else {
		window.alert("Invalid value for checkin_time");
	}
}