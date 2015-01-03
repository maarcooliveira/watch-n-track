/* Used to identify the notifications */
var notification_id;

/* Store the data about the last show/movie watched; used
   later if the user decides to undo the checkin */
var last_watched;

/* Informs if the last video watched was a movie or a show */
var last_watched_type;

/* Function called when a tab is updated
		tabId: id of the tab that called the listener
		changeInfo: changes of the state of the tab
		tab: the state of the tab updated */
chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab)
	{ 
		if (changeInfo.status === "complete") {

			chrome.tabs.executeScript(tab.id, {code: ""}, function(){
			
			var url = tab.url;
			
			if (url.indexOf("netflix.com") !== -1) {
				change_icon("nf-icon.png", tab.id);
			}
		});
	}
});


/* Listener for when another file of the extension sends a message.
		request: message sent to the listener
		sender: the sender of the message
		sendResponse: function to be called to send a response to the sender*/
chrome.extension.onMessage.addListener( 
	function (request, sender, sendResponse) {
		if (request.greeting === "SuccessIcon")
			change_icon("ac-icon.png", null);

		else if(request.greeting === "LogoutIcon")
			change_icon("ic-icon.png", request.tab_id);      

		else if(request.greeting === "CheckinIcon")
			change_icon("ck-icon.png", request.tab_id);

		else if(request.greeting === "CheckinMovie")
			checkin_movie(request, sender.tab.id);

		else if(request.greeting === "CheckinShow")
			checkin_show(request, sender.tab.id);

		else if(request.greeting === "NotifyWatching")
			notificate_user_watching(request);

		else if(request.greeting === "UndoCheckin")
			change_icon("nf-icon.png", request.tab_id);
});


/* Function to change the icon of the extension.
		file_name: the name of the icon file
		tab_id: the id of the tab where the icon will be changed.
			The change will be applied for all tabs if null is received. */
function change_icon (file_name, tab_id) {

	if (tab_id) {
		chrome.browserAction.setIcon({
			path: "images/" + file_name,
			tabId: tab_id
		});
	}
	else {
		chrome.browserAction.setIcon({
			path: "images/" + file_name
		});
	}
}


/* Function to prepare the data of a show and send it to the trakt API.
	 At this time, it only shows an alert with the show data.
		show_data: object containing title, year, season and episode of the show. */
function checkin_show(show_data, tab_id) {

	var user;
	var password;

	chrome.storage.sync.get('trakt_user', function (obj) {
		user = obj['trakt_user'];

		chrome.storage.sync.get('trakt_password', function (obj) {
			password = obj['trakt_password'];

			var data = {
				'username': user,
				'password': password,
					'title': show_data.title,
					 'year': show_data.year,
				'episodes': [
					{
						"season": show_data.season,
						"episode": show_data.episode
					}
				]
			};

			last_watched = data;
			last_watched_type = 'show';

			$.ajax({
				type: "POST",
				url: "http://api.trakt.tv/show/episode/seen/06a9ca4dfd6bbcef97a1ef9aef048d64",
				dataType: "json",
				success: function (data) {
						 chrome.runtime.sendMessage({
							greeting: "CheckinIcon",
							tab_id: tab_id
						});
						 notificate_user_checkin(show_data);
				},
				error: function (data) {
					notificate_user_error();
				},

				data: data
			});
		});
	});
}


/* Function to prepare the data of a movie and send it to the trakt API.
	 At this time, it only shows an alert with the movie data. 
		movie_data: object containing title and year of the movie. */
function checkin_movie(movie_data, tab_id) {

	var user;
	var password;

	chrome.storage.sync.get('trakt_user', function (obj) {
		user = obj['trakt_user'];

		chrome.storage.sync.get('trakt_password', function (obj) {
			password = obj['trakt_password'];

			var data = {
				'username': user,
				'password': password,
				  'movies': [
						{
							"title": movie_data.title,
							"year": movie_data.year
						}
					]
			};

			last_watched = data;
			last_watched_type = 'movie';

			$.ajax({
				type: "POST",
				url: "http://api.trakt.tv/movie/seen/06a9ca4dfd6bbcef97a1ef9aef048d64",
				dataType: "json",
				success: function (data) {
						 chrome.runtime.sendMessage({
							greeting: "CheckinIcon",
							tab_id: tab_id
						});
						notificate_user_checkin(movie_data);
				},
				error: function (data) {
					notificate_user_error();
				},

				data: data
			});
		});
	});
}


/* Create a notification to inform the user that the extension identified
	the show or movie being watched */
function notificate_user_watching(data){

	var opt = {
		type: "basic",
		title: "Now watching",
		message: data.title,
		iconUrl: "images/nf-icon.png"
	}

	chrome.notifications.create("", opt, function(){});
}


/* Create a notification to inform that trakt received the information about
	the show or movie being watched and it is now marked as watched. */
function notificate_user_checkin(data){

	var opt = {
		type: "basic",
		title: data.title,
		message: "Added to your trakt history",
		iconUrl: "images/ck-icon.png",
		buttons: [{
		            title: "Open my Trakt account"
		        }, {
		            title: "Undo this checkin"
		        }]
	}

	chrome.notifications.create("", opt, function(id){
		notification_id = id;
	});

}


/* Create a notification to inform that an error occurred and the checkin
	was not done. */
function notificate_user_error(){

	var opt = {
		type: "basic",
		title: "Error",
		message: "Please login to Trakt.tv first",
		iconUrl: "images/ic-icon.png",
	}

	chrome.notifications.create("", opt, function(){});
}


/* Notify the user when the undo action was successful */
function notificate_user_undo(){

	var opt = {
		type: "basic",
		title: "Checkin canceled",
		message: "This activity was removed from your Tratk.tv account",
		iconUrl: "images/ic-icon.png",
	}

	chrome.notifications.create("", opt, function(){});
}


/* Notify the user when something went wrong and the checkin
   was not removed */
function notificate_user_undo_error(){

	var opt = {
		type: "basic",
		title: "Something went wrong",
		message: "This activity was not removed from your account",
		iconUrl: "images/ic-icon.png",
	}

	chrome.notifications.create("", opt, function(){});
}


/* Add a click listerner to the buttons of the notification. The first button
   takes the user to his/her trakt profile page; the second one is to undo the
   last checkin. */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    
    if (notifId === notification_id) {
        
        if (btnIdx === 0) {
        	chrome.storage.sync.get('trakt_user', function (obj) {
        		user = obj['trakt_user'];

        		chrome.tabs.create({'url': 'http://trakt.tv/user/' + user}, function(tab) {
        		});
        	});     

        } else if (btnIdx === 1) {
            undo_checkin();
        }
    }
});


/* Call the 'unseen' method on trakt API to remove the last show
   or movie when the user wants to. The API call depends on the
   category: there is one for movies and one for shows. */
function undo_checkin() {

	var url;

	if (last_watched_type === 'movie')
		url = 'http://api.trakt.tv/movie/unseen/06a9ca4dfd6bbcef97a1ef9aef048d64';
	else if (last_watched_type === 'show')
		url = 'http://api.trakt.tv/show/episode/unseen/06a9ca4dfd6bbcef97a1ef9aef048d64';

	$.ajax({
		type: "POST",
		url: url,
		dataType: "json",
		success: function (data) {
				 notificate_user_undo();
		},
		error: function (data) {
			notificate_user_undo_error();
		},

		data: last_watched
	});
}


/* Add a listener to the extension to identify when it is the first install of
   the extension; Add the default values for the settings on the storage. */
chrome.runtime.onInstalled.addListener(function(details) {
    
    if (details.reason == "install") {
        console.log("This is a first install!");
        var default_checkin_time = 600000; // 10 min
        var default_track_netflix = true;
        var default_tracker_trakt = true;

        chrome.storage.sync.set({'checkin_time': default_checkin_time}, function() {});
        chrome.storage.sync.set({'track_netflix': default_track_netflix}, function() {});
        chrome.storage.sync.set({'tracker_trakt': default_tracker_trakt}, function() {});

        chrome.storage.sync.get('trakt_user', function (obj) {
        	if (obj['trakt_user'])
        		chrome.runtime.sendMessage({greeting: "SuccessIcon"});
        });

    }
});
