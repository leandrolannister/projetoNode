var app = require('./config/express')();
var cron = require('cron');      

var cronJob = cron.job("* * 6-22 * * 1-5", function(){       
  require('./rotina/jund')(app);
}, null, true, 'America/Sao_Paulo');  

app.listen(3000, function(){
  console.log('Server is runnig');
});



