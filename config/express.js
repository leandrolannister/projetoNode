var express = require('express');
var load = require('express-load');
var bodyParser = require('body-parser');

module.exports = function(){
  let app = express();
  app.set('view engine', 'ejs');
  app.set('views', './app/views');
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(bodyParser.json());

  load('routes', {cwd:'app'})
  .then('classes')  
  .then('infra') 
  .then('dao') 
  .into(app);

  return app;	
}
