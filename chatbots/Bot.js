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
		this.app = [];
		/*
		[
			{
				active: boolean
				type: services
				service: application
				token: ___
			}
		]
		*/

		/**
		 *	Adding first service on creation
		 */
		switch(service) {
			case services.SMS:
				this.app.push({type: services.SMS, token: token, active: false});
				break;
			case services.DISCORD:
				this.app.push({type: services.DISCORD, token: token, active: false});
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


//////////////////////////////// Getters //////////////////////////////////////////////////////////////
		this.getName = function () {
			return this.name;
		}

		this.getServices = function () {
			return this.app;
		}


/////////////////////////////// Functions used by the brain ///////////////////////////////////////////
		this.loading_done = function () {
			console.log("Bot has finished loading!");
			this.brain.sortReplies();
			this.connectToService(services.ALL, undefined);
		}

		this.loading_error = function (error, filename, lineno) {
			console.log("Error when loading files: " + error);
		}



///////////////////////////// Connection / disconnection functions //////////////////////////////////////////////////

		this.connectToService = function (service, token) {
			switch(service) {
				case services.SMS:
					for (var i = 0; i < this.app.length; i++) {
						if(this.app[i].type == services.SMS && this.app[i].token == token && !this.app[i].active) {
							this.connect_SMS(i);
							this.app[i].active = true;
						}
					}
					break;
				case services.DISCORD:
					for (var i = 0; i < this.app.length; i++) {
						if(this.app[i].type == services.DISCORD && this.app[i].token == token && !this.app[i].active) {
							this.connect_DISCORD(i);
							this.app[i].active = true;
						}
					}
					break;
				case services.ALL:
					for (var i = 0; i < this.app.length; i++) {
						if (!this.app[i].active) {
							if(this.app[i].type == services.SMS) {
								this.connect_SMS(i);
							} else if (this.app[i].type == services.DISCORD) {
								this.connect_DISCORD(i);
							}
							this.app[i].active = true;
						}
					}
					break;
				default:
					console.log(`Error on connection: no such service ${service}`);
			}
		}


		this.connect_SMS = function (indice) {
			this.app[indice].service = express();
			this.app[indice].service.set('view engine', 'ejs');

			this.app[indice].service.use(bodyParser.urlencoded({ extended: false }))
			this.app[indice].service.use(bodyParser.json());

			this.app[indice].service.get('/', function(req, res) {
				res.render('login');
			});

			this.app[indice].service.post('/', postOnHome.bind(this));
			function postOnHome(req,res) {
				let newConv = {userName: req.body.userName, messageList: []};
				this.conversations.push(newConv);
				res.render('conversation', {conv: newConv});
			}

			this.app[indice].service.post('/conv', postOnConv.bind(this));
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

			this.app[indice].server = this.app[indice].service.listen(parseInt(this.app[indice].token,10), () => console.log(`bot listening on ${this.app[indice].token}`));
		}

		this.connect_DISCORD = function (indice) {
			this.app[indice].service = new Discord.Client();

			this.app[indice].service.on('ready', () => {
				console.log(`Logged in as ${this.app[indice].service.user.tag}!`);
			});

			this.app[indice].service.on('message', botResponse.bind(this));

			function botResponse(msg) {
				if(!msg.author.bot && msg.isMemberMentioned(this.app[indice].service.user)) {
					console.log(msg.content);
					this.brain.reply(msg.author.discriminator, msg.content.slice(22)).then(sendResponse.bind(this));
					function sendResponse(botMsg) {
						msg.reply(botMsg);
					}
				}
			}

			this.app[indice].service.login(this.app[indice].token);
		}

		this.stopListen = function(service, token, del){
			let i = 0;
			switch(service) {
				case services.SMS:
					i = 0;
					while (i < this.app.length) {
						if(this.app[i].type == services.SMS && this.app[i].token == token && this.app[i].active) {
							this.app[i].server.close();
							this.app[i].active = false;
							if (del) {
								this.app.splice(i,1);
							}
						}
						i++;
					}
					break;
				case services.DISCORD:
					i = 0;
					while (i < this.app.length) {
						if(this.app[i].type == services.DISCORD && this.app[i].token == token && this.app[i].active) {
							this.app[i].service.destroy();
							this.app[i].active = false;
							if (del) {
								this.app.splice(i,1);
							}
						}
						i++;
					}
					break;
				case services.ALL:
					for (i = 0; i < this.app.length; i++) {
						if (this.app[i].active) {
							if(this.app[i].type == services.SMS) {
								this.app[i].server.close();
							}
							if(this.app[i].type == services.DISCORD) {
								this.app[i].service.destroy();
							}
							this.app[i].active = false;
						}
					}
					if (del) {
						this.app = [];
					}
					break;
				default:
					console.log(`Error on destructor: no such service ${service}`);
			}
		}


////////////////////////////////// Service handler functions /////////////////////////////////////////////////

		this.addService = function (service,token) {
			this.app.push({type: service, token: token});
		}

		this.delService = function (service,token) {
			this.stopListen(service,token,true);
		}


//////////////////////////////// Brain handler functions /////////////////////////////////////////////////////
		this.changeBrain = function (brain) {
			this.stopListen(services.ALL, undefined, false);
			this.brain = new RiveScript();
			this.brain.loadFile('./cerveaux/'+brain).then(this.loading_done.bind(this)).catch(this.loading_error);
		}


		this.addBrain = function (brain) {
			this.stopListen(services.ALL, undefined, false);
			this.brain.loadFile('./cerveaux/'+brain).then(this.loading_done.bind(this)).catch(this.loading_error);
		}



///////////////////////////////// Load brain after construction ////////////////////////////////////////////
		if(brain) {
			this.brain.loadFile(['./cerveaux/begin.rive','./cerveaux/'+brain]).then(this.loading_done.bind(this)).catch(this.loading_error);
		} else {
			this.brain.loadDirectory(['./cerveaux/begin.rive','./cerveaux/dumbSteeve.rive']).then(this.loading_done.bind(this)).catch(this.loading_error);
		}
	}
}


/* test */
//var bot = new Bot('Botounet', 0, 3001, 'standard.rive');
//var bot = new Bot('Botounet', 1, 'NTc5Mjg4NDc0OTY0ODUyNzM3.XPO7Jw.lCO3Vlef3ciYNMYiMhTGsC-_SlA', 'standard.rive');


module.exports = Bot;
