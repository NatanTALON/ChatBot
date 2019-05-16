/////////////////// require needed middlewares /////////////////////
const bodyParser = require('body-parser');
const express = require('express');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


////////// configure app to use express on port 8081///////////////
const app = express();
const port = 8081;

///////////// select view engine /////////////////////////
app.set('view engine', 'ejs');

/////////////// tell express to use middlewares ///////////////
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


/////////////////////////////////////////////////////////

var response;
const httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
	if (httpRequest.readyState === 4) {
		if (httpRequest.status == 200) {
			response = JSON.parse(httpRequest.responseText);
		} else {
			console.log("Erreur " + httpRequest.status);
		}
	}
};

/////////////////////////////////////////////////////////

app.get('/', function(req,res) {
	res.render('home');
});

app.get('/newBot', function(req,res) {
	res.render('newBot');
});

app.get('/modifieBot', function(req,res) {
	res.render('modifieBot', {bot: response});
});

app.get('/allBots', function(req,res) {
	httpRequest.open('GET', 'http://localhost:3000/allBots', false);
	httpRequest.send();
	res.render('allBots', {botList: response});
});


app.post('/bot', function(req,res) {
	httpRequest.open('GET', `http://localhost:3000/bot/${req.body.name}`, false);
	httpRequest.send();
	res.render('bot', {bot: response});
});

app.post('/newBot', function(req,res) {
	let bot = {name: req.body.name, connections: req.body.connections, brain: req.body.brain};
	httpRequest.open('POST', 'http://localhost:3000/bot', true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

app.post('/modifieBot', function(req,res) {
	let bot = {name: req.body.name, connections: req.body.connections, brain: req.body.brain};
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.id}`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

app.post('/deleteBot', function(req,res) {
	httpRequest.open('PUT', `http://localhost:3000/bot/${bot.name}`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

///////////// launch app //////////////////
app.listen(port, () => console.log(`admin client running on ${port}`));
