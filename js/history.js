/* Starts loading the user history when the page loads.  */
$( document ).ready(load_history);


/* Call trakt API to load the history from the user logged in at
   the moment when the page is open. For each object in the activity array,
   insert_data() is called. */
function load_history() {

	console.log("load_history called");

	chrome.storage.sync.get('trakt_user', function (obj) {
		var user = obj['trakt_user'];

		$.ajax({
			type: "GET",
			url: "http://api.trakt.tv/activity/user.json/06a9ca4dfd6bbcef97a1ef9aef048d64/" + user + "/episode,movie" + "/watching,scrobble,seen",
			dataType: "json",
			success: function (data) {
				console.log(data);

				for (var activity = 0; activity < data['activity'].length; activity++){
					console.log(data['activity'][activity]);
					insert_data(data['activity'][activity]);
				}
			},
			error: function (data) {
				window.alert("Connection error");
			},
		});
	});
	
}


/* Append each show/movie to the history page. The content to be inserted
   depends on whether it is a movie or a show; If it is a show, the access
   to the object depends also on whether the activity is 'seen' or 'scrobble' */
function insert_data(activity) {
	var type = activity['type'];

	if (type === 'movie') {

		var title = activity['movie']['title'];
		var year = activity['movie']['year'];
		var url = activity['movie']['url'];
		var image = activity['movie']['images']['poster'];
		var date = activity['timestamp'];

		$('#history-itens').append(
			  "<div id=\"history-item\">"
			+ "<img src=\"" + image + "\" width=\"136px\" height=\"200px\" align=\"left\">"
          	+ "<h3>" + title + " [" + year + "]</h3>"
			+ "<h4>&nbsp</h4>"
			+ "<p>&nbsp</p>"
			+ "<p>" + new Date(date*1000) + "</p>"
			+ "<div class=\"clear\"></div>"
			+ "</div>");
	}
	else if (type === 'episode'){

		var show_name = activity['show']['title'];
		var year = activity['show']['year'];
		var image = activity['show']['images']['poster']
		var date = activity['timestamp'];

		if (activity['action'] === 'seen') {
			var title = activity['episodes'][0]['title'];
			var url = activity['episodes'][0]['url'];
			var season = activity['episodes'][0]['season'];
			var episode = activity['episodes'][0]['episode'];
		}
		else {
			var title = activity['episode']['title'];
			var url = activity['episode']['url'];
			var season = activity['episode']['season'];
			var episode = activity['episode']['episode'];
		}

		$('#history-itens').append(
			  "<div id=\"history-item\">"
			+ "<img src=\"" + image + "\" width=\"136px\" height=\"200px\" align=\"left\">"
          	+ "<h3>" + show_name + " [" + year + "]</h3>"
			+ "<h4>" + title + "</h4>"
			+ "<p>Season " + season + ", Episode " + episode + "</p>"
			+ "<p>" + new Date(date*1000) + "</p>"
			+ "<div class=\"clear\"></div>"
			+ "</div>");

	}
}