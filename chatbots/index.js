const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Bot = require('./Bot');

const port = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());

// le port des bots créés incrémente à chaque bot créé de sorte que chaque bot ait son propre port
var botPort = 3001;
var chatbots = [];
//descrition des bots avec un tableau de json
var chatbotsDescriptor = [];


app.get('/allBots', cors(), function(req, res){
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

app.post('/bot', function(req, res) {
	//incrémentation du numéro de port
	botPort ++;
	var bot = new Bot(req.body.name, req.body.connection, botPort, req.body.brain);
	chatbots.push(bot);
	chatbotsDescriptor.push({"name" : req.body.name, "connection" : req.body.connection, "port" : botPort, "brain" : req.body.brain });
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});


app.delete('/bot/:nomBot', cors(), function(req,res){
	for(i = 0; i < chatbots.length; i++){
		test = chatbots[i].name == req.params.nomBot;
		if(chatbots[i].name == req.params.nomBot){
			chatbots.splice(i,1);
			chatbotsDescriptor.splice(i,1);
		}
	}
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

app.put('/bot/:nomBot', cors(), function(req, res){
	var bot = new Bot(req.body.nom, req.body.url, req.body.port, req.body.brain);
	for(i = 0; i < chatbots.length; i++){
		if(chatbots.get(i) == req.params.nomBot){
			chatbots.splice(i, 1, bot);
		}
	}
	res.json(chatbotsDescriptor);
});

app.listen(port, () => console.log(`listening index`));
