var http = require('http');
var config = {
  hostname: 'localhost',
  port:'3000',
  path:'/servico/consulta',  
  method:'post',
  headers:{    
    'Accept': 'application/json',
    'Content-type': 'application/json'  
  } 
}

let request = http.request(config, function(res){
  console.log(res.statusCode);  
  res.on('data', function(data){
    console.log('data' +data);
  });  
});

let servico = {
  "servico": 'novaDuque->Jund',
  "data": '2019/1/22'
}

request.end(JSON.stringify(servico));

