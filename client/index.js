/////////////////// require needed middlewares /////////////////////
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const expressValidator = require('express-validator');

//TODO : amélioration avec l'utilisation de mongoDB via mongoose

////////// configure app to use express on port 3000///////////////
const app = express();
const port = 3000;

///////////// select view engine /////////////////////////
app.set('view engine', 'ejs');






///////////// launch app //////////////////
app.listen(port, () => console.log('version alpha'))

module.exports = app;
