var http = require('http');

var config = {
  hostname: 'teste.controlepostal.com.br',
  port:'',
  path:'/ws/token/get',  
  method:'post',
  headers:{    
    'Accept': 'application/json',
    'Content-type': 'application/json'    
  }	
}

var request = http.request(config, function(res){        
  res.on('data', function(dados){
    console.log('dados' +dados)
  });  
});

let dadosAcesso = {
  client_id: "allied",
  client_key: "1ba39206-151d-11e9-bfd4-5a3a017e3137"  
}

request.end(JSON.stringify(dadosAcesso));



