const express = require('express');
const bodyParser = require('body-parser');
const RiveScript = require('rivescript');
const Discord = require('discord.js');

const services = {
	SMS: 0,
	DISCORD: 1
}

class Bot {
/*
	connectionUrl;
	listeningPort;
	cerveau;
	conversations;
*/
	constructor(service, token, brain) {
		this.service = service;
		this.token = token;
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

			switch(this.service) {
				case services.SMS:
					connect_SMS.bind(this)();
					break;
				case services.DISCORD:
					connect_DISCORD.bind(this)();
					break;
				default:
					console.log("Error: Unkown service");
			}
		}


		function connect_SMS() {
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

			app.listen(this.token, () => console.log(`bot listening on ${this.token}`));
		}



		function connect_DISCORD() {
			const client = new Discord.Client();

			client.on('ready', () => {
				console.log(`Logged in as ${client.user.tag}!`);
			});

			client.on('message', botResponse.bind(this));

			function botResponse(msg) {
				if(msg.author.discriminator != 3118 && msg.content.split(' ')[0] == '<@579288474964852737>') {
					this.cerveau.reply(msg.author.discriminator, msg.content).then(sendResponse.bind(this));
					function sendResponse(botMsg) {
						msg.reply(botMsg);
					}	
				}
			}


			client.login(this.token);
		}


		function loading_error(error, filename, lineno) {
			console.log("Error when loading files: " + error);
		}
	}
}


/* test */
var bot = new Bot(1, 'NTc5Mjg4NDc0OTY0ODUyNzM3.XN__wg.5dkZA5O3uMyDbBySY0co-KljaIg', undefined);

module.exports = Bot;
