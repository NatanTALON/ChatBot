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

// le port des bots créés incrémente à chaque bot créé de sorte que chaque bot ait son propre port
var botPort = 3001;
var chatbots = [];
//descrition des bots avec un tableau de json
var chatbotsDescriptor = [];


app.get('/allBots', cors(corsOptions), function(req, res){
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});

app.post('/bot', cors(corsOptions), function(req, res) {
	//incrémentation du numéro de port
	botPort ++;
	var bot = new Bot(req.body.name, req.body.token, req.body.brain);
	chatbots.push(bot);
	chatbotsDescriptor.push({"name" : req.body.name, "token" : req.body.token, "brain" : req.body.brain });
	console.log(chatbotsDescriptor);
	res.json(chatbotsDescriptor);
});


app.delete('/bot/:nomBot', cors(corsOptions), function(req,res){
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

app.put('/bot/:nomBot', cors(corsOptions), function(req, res){
	var bot = new Bot(req.body.nom, req.body.url, botPort, req.body.brain);
	for(i = 0; i < chatbots.length; i++){
		if(chatbots[i].name == req.params.nomBot){
			//TODO : detruire l'autre bot ou faire sorte qu'il arrête de listen(express doc)
			chatbots.splice(i, 1, bot);
			chatbotsDescriptor.splice(i,1,{"name" : req.body.nom, "token" : req.body.token, "brain" : req.body.brain});
		}
	}
	res.json(chatbotsDescriptor);
});

app.listen(port, () => console.log(`listening index`));
