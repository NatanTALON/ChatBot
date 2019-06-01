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
var httpRequest;

function handleResponse(evtXHR){
  if (httpRequest.readyState == 4){
    if (httpRequest.status == 200){
		try{
      		response = JSON.parse(httpRequest.responseText);
		}catch(err){
			console.log("invocation.responseText "+httpRequest.responseText);	
		}
    } else {
     	console.error("Invocation Errors Occured " + httpRequest.readyState + " and the status is " + httpRequest.status);
    }
  }
}



/////////////////////////////////////////////////////////

app.get('/', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('GET', 'http://localhost:3000/allBots', false);
	httpRequest.send();
	res.render('home', {botList: response});
});

app.get('/newBot', function(req,res) {
	res.render('newBot');
});

app.get('/modifieBot', function(req,res) {
	res.render('modifieBot', {bot: response});
});


/**
 * voir les détails d'un bot
 */
app.post('/bot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('GET', `http://localhost:3000/bot/${req.body.name}`, false);
	httpRequest.send();
	res.render('bot', {bot: response});
});

/**
 * ajout d'un nouveau bot
 */
app.post('/newBot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let bot = {name: req.body.name, service: req.body.service, token: req.body.token, brain: req.body.brain};
	httpRequest.open('POST', 'http://localhost:3000/bot', true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

/**
 * active un service pour un bot
 */
app.post('/activateService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.botName}/service/${req.body.service}/${req.body.token}`, false);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send({activate: req.body.activate});
	res.redirect('/modifieBot');
});


/**
 * ajoute un service au bot
 */
app.post('/addService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let newService = {service: req.body.service, token: req.body.token};
	let bot = {name: req.body.name, services: response.services.push(newService), brains: response.brains};
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.name}/service`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(newService));
	res.render('modifieBot', {bot});
});

/**
 * supprime un service du bot
 */
app.post('/delService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let delService = {service: req.body.service, token: req.body.token};
	let i = req.body.services.findIndex((elt) => {return service.service == elt.service;});
	let bot = {name: req.body.name, services: response.services.splice(i,1), brains: response.brains};
	httpRequest.open('DELETE', `http://localhost:3000/bot/${req.body.name}/service`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(delService));
	res.render('modifieBot', {bot});
});

/**
 * ajoute un cerveau au bot
 */
app.post('/addBrain', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let newBrain = {brain: req.body.newBrain};
	let bot = {name: req.body.name, services: response.services, brains: response.brains.push(req.body.newBrain)};
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.name}/brain`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(newBrain));
	res.render('modifieBot', {bot});
});

/**
 * détruit un bot
 */
app.post('/deleteBot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('DELETE', `http://localhost:3000/bot/${req.body.name}`, true);
	httpRequest.send();
	res.redirect('/');
});

///////////// launch app //////////////////
app.listen(port, () => console.log(`admin client running on ${port}`));
