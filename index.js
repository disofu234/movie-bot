var botgram = require("botgram");
var getJSON = require("get-json");

var bot = botgram(process.env.TOKEN);

bot.command("start", function(msg, reply, next) {
	var text = "Hello! I can show movie times near you at any part of the U.S. Just simply send your zip code through the [/setzipcode] command.\n\n*ex.* /setzipcode 45532";
	
	reply.markdown(text);
	
	bot.command("setzipcode", function(msg, reply, next) {
		if (msg.args()) {
			var zipcode = msg.args();
			
			if (checkZip(zipcode)) {
				
				var date = processDate();
				var api_url = "http://data.tmsapi.com/v1.1/movies/showings?startDate=" + date + "&zip="+ zipcode + "&api_key=" + process.env.API_KEY;
				
				getJSON(api_url, function(err, data) {
					if(err) console.error(err);
					
					if (data) {
						reply.markdown("Your zip code has been recorded correctly. Use the following commands to find movie times:\n\n[/getalltimes] - gets all movie times near you.\n\n[/getmovietime] - gets all the showings of a specific movie.");
						
						bot.command("getalltimes", function(msg, reply, next) {
							
							var theatres = [];
							
							data.forEach(function(movie) {
								var text = "";
								
								text += "*" + movie.title + "*\n\n";
								
								movie.showtimes.forEach(function(showtime) {
									
									var name = showtime.theatre.name;
									
									if (theatres.indexOf(name) === -1) {
										theatres.push(name);
									}
								});
								
								
								theatres.forEach(function(theatre) {
									text += "at " + theatre + ":\n";
									
									movie.showtimes.forEach(function(showtime) {
										if (showtime.theatre.name == theatre) {
											text += "[" + formatTime(showtime.dateTime) + "](" + showtime.ticketURI + ") ";
										}
									});
									
									text += "\n";
								});
			
								reply.markdown(text);
							});	
						});
			
						bot.command("getmovietime", function(msg, reply, next) {
							var theatres = [];
							
							if (msg.args()) {
								var movie = msg.args();
					
								var found = false;
					
								for (var i = 0; i < data.length; i++) {
									if (data[i].title.toLowerCase() == movie.toLowerCase()) {
										found = true;
							
										var text = "*" + data[i].title + "*\n\n";
							
										data[i].showtimes.forEach(function(showtime, ind, arr) {
											var name = showtime.theatre.name;
									
											if (theatres.indexOf(name) === -1) {
												theatres.push(name);
											}
										});
										
										theatres.forEach(function(theatre) {
											text += "at " + theatre + ":\n";
									
											data[i].showtimes.forEach(function(showtime) {
												if (showtime.theatre.name == theatre) {
													text += "[" + formatTime(showtime.dateTime) + "](" + showtime.ticketURI + ") ";
												}
											});
									
											text += "\n";
										});
										
										reply.markdown(text);
									}
								}
					
								if (!found) {
									reply.text("Couldn't find what you were looking for. Make sure that there aren't any spelling mistakes in your search.");
								}
					
							} else {
								reply.markdown("No movie name given. Try again with a movie name.\n\n*ex.* /getmovietime Sing");
							}
						});
					} else {
						reply.text("There was an error retrieving showings data. Make sure that your zip code is valid.");
					}
				});
			} else {
				reply.text("Oh no! Your zipcode doesn't seem to make sense. Make sure that it is a 5 digit number.");
			}
		} else {
			reply.text("Whoops! No zipcode was given, please try again.\n\n*ex.* /setzipcode 45532");
		}
	});
});

function processDate() {
	var date_obj = new Date();
	var year = date_obj.getFullYear();
	var month = (+date_obj.getMonth() + 1 < 10) ? "0" + (+date_obj.getMonth() + 1) : date_obj.getMonth() + 1;
	var date = (+date_obj.getDate() < 10) ? "0" + date_obj.getDate() : date_obj.getDate();

	return year + "-" + month + "-" + date;
}

function formatTime(time) {
	var date = new Date(time);
  
	var am_pm = (+date.getUTCHours() >= 12) ? "PM" : "AM";
	var hours = (+date.getUTCHours() > 12) ? date.getUTCHours() - 12 : date.getUTCHours();
  
	if (hours === 0) {
		hours = 12;
	}
  
	var minutes = (+date.getUTCMinutes() < 10) ? "0" + date.getUTCMinutes(): date.getUTCMinutes();
  
	return hours + ":" + minutes + " " + am_pm;
}

function checkZip(zip) {
	var zipregex = /\d\d\d\d\d/;
	
	return zipregex.test(zip);
}