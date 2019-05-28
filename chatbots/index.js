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


app.get('/allBots', cors(corsOptions), function(req, res){
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

/*
Add a bot given his name, the service on which he can speaks and the associated token, and his brain
*/
app.post('/bot', cors(corsOptions),function(req, res) {
	var bot = new Bot(req.body.name, req.body.service, req.body.token, req.body.brain);
	chatbots.push(bot);
	var service = [];
	for(i = 0; i <= numberOfServices; i++){
		if(i == req.body.service){
			service.push({service : i, token : req.body.token, active : true});
		}
		else{
			service.push({service : i, token : 0, active : false});
		}
	}
	chatbotsDescriptor.push({"name" : req.body.name, "services" : service, "brains" : [req.body.brain]});
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

app.delete('/bot/:nomBot', cors(corsOptions), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			chatbots[i].stopListen(-1);
			chatbots.splice(i,1);
			chatbotsDescriptor.splice(i,1);
		}
	}
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

app.put('/bot/:nomBot', cors(corsOptions), function(req, res){
	//var bot = new Bot(req.body.name, req.body.service, req.body.token, req.body.brain);
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
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
	res.json(chatbotsDescriptor);
});

app.put('/bot/:nomBot/service', cors(corsOptions), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			console.log((chatbotsDescriptor[i].services).hasOwnProperty(req.body.service));
			if((chatbotsDescriptor[i].services).hasOwnProperty(req.body.service)){
				if((chatbots[i].app[req.body.service]).token != req.body.token ){
					chatbots[i].changeService(req.body.service, req.body.token);
				}
			}
			else{
				chatbots[i].app[req.body.service].active = true;
				(chatbots[i].app[req.body.service]).token = req.body.token;
			}
		}
	}
});

app.delete('bot/:nomBot/service', cors(corsOptions), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			chatbots[i].stopListen(req.body.service);
		}
	}
});

app.put('/bot/:nomBot/brain', cors(corsOptions), function(req, res){
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			chatbots[i].addBrain(req.body.brain);
			chatbotsDescriptor[i].brain.push(req.body.brain);
		}
	}
});

app.listen(port, () => console.log(`listening index`));
