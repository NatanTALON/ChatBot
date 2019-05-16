const express = require('express');
const bodyParser = require('body-parser');
const RiveScript = require('rivescript');



class Bot {
/*
	connectionUrl;
	listeningPort;
	cerveau;
	conversations;
*/
	constructor(url, port, brain) {
		this.connectionUrl = url;
		this.listeningPort = port;
		this.cerveau = new RiveScript();
		this.conversations = [];
		/*
		[
			{
				userName: String
				messageList: [ {author: String, message: String} ]
			}
		]
		*/

		if(brain) {
			this.cerveau.loadFile('./cerveaux/'+brain).then(loading_done.bind(this)).catch(loading_error);
		} else {
			this.cerveau.loadDirectory("./cerveaux").then(loading_done.bind(this)).catch(loading_error);
		}

		function loading_done() {
			console.log("Bot has finished loading!");
			this.cerveau.sortReplies();

			const app = express();
			app.set('view engine', 'ejs');

			app.use(bodyParser.urlencoded({ extended: false }))
			app.use(bodyParser.json());

			app.get('/', function(req, res) {
				res.render('login');
			});

			app.post('/', postOnHome.bind(this));
			function postOnHome(req,res) {
				let newConv = {userName: req.body.userName, messageList: []};
				this.conversations.push(newConv);
				res.render('conversation', {conv: newConv});
			}

			app.post('/conv', postOnConv.bind(this));
			function postOnConv(req,res) {
				let i = this.conversations.findIndex(function(elt) {
					return elt.userName == req.body.userName;
				});

				if (i != -1) {
					this.conversations[i].messageList.push({author: req.body.userName, message: req.body.message});
					this.cerveau.reply(req.body.userName, req.body.message).then(botResponse.bind(this)).then(sendResponse.bind(this));
					function botResponse(reply) {
						this.conversations[i].messageList.push({author: "bot", message: reply});
					}
					function sendResponse() {
						res.render('conversation', {conv: this.conversations[i]});
					}
				} else {
					res.render('login');
				}

			}

			app.listen(port, () => console.log(`bot listening on ${port}`));
		}


		function loading_error(error, filename, lineno) {
			console.log("Error when loading files: " + error);
		}
	}
}


/* test */
var bot = new Bot("", 3000, undefined);

module.exports = Bot;