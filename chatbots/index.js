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
	console.log("received GET on allBots");
	res.json(chatbotsDescriptor);
});

app.get('/bot/:nomBot', cors(corsOptions), function(req,res){
	console.log(`received GET on bot/${req.params.nomBot}`);
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
	}
	res.json(concernedChatBotDescriptor);
});



////////////////////////////////// POST requests ///////////////////////////////////////////////////////////
/*
Add a bot given his name, the service on which he can speaks and the associated token, and his brain
*/
app.post('/bot', cors(corsOptions),function(req, res) {
	console.log(`received POST on bot`);
	let botIndex = chatbotsDescriptor.findIndex((elt) => {
		return elt.name == req.body.name;
	});

	if (botIndex == -1) {
		var bot = new Bot(req.body.name, parseInt(req.body.service,10), req.body.token, req.body.brain);
		chatbots.push(bot);
		chatbotsDescriptor.push({name: req.body.name, services: [{type: req.body.service, token: req.body.token, active: true}], brains: [req.body.brain]});
		console.log(chatbotsDescriptor);
		res.json(chatbotsDescriptor);
	} else {
		res.json({error: true, msg: "Name already used"});
	}
});

app.post('/bot/:nomBot/service', cors(corsOptions), function(req,res) {
	console.log(`received POST on bot/${req.params.nomBot}/service`);
	let botIndex = chatbotsDescriptor.findIndex((elt) => {
		return elt.name == req.body.name;
	});
	if(botIndex != -1) {
		chatbots[botIndex].addService(parseInt(req.body.service,10), req.body.token);
		chatbotsDescriptor[botIndex].services.push({type: req.body.service, token: req.body.token, active: false});
		concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
	}
	res.json(concernedChatBotDescriptor);
});



////////////////////////////////// DELETE requests ////////////////////////////////////////////////////////

app.delete('/bot/:nomBot', cors(corsOptions), function(req,res){
	console.log(`received DELETE on bot/${req.params.nomBot}`);
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		chatbots[botIndex].stopListen(-1, undefined, true);
		chatbots.splice(botIndex,1);
		chatbotsDescriptor.splice(botIndex,1);
		concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
	}
	console.log(chatbotsDescriptor);
	res.json(concernedChatBotDescriptor);
});

app.delete('/bot/:nomBot/service/:service/:token', cors(corsOptions), function(req,res){
	console.log(`received DELETE on bot/${req.params.nomBot}/service/${req.params.service}/${req.params.token}`);
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
		chatbots[botIndex].stopListen(parseInt(req.params.service,10), req.params.token, true);
		let serviceIndex = chatbotsDescriptor[botIndex].services.findIndex((elt) => {
			return elt.type == req.params.service && elt.token == req.params.token;
		});
		if (serviceIndex != -1) {
			chatbotsDescriptor[botIndex].services.splice(serviceIndex,1);
		}
	}
	res.json(concernedChatBotDescriptor);
});



///////////////////////////////// PUT requests //////////////////////////////////////////////////////////

app.put('/bot/:nomBot/service/:service/:token', cors(corsOptions), function(req,res){
	console.log(`received PUT on bot/${req.params.nomBot}/service/${req.params.service}/${req.params.token}`);
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		let j = chatbotsDescriptor[botIndex].services.findIndex((elt) => {
			return elt.type == req.params.service && elt.token == req.params.token;
		});
		if (j != -1) {
			if (req.body.activate == 'on' && !chatbotsDescriptor[botIndex].services[j].active) {
				chatbots[botIndex].connectToService(parseInt(req.params.service,10), req.params.token);
				chatbotsDescriptor[botIndex].services[j].active = true;
			} else if (req.body.activate == 'off' && chatbotsDescriptor[botIndex].services[j].active) {
				chatbots[botIndex].stopListen(parseInt(req.params.service,10), req.params.token, false);
				chatbotsDescriptor[botIndex].services[j].active = false;
			}
			concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
		}
	}
	res.json(concernedChatBotDescriptor);
});


app.put('/bot/:nomBot/brain', cors(corsOptions), function(req, res){
	console.log(`received PUT on bot/${req.params.nomBot}/brain`);
	let botIndex = chatbots.findIndex((elt) => {
		return elt.name == req.params.nomBot;
	});
	if (botIndex != -1) {
		if (req.body.action == 'add') {
			chatbots[botIndex].addBrain(req.body.brain);
			chatbotsDescriptor[botIndex].brains.push(req.body.brain);
		} else if (req.body.action == 'change') {
			chatbots[botIndex].changeBrain(req.body.brain);
			chatbotsDescriptor[botIndex].brains = [req.body.brain];
			concernedChatBotDescriptor = chatbotsDescriptor[botIndex];
		}
	}
	res.json(concernedChatBotDescriptor);
});

app.listen(port, () => console.log(`listening index`));
