var http = require('http');
var config = {
  hostname: 'rbpsrvsql-hom',
  port:'',
  path:'/frete/api/cotacao/21/04145020/2000.5/0.2/',  
  headers:{
    'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Content-type': 'application/json'  
  } 
}

http.get(config, function(res){
  console.log(http);
  res.on('data', function(frete){
    console.log('frete' +frete);
  })  
});

