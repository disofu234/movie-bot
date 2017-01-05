var botgram = require("botgram");
var getJSON = require("get-json");

var bot = botgram(process.env.TOKEN);

bot.command("start", function(msg, reply, next) {
  var date = processDate();
  var api_url = "http://data.tmsapi.com/v1.1/movies/showings?startDate=" + date + "&zip=60031&api_key=" + process.env.API_KEY;
  
  console.log("here");
  
  getJSON(api_url, function(error, data) {
    if (error) console.log(error);
    
    data.forEach(function(movie) {
      var text = "";
      
      text += "*" + movie.title + "*\n\n";
      
      text += "Showings: ";
      
      movie.showtimes.forEach(function(showtime, ind, arr) {
        if (checkTime(showtime.dateTime)) {
          if (ind != (arr.length - 1)) {
            text += "[" + formatTime(showtime.dateTime) + "](" + showtime.ticketURI + "), "; 
          } else {
            text += "[" + formatTime(showtime.dateTime) + "](" + showtime.ticketURI + ")";
          }
        }
      });
      
      reply.markdown(text);
    });
  });
});

function processDate() {
  var date_obj = new Date();
  var year = date_obj.getFullYear();
  var month = (+date_obj.getMonth() + 1 < 10) ? "0" + (+date_obj.getMonth() + 1) : date_obj.getMonth() + 1;
  var date = (+date_obj.getDate() < 10) ? "0" + date_obj.getDate() : date_obj.getDate();

  return year + "-" + month + "-" + date;
}

function checkTime(time) {
  var time_check = new Date(time);
  var time_now = new Date();
  
  var offset = time_now.getTimezoneOffset() * 60000;

  return (time_check.getTime() + offset > time_now.getTime());
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