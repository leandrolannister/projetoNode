var http = require('http');

module.exports = function(app){
  autenticacao(app);
}

function autenticacao(app){   
  
  let logErros = new app.classes.Erro(app);    
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);       

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

  postaisDAO.dadosAcesso(function(erro, clientKey){
    if(erro){      
      let log = {
        'rotina': 'autenticacao->Acesso as credencias',
        'mensagem': 'Erro no acesso as credencias',        
        'data': new Date()
      }                      
      logErros.gravar(log); 
      return;
    }  
    
    let dadosAcesso = {
      client_id: clientKey[0]['client_id'],
      client_key:clientKey[0]['client_key'] 
    }

    var request = http.request(config, function(res){                    
      if(res.statusCode == 200){
        res.on('data', function(result){                                              
          obtemToken(''+result, app);
        });
      }else{      
        let log = {
          'rotina': 'autenticacao->Busca token',
          'mensagem': 'Erro na busca pelo token',        
          'data': new Date()
         }              
        
        logErros.gravar(log); 
        return;      
      }      
    });    
     request.end(JSON.stringify(dadosAcesso));  
  });    
  connection.end();
}

function obtemToken(tokenAcesso, app){
  
  let token = JSON.parse(tokenAcesso);    
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);   
  let logErros = new app.classes.Erro(app);        
  let data = new app.classes.DateHelper;      
  data = data.hoje().replace(/[^0-9]/g,'');  

  if(token['success']){           
    postaisDAO.verificaLoteDoDia(data, function(erro, lote){       
      if(erro){                
        let log = {
          'rotina': 'verificaLoteDoDia->Busca lote',
          'mensagem': 'Não achou o lote do dia', 
          'data': new Date()
        }      
        
        logErros.gravar(log); 
        return;
      }      
      else if(lote.length == 0){        
        let log = {
          'rotina': 'verificaLoteDoDia->Não achou lote',
          'mensagem': 'Não encontrou lote em: ' + data, 
          'data': new Date()
        }
      
        logErros.gravar(log); 
        return;	
      }            
      postaisDAO.numRegistros(function(erro, numRegistros){        
        if(erro){
          let log = {
            'rotina': 'dadosParaEnvio->numero de registros',
            'mensagem': 'não executou a query para envio de dados',        
            'data': new Date()
          }                   
          logErros.gravar(log); 
          return; 
        }        
        if(numRegistros[0]['COUNT(status)'] == 0){
          console.log('Aguardando registros para execução: '+ new Date());  
          return;
        }else{          
          postaisDAO.dadosParaEnvio(function(erro, dados){
            if(erro){              
              let log = {
                'rotina': 'dadosParaEnvio->Envio de dados',
                'mensagem': 'não executou a query para envio de dados',        
                'data': new Date()
             }                   
             logErros.gravar(log); 
             return; 
            }         
            enviaDadosNovaDuque(token, dados, app);        
          });         
        }
      });      
    });        
  }else{    
    let log = {
      'rotina': 'dadosParaEnvio->Token',
      'mensagem': 'Nova Duque não retornou um Token', 
      'data': new Date()
    }      
    logErros.gravar(log); 
    return;
  }	  
}

function enviaDadosNovaDuque(token, dados, app){  

  let logErros = new app.classes.Erro(app);        
  
  let config = {
    hostname: 'teste.controlepostal.com.br',
    port:'',
    path:'/ws/objeto/set'+'/'+token['access_token'],  
    method:'post',         
    headers:{    
      'Accept': 'application/json',
      'Content-type': 'application/json'      
    }	
  }  

  dados.forEach(function(d){ 
    let dadosEnvio = {
      registro: d['registro'],
      remetente: d['remetente'],
      rem_cep: d['rem_cep'],
      destinatario: d['destinatario'],
      dest_cep: d['dest_cep'],            
      rem_cpf_cnpj: d['rem_cpf_cnpj'],      
      rem_endereco: d['rem_endereco'],
      rem_numero: d['rem_numero'],
      rem_bairro: d['rem_bairro'],
      rem_cidade: d['rem_cidade'],
      rem_uf: d['rem_uf'],
      dest_endereco: d['dest_endereco'],
      dest_numero: d['dest_numero'],
      dest_bairro: d['dest_bairro'],
      dest_cidade: d['dest_cidade'],
      dest_uf: d['dest_uf'],
      valor_postal: d['valor_postal']
    }  

    let request = http.request(config, function(res){                                
      if(res.statusCode == 200){
        res.on('data', function(result){                        
          consultaDados(''+result, d['registro'], token['access_token'], app);                
        });
      }else{        
        res.on('data', function(result){
          let retorno = JSON.parse(result);                    
          let log = {
            'rotina': 'enviaDadosNovaDuque->Response',
            'mensagem': 'Nova duque retornou: '+res.statusCode+retorno['error'], 
            'data': new Date()
          }              
          logErros.gravar(log);         
          return;  
        });  
      }            
    });
    request.end(JSON.stringify(dadosEnvio));    
  });    
}

function consultaDados(result, registro, token, app){       
  
  let logErros = new app.classes.Erro(app);  
  let registros = [];
  
  if(result){        
    let config = {
      hostname: 'teste.controlepostal.com.br',
      port:'',
      path:'/ws/objeto/get'+'/'+registro+'/'+token,  
      method:'get',
      connection: 'keep-alive',
      headers:{    
        'Accept': 'application/json',
        'Content-type': 'application/json'          
      } 
    }      
    
    http.get(config, function(res){                    
      if(res.statusCode == 200){
        res.on('data', function(data){                          
          registros.push(data);
        }).on('end', function() {          
          let data   = Buffer.concat(registros);
          let resultado = JSON.parse(data);          
          atualizaRegistro(resultado, app);
        });  
      }else{      
        let log = {
          'rotina': 'ConsultaDados->Response',
          'mensagem': 'Erro na resposta do envio de dados', 
          'data': new Date()
        }      
        logErros.gravar(log);                   
        return;
      }
    });        
  }else{    
    let log = {
      'rotina': 'ConsultaDados->Result',
      'mensagem': 'Erro na resposta para consulta de dados', 
      'data': new Date()
    }              
    
    logErros.gravar(log);         
    return;
  }
}

function atualizaRegistro(resultado, app){   
  let postais = resultado;  
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection); 
  let logErros = new app.classes.Erro(app);    
  
  if(postais['success']){
    let status = 'ENVIADO';
    let registro = resultado['objeto']['registro'];    
    let dtEnvio = new Date();     
    
    postaisDAO.registroEnviado(status, registro, dtEnvio, function(erro, resultado){            
      if(erro){        
        let log = {
          'rotina': 'atualizaRegistro->update em postais',
          'mensagem': "Registro: "+registro+" não foi atualizado", 
          'data': new Date()
        }      

        logErros.gravar(log);                     
        return;
      }
      console.log('Registro: '+registro+' enviado com sucesso');
    });   
    connection.end();
  }  
}


  
