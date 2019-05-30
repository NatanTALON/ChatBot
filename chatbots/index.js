const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Bot = require('./Bot');

const port = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());
const corsOptions = {
	origin: 'http://localhost:8081',
	methods: 'GET,POST,PUT,DELETE',
  	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


var chatbots = [];
//descrition des bots avec un tableau de json
var chatbotsDescriptor = [];
/*
[
	{
		name: string
		services: [ { type: service, token: string, active: boolean } ]
		brains: [ strings ]
	}
]
*/



////////////////////////////////////// GET requests /////////////////////////////////////////////////////////
app.get('/allBots', cors(corsOptions), function(req, res){
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

app.get('/bot/:nomBot', cors(corsOptions), function(req,res){
	let i = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (i != -1) {
		concernedChatBotDescriptor = chatbotsDescriptor[i];
	}
	res.json(concernedChatBotDescriptor);
});



////////////////////////////////// POST requests ///////////////////////////////////////////////////////////
/*
Add a bot given his name, the service on which he can speaks and the associated token, and his brain
*/
app.post('/bot', cors(corsOptions),function(req, res) {
	let i = chatbotsDescriptor.findIndex((elt) => {
		return elt.name == req.body.name;
	});

	if (i == -1) {
		var bot = new Bot(req.body.name, req.body.service, req.body.token, req.body.brain);
		chatbots.push(bot);
		chatbotsDescriptor.push({name: req.body.name, services: [{type: req.body.service, token: req.body.token, active: true}], brains: [req.body.brain]});
		console.log(chatbotsDescriptor);
		res.json(chatbotsDescriptor);
	} else {
		res.json({error: true, msg: "Name already used"});
	}
});

app.post('/bot/:nomBot/service', cors(corsOptions), function(req,res) {
	for(let i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			chatbots[i].addService(req.body.service, req.body.token);
			chatbotsDescriptor[i].services.push({type: req.body.service, token: req.body.token, active: false});
			concernedChatBotDescriptor = chatbotsDescriptor[i];
		}
	}
	res.json(chatbotsDescriptor);
});



////////////////////////////////// DELETE requests ////////////////////////////////////////////////////////

app.delete('/bot/:nomBot', cors(corsOptions), function(req,res){
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
		chatbots[botIndex].stopListen(-1, undefined, true);
		chatbots.splice(botIndex,1);
		chatbotsDescriptor.splice(botIndex,1);
	}
	console.log(chatbotsDescriptor);
	res.json(concernedChatBotDescriptor);
});

app.delete('/bot/:nomBot/service/:service/:token', cors(corsOptions), function(req,res){
	let i = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (i != -1) {
		concernedChatBotDescriptor = chatbotsDescriptor[i];
		chatbots[i].stopListen(parseInt(req.body.service,10), req.body.token, true);
		let j = chatbotsDescriptor[i].findIndex((elt) => {
			return elt.type == req.params.service && elt.token == req.params.token;
		});
		if (j != -1) {
			chatbotsDescriptor[i].services.splice(j,1);
		}
	}
	res.json(concernedChatBotDescriptor);
});



///////////////////////////////// PUT requests //////////////////////////////////////////////////////////

app.put('/bot/:nomBot/service/:service/:token', cors(corsOptions), function(req,res){
	let i = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (i != -1) {
		let j = chatbotsDescriptor[i].services.findIndex((elt) => {
			return elt.type == req.params.service && elt.token == req.params.token;
		});
		if (j != -1) {
			if (req.body.activate == 'on' && !chatbotsDescriptor[i].services[j].active) {
				chatbots[i].connectToService(parseInt(req.params.service,10), req.params.token);
				chatbotsDescriptor[i].services[j].active = true;
			} else if (req.body.activate == 'off' && chatbotsDescriptor[i].services[j].active) {
				chatbots[i].stopListen(parseInt(req.params.service,10), req.params.token, false);
				chatbotsDescriptor[i].services[j].active = false;
			}
			concernedChatBotDescriptor = chatbotsDescriptor[i];
		}
	}
	res.json(concernedChatBotDescriptor);
});


app.put('/bot/:nomBot/brain', cors(corsOptions), function(req, res){
	let i = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (i != -1) {
		if (req.body.action == 'add') {
			chatbots[i].addBrain(req.body.brain);
			chatbotsDescriptor[i].brains.push(req.body.brain);
		} else if (req.body.action == 'change') {
			chatbots[i].changeBrain(req.body.brain);
			chatbotsDescriptor[i].brains = [req.body.brain];
			concernedChatBotDescriptor = chatbotsDescriptor[i];
		}
	}
	res.json(concernedChatBotDescriptor);
});

app.listen(port, () => console.log(`listening index`));
