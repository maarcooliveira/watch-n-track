/* Execution of in-line scripts is not allowed in chrome extensions.
	This adds a listener to the button Login, calling trakt_login_obj()
	when the button is pressed */
$( document ).ready(function() {
	document.getElementById("login").addEventListener("click", trakt_login_obj);
	document.getElementById("logout").addEventListener("click", trakt_logout);
	document.getElementById("history").addEventListener("click", open_history);
	document.getElementById("settings").addEventListener("click", open_settings);

	chrome.storage.sync.get('trakt_user', function (obj) {
		if (! obj['trakt_user'])
			$("#logout_div").css("display", "none");
		else {
			$("#login_div").css("display", "none");
			$("#username").html(obj['trakt_user']);
		}
	});
});


/* Gets the data from the input form, create a json object and send it
	to trakt_login. */
function trakt_login_obj(){
	var login_data = {
		'username': $("#user").val(),
		'password': $("#password").val()
	};	

	trakt_login(login_data);
}


/* Makes async call to the trakt API to test if the login is valid or not.
	Updates the <div> response in the login form.
	login_data: json object containing 'username' and 'password' */
function trakt_login(login_data){

	console.log("trakt_login called");

	$("#response").html("<img src=\"images/loading-animation.gif\" width=\"20px\" height=\"20px\">");

	$.ajax({
		type: "POST",
		url: "http://api.trakt.tv/account/test/06a9ca4dfd6bbcef97a1ef9aef048d64",
		dataType: "json",
		success: function (data) {
			chrome.runtime.sendMessage({greeting: "SuccessIcon"});
			saveLoginData(login_data);
			$("#login_div").css("display", "none");
			$("#logout_div").css("display", "inline");
			$("#username").html(login_data['username']);
		},
		error: function (data) {
			$("#response").html("invalid user/password");
		},

		data: login_data
	});
}


/* Store login data when the user is successfully connected to trakt.
	The values stored here are synchronized to the user's google account.*/
function saveLoginData(login_data) {
	
	var user = login_data['username'];
	var password = login_data['password'];

	chrome.storage.sync.set({'trakt_user': user}, function() {
		chrome.storage.sync.set({'trakt_password': password}, function() {
			chrome.storage.sync.get('trakt_user', function (obj) {
					  console.log(obj);
				 });
			chrome.storage.sync.get('trakt_password', function (obj) {
					  console.log(obj);
				 });
		});
	});
}


/* Logout from trakt account. Remove all the data from Chrome
   storage. */
function trakt_logout() {

	 chrome.storage.sync.remove('trakt_user');
	 chrome.storage.sync.remove('trakt_password');
	 chrome.runtime.sendMessage({greeting: "LogoutIcon"});

	 $("#login_div").css("display", "inline");
	 $("#logout_div").css("display", "none");
}


/* Open the settings page in a new tab */
function open_settings(){
	chrome.tabs.create({'url': chrome.extension.getURL('settings.html')}, function(tab) {
	});
}


/* Open the history page in a new tab */
function open_history(){
	chrome.tabs.create({'url': chrome.extension.getURL('history.html')}, function(tab) {
	});
}
