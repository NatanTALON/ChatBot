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
			console.log("Error : invocation.responseText "+httpRequest.responseText);	
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
	console.log("sending GET on allBots");
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
	console.log(`sending GET on bot/${req.body.name}`)
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
	console.log("sending POST on bot");
	res.redirect('/');
});

/**
 * ajoute un service à un bot
 */
app.post('/addService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('POST', `http://localhost:3000/bot/${req.body.botName}/service`, false);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify({service: req.body.service, token: req.body.token}));
	console.log(`sending POST on ${req.body.botName}/service`);
	res.render('modifieBot', {bot: response});
});

/**
 * active un service pour un bot
 */
app.post('/activateService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.botName}/service/${req.body.service}/${req.body.token}`, false);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify({activate: req.body.activate}));
	console.log(`sending PUT on ${req.body.botName}/service/${req.body.service}/${req.body.token}`);
	res.redirect('/modifieBot');
});


/**
 * supprime un service du bot
 */
app.post('/delService', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('DELETE', `http://localhost:3000/bot/${req.body.botName}/service/${req.body.service}/${req.body.token}`, false);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send();
	console.log(`sending DELETE on ${req.body.botName}/service/${req.body.service}/${req.body.token}`);
	res.redirect('modifieBot');
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
	console.log(`sending PUT on ${req.body.name}/brain`);
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
	console.log(`sending DELETE on bot/${req.body.name}`);
	res.redirect('/');
});

///////////// launch app //////////////////
app.listen(port, () => console.log(`admin client running on ${port}`));
