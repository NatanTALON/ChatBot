const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Bot = require('./Bot');

const port = 3000;

const app = express();

const numberOfServices = 2;

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
	for(i =0; i< chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
		}
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
	for(i = 0; i < chatbots.length; i++){
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
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
			chatbots[i].stopListen(-1, undefined, true);
			chatbots.splice(i,1);
			chatbotsDescriptor.splice(i,1);
		}
	}
	console.log(chatbotsDescriptor);
	res.json(concernedChatBotDescriptor);
});

app.delete('/bot/:nomBot/service', cors(corsOptions), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
			chatbots[i].stopListen(req.body.service, req.body.token, true);
		}
	}
	res.json(concernedChatBotDescriptor);
});



///////////////////////////////// PUT requests //////////////////////////////////////////////////////////

app.put('/bot/:nomBot', cors(corsOptions), function(req, res){
	//var bot = new Bot(req.body.name, req.body.service, req.body.token, req.body.brain);
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
			if(chatbots[i].name != req.body.name){
				chatbots[i].name = req.body.name;
				chatbotsDescriptor[i].name = req.body.name;
			}
			if(chatbots[i].services != req.body.service || chatbots[i].token != req.body.token){
				chatbots[i].changeService(req.body.service, req.body.token);
				chatbotsDescriptor[i].services = [{service : req.body.service, token :req.body.token}];
			}
			if(!(chatbotsDescriptor[i].brains).includes(req.body.brain)){
				chatbots[i].changeBrain(req.body.brain);
				chatbotsDescriptor[i].brain = [req.body.brain];
			}
		}
	}
	res.json(concernedChatBotDescriptor);
});

app.put('/bot/:nomBot/service', cors(corsOptions), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
			chatbots[i].changeService(req.body.service, req.body.token);
			(chatbotsDescriptor[i].services)[i].active = true;
			(chatbotsDescriptor[i].services)[i].token = req.body.token;
		}
	}
	res.json(concernedChatBotDescriptor);
});


app.put('/bot/:nomBot/brain', cors(corsOptions), function(req, res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			concernedChatBotDescriptor = chatbotsDescriptor[i];
			chatbots[i].addBrain(req.body.brain);
			chatbotsDescriptor[i].brain.push(req.body.brain);
		}
	}
	res.json(concernedChatBotDescriptor);
});

app.listen(port, () => console.log(`listening index`));
