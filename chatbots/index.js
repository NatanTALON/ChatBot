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


app.get('/allBots', cors(corsOptions), function(req, res){
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});


app.post('/bot', cors(corsOptions),function(req, res) {
	var bot = new Bot(req.body.name, req.body.service, req.body.token, req.body.brain);
	chatbots.push(bot);
	chatbotsDescriptor.push({"name" : req.body.name, "service" : req.body.service, "token" : req.body.token, "brain" : req.body.brain });
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
		test = chatbots[i].name == req.params.nomBot;
		if(chatbots[i].name == req.params.nomBot){
			chatbots[i].stopListen();
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
			}
			if(chatbots[i].service != req.body.service || chatbots[i].token != req.body.token){
				chatbots[i].changeService(req.body.service, req.body.token);
			}
			if(chatbots[i].brain != req.body.brain){
				chatbots[i].changeBrain(req.body.brain);
			}
			chatbotsDescriptor.splice(i,1,{"name" : req.body.name, "service" : req.body.service, "token" : req.body.token, "brain" : req.body.brain});
		}
	}
	res.json(chatbotsDescriptor);
});

app.listen(port, () => console.log(`listening index`));
