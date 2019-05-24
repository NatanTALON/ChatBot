const express = require('express');
const bodyParser = require('body-parser');
const RiveScript = require('rivescript');
const Discord = require('discord.js');

const services = {
	SMS: 0,
	DISCORD: 1		// https://discordapp.com/oauth2/authorize?client_id=Bot_Client_ID&scope=bot&permissions=2048	clientId for botounet = 579288474964852737
}

class Bot {

	constructor(name, service, token, brain) {
		this.name = name;
		this.service = service;
		this.token = token;
		this.brain = new RiveScript({utf8: true});
		this.conversations = [];
		this.app;
		/*
		[
			{
				userName: String
				messageList: [ {author: String, message: String} ]
			}
		]
		*/

		this.getName = function () {
			return this.name;
		}


		this.loading_done = function () {
			console.log("Bot has finished loading!");
			this.brain.sortReplies();
			this.connectToService();			
		}


		this.connectToService = function () {
			switch(this.service) {
				case services.SMS:
					this.connect_SMS();
					break;
				case services.DISCORD:
					this.connect_DISCORD();
					break;
				default:
					console.log("Error: Unkown service");
			}
		}


		this.connect_SMS = function () {
			this.app = express();
			this.app.set('view engine', 'ejs');

			this.app.use(bodyParser.urlencoded({ extended: false }))
			this.app.use(bodyParser.json());

			this.app.get('/', function(req, res) {
				res.render('login');
			});

			this.app.post('/', postOnHome.bind(this));
			function postOnHome(req,res) {
				let newConv = {userName: req.body.userName, messageList: []};
				this.conversations.push(newConv);
				res.render('conversation', {conv: newConv});
			}

			this.app.post('/conv', postOnConv.bind(this));
			function postOnConv(req,res) {
				let i = this.conversations.findIndex(function(elt) {
					return elt.userName == req.body.userName;
				});

				if (i != -1) {
					this.conversations[i].messageList.push({author: req.body.userName, message: req.body.message});
					this.brain.reply(req.body.userName, req.body.message).then(botResponse.bind(this)).then(sendResponse.bind(this));
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

			this.app.listen(parseInt(this.token,10), () => console.log(`bot listening on ${this.token}`));
		}
		


		this.stopListen = function(){
			if( this.service == 0){
				this.app.close();
			}
			else if(this.service == 1){
				this.app.destroy();
			}
		}

		this.connect_DISCORD = function () {
			this.app = new Discord.Client();

			this.app.on('ready', () => {
				console.log(`Logged in as ${client.user.tag}!`);
			});

			this.app.on('message', botResponse.bind(this));

			function botResponse(msg) {
				if(!msg.author.bot && msg.isMemberMentioned(this.app.user)) {
					this.brain.reply(msg.author.discriminator, msg.content).then(sendResponse.bind(this));
					function sendResponse(botMsg) {
						msg.reply(botMsg);
					}	
				}
			}

			this.app.login(this.token);
		}


		this.loading_error = function (error, filename, lineno) {
			console.log("Error when loading files: " + error);
		}


		this.changeBrain = function (brain) {
			this.brain = new RiveScript();
			this.brain.loadFile('./cerveaux/'+brain).then(this.loading_done).catch(this.loading_error);
		}


		this.addBrain = function (brain) {
			this.brain.loadFile('./cerveaux/'+brain).then(this.loading_done).catch(this.loading_error);
		}


		this.changeService = function (service,token) {
			this.stopListen();
			this.service = service;
			this.token = token;
			this.connectToService();
		}


		if(brain) {
			this.brain.loadFile('./cerveaux/'+brain).then(this.loading_done.bind(this)).catch(this.loading_error);
		} else {
			this.brain.loadDirectory("./cerveaux").then(this.loading_done.bind(this)).catch(this.loading_error);
		}
	}
}


/* test */
//var bot = new Bot(0, 3001, undefined);
//var bot = new Bot(1, 'NTc5Mjg4NDc0OTY0ODUyNzM3.XN__wg.5dkZA5O3uMyDbBySY0co-KljaIg', 'Botounet.rive');


module.exports = Bot;
