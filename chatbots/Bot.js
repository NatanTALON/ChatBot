const express = require('express');
const bodyParser = require('body-parser');
const RiveScript = require('rivescript');
const Discord = require('discord.js');

const services = {
	ALL: -1,
	SMS: 0,
	DISCORD: 1		// https://discordapp.com/oauth2/authorize?client_id=Bot_Client_ID&scope=bot&permissions=2048	clientId for botounet = 579288474964852737
}

class Bot {

	constructor(name, service, token, brain) {
		this.name = name;
		this.brain = new RiveScript({utf8: true});
		this.app = [ {active: false}, {active: false} ];
		/*
		[
			{
				active: boolean
				service: application
				token: ___
			}
		]
		*/
		switch(service) {
			case services.SMS:
				this.app[services.SMS].active = true;
				this.app[services.SMS].token = token;
				break;
			case services.DISCORD:
				this.app[services.DISCORD].active = true;
				this.app[services.DISCORD].token = token;
				break;
			default:
				console.log(`Error on constructor: no such service ${service}`);
		}

		this.conversations = [];

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
			this.connectToService(services.ALL);			
		}


		this.connectToService = function (service) {
			switch(service) {
				case services.SMS:
					if(this.app[services.SMS].active) {
						this.connect_SMS();
					}
					break;
				case services.DISCORD:
					if(this.app[services.DISCORD].active){
						this.connect_DISCORD();
					}
					break;
				case services.ALL:
					if(this.app[services.SMS].active) {
						this.connect_SMS();
					}
					if(this.app[services.DISCORD].active){
						this.connect_DISCORD();
					}
					break;
				default:
					console.log(`Error on connection: no such service ${service}`);
			}
		}


		this.connect_SMS = function () {
			this.app[services.SMS].service = express();
			this.app[services.SMS].service.set('view engine', 'ejs');

			this.app[services.SMS].service.use(bodyParser.urlencoded({ extended: false }))
			this.app[services.SMS].service.use(bodyParser.json());

			this.app[services.SMS].service.get('/', function(req, res) {
				res.render('login');
			});

			this.app[services.SMS].service.post('/', postOnHome.bind(this));
			function postOnHome(req,res) {
				let newConv = {userName: req.body.userName, messageList: []};
				this.conversations.push(newConv);
				res.render('conversation', {conv: newConv});
			}

			this.app[services.SMS].service.post('/conv', postOnConv.bind(this));
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

			this.app[services.SMS].server = this.app[services.SMS].service.listen(parseInt(this.app[services.SMS].token,10), () => console.log(`bot listening on ${this.app[services.SMS].token}`));
		}
		


		this.stopListen = function(service){
			switch(service) {
				case services.SMS:
					if(this.app[services.SMS].active) {
						this.app[services.SMS].server.close();
						this.app[services.SMS].active = false;
					}
					break;
				case services.DISCORD:
					if(this.app[services.DISCORD].active){
						this.app[services.DISCORD].service.destroy();
						this.app[services.DISCORD].active = false;
					}
					break;
				case services.ALL:
					if(this.app[services.SMS].active) {
						this.app[services.SMS].server.close();
						this.app[services.SMS].active = false;
					}
					if(this.app[services.DISCORD].active){
						this.app[services.DISCORD].service.destroy();
						this.app[services.DISCORD].active = false;
					}
					break;
				default:
					console.log(`Error on destructor: no such service ${service}`);
			}
		}

		this.connect_DISCORD = function () {
			this.app[services.DISCORD].service = new Discord.Client();

			this.app[services.DISCORD].service.on('ready', () => {
				console.log(`Logged in as ${this.app[services.DISCORD].service.user.tag}!`);
			});

			this.app[services.DISCORD].service.on('message', botResponse.bind(this));

			function botResponse(msg) {
				if(!msg.author.bot && msg.isMemberMentioned(this.app[services.DISCORD].service.user)) {
					console.log(msg.content);
					this.brain.reply(msg.author.discriminator, msg.content.slice(22)).then(sendResponse.bind(this));
					function sendResponse(botMsg) {
						msg.reply(botMsg);
					}	
				}
			}

			this.app[services.DISCORD].service.login(this.app[services.DISCORD].token);
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
			this.stopListen(service);
			this.app[service].active = true;
			this.app[service].token = token;
			this.connectToService(service);
		}

		if(brain) {
			this.brain.loadFile(['./cerveaux/begin.rive','./cerveaux/'+brain]).then(this.loading_done.bind(this)).catch(this.loading_error);
		} else {
			this.brain.loadDirectory(['./cerveaux/begin.rive','./cerveaux/dumbSteeve.rive']).then(this.loading_done.bind(this)).catch(this.loading_error);
		}
	}
}


/* test */
//var bot = new Bot('Botounet', 0, 3001, 'standard.rive');
//var bot = new Bot('Botounet', 1, 'NTc5Mjg4NDc0OTY0ODUyNzM3.XN__wg.5dkZA5O3uMyDbBySY0co-KljaIg', 'standard.rive');


module.exports = Bot;
