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
		console.log(response);
		}catch(err){
			console.log("invocation.responseText "+httpRequest.responseText);	
		}
    } else {
     	console.error("Invocation Errors Occured " + httpRequest.readyState + " and the status is " + httpRequest.status);
    }
  } else {
    console.log("currently the application is at" + httpRequest.readyState);
  }
}



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
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('GET', 'http://localhost:3000/allBots', false);
console.log("request opened "+httpRequest.status);
	httpRequest.send();
console.log("request sent "+httpRequest.status);
	res.render('allBots', {botList: response});
});


app.post('/bot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('GET', `http://localhost:3000/bot/${req.body.name}`, false);
	httpRequest.send();
	res.render('bot', {bot: response});
});

app.post('/newBot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let bot = {name: req.body.name, service: parseInt(req.body.service, 10), token: req.body.token, brain: req.body.brain};
	httpRequest.open('POST', 'http://localhost:3000/bot', true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

app.post('/modifieBot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	let bot = {name: req.body.name, service: parseInt(req.body.service, 10), token: req.body.token, brain: req.body.brain};
	httpRequest.open('PUT', `http://localhost:3000/bot/${req.body.id}`, true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');
	httpRequest.send(JSON.stringify(bot));
	res.redirect('/');
});

app.post('/deleteBot', function(req,res) {
	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open('DELETE', `http://localhost:3000/bot/${req.body.name}`, true);
	httpRequest.send();
	res.redirect('/');
});

///////////// launch app //////////////////
app.listen(port, () => console.log(`admin client running on ${port}`));
