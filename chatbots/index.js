const express = require('express');
const bodyParser = require('body-parser');
const RiveScript = require('rivescript');

const port = 3001;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


var chatbots = [];


app.post('/newBot', function(req, res) {
	let bot = new RiveScript();

	if(req.body.cerveau) {
		// Load an individual file.
		bot.loadFile("../cerveaux/"+req.body.cerveau).then(loading_done).catch(loading_error);
	} else {
		// Load a directory full of RiveScript documents (.rive files). This is for
		// Node.JS only: it doesn't work on the web!
		bot.loadDirectory("../cerveaux").then(loading_done).catch(loading_error);
	}

	// All file loading operations are asynchronous, so you need handlers
	// to catch when they've finished. If you use loadDirectory (or loadFile
	// with multiple file names), the success function is called only when ALL
	// the files have finished loading.
	function loading_done() {
		console.log("Bot has finished loading!");

  		// Now the replies must be sorted!
  		bot.sortReplies();

  		res.render("");

  		// And now we're free to get a reply from the brain!

  		// RiveScript remembers user data by their username and can tell
  		// multiple users apart.
  		let username = "local-user";

  		// NOTE: the API has changed in v2.0.0 and returns a Promise now.
  		bot.reply(username, "Hello, bot!").then(function(reply) {
  			console.log("The bot says: " + reply);
  		});
	}

	// It's good to catch errors too!
	function loading_error(error, filename, lineno) {
		console.log("Error when loading files: " + error);
	}

	chatbots.push(bot);

});


app.post('/')

