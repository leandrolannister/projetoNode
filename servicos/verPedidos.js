var http = require('http');

module.exports = function(app, idLog){    
  remetente(app, idLog);            
}  

function remetente(app, idLog){
  let connectionOiPago = app.infra.oiPagoConnection();    
  let oiPagoDao = new app.dao.OiPagoDAO(connectionOiPago);      

  let logErros = new app.classes.Erro(app);
  let logExecucao = new app.classes.LogExecucao(app);

  oiPagoDao.remetente(function(erro, remetente){    
    if(erro){      
      let servico = {
        'status': 'Parado',
        'id': idLog,
        'erro': 'rotina verPedidos->remetente'

      }       
      logExecucao.atualizaStatus(servico);
      return;     
      
   }else{    
    //listar(app, remetente);             
   } 
  }); 
}

function listar(app, remetente){    
  let connection = app.infra.verPedidosConnection();
  let verPedidosDao = new app.dao.VerPedidosDAO(connection);   
  let data = new app.classes.DateHelper;      
  let logErros = new app.classes.Erro(app);

  verPedidosDao.listar("2012-10-25", function(erro, registros){     
    if(erro){  
      let log = {
        'rotina': 'verPedidos->Listar',
        'mensagem': erro['sqlMessage'],        
        'data': new Date()
      }
      
      logErros.gravar(log); 
      return;

    }else if(registros.length == 0){      
      let log = {
        'rotina': 'verPedidos->Listar',
        'mensagem': 'Sem registro parra importação',        
        'data': new Date()
      }      
      logErros.gravar(log);       
      return;
    }         
    
    remetente[0]['reme_cnpj'] = remetente[0]['reme_cnpj'].replace(/[.,/,-]/g, '');      
    remetente[0]['reme_cep'] = remetente[0]['reme_cep'].replace(/[-]/g, '');

    //Grava lote do dia
    registros.length > 0 ? require('./criarLote')(app) : '';
    
    gravar(app, registros, remetente);                
  });
  connection.end();  
}  

function gravar(app, postais, remetente){  
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);           
  let data = new app.classes.DateHelper;   
  let logErros = new app.classes.Erro(app); 
   
  postais.forEach(function(p){        
    p.dest_numero = '0';
    p.lote = data.hoje().replace(/[^0-9]/g,''); 
    p.valor_postal = 0.00;
    p.origem = 'verPedidos'; 
    p.empresa = "21";  
    p.status = 'CRIADO';    
    p.CEP = p.CEP.replace(/[-]/g, '');        
    
    //Desativa E-Sedex
    p.COLETA == 1 ? p.COLETA = 2 : '';        

    postaisDAO.incluirVerPedido(p, remetente, function(erro, postais){
      if(erro){
        let log = {
          'rotina': 'verPedidos->incluirVerPedido',
          'mensagem': erro['sqlMessage'],        
          'data': new Date()
        }
        
        logErros.gravar(log); 
        return;
      }      
      console.log('Importando o registro: [verPedidos]'+ postais.insertId);      
      listarParaCalculoFrete(app, postais.insertId)
    });
  });
  connection.end();      
}

function listarParaCalculoFrete(app, idPostal){  
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);             
  let logErros = new app.classes.Erro(app);

  postaisDAO.listarParaCalculoFrete(idPostal, function(erro, postais){
    if(erro){
      let log = {
        'rotina': 'verPedidos->listarParaCalculoFrete',
        'mensagem': erro['sqlMessage'],        
        'data': new Date()
      }
      
      logErros.gravar(log); 
      return;
    }     
    chamadaParaApi(app, postais);                    
  });
  connection.end();   
}

function chamadaParaApi(app, postais){ 
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection); 
  let logErros = new app.classes.Erro(app);         

  let config = {
    hostname: 'rbpsrvsql-hom',
    port:'',
    path:'',  
    headers:{
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'Content-type': 'application/html',
    } 
  }     
  
  postais.forEach(function(p){       
    config['path'] = 
      '/frete/api/cotacao/'+p['empresa']+'/'+p['cep']+'/'+
      p['tot_nota_fiscal']+'/'+p['peso']+'/';        

    http.get(config, function(res){                                    
      if(res.statusCode == 200){
        res.on('data', function(dadosRest){                
          obtemValorFrete(''+dadosRest, p, app, res.statusCode);          
        });     
      }else{ 
        res.on('data', function(msgErro){                              
          p.motivo = ''+msgErro;   
          p.status = "ERRO";            
          p.data = new Date();                 
          
          postaisDAO.gravaErroImportacao(p, function(erro, resultado){
            if(erro){              
              let log = {
                'rotina': 'verPedidos->gravaReenvio',
                'mensagem': erro['sqlMessage'],        
                'data': new Date()
              }                    
              logErros.gravar(log); 
              return;                       
            }  
          });   

          postaisDAO.atualizaStatus(p, function(erro, resultado){            
            if(erro){              
              let log = {
                'rotina': 'verPedidos->atualizaStatus',
                'mensagem': erro['sqlMessage'],        
                'data': new Date()
              }                    
              logErros.gravar(log); 
              return;                       
            }  
          });         
          connection.end();    
        });
      }  
    });    
  });    
}

function obtemValorFrete(dadosRest, postais, app, statusCode){  
  let dados = JSON.parse(dadosRest);    
  let coleta = traducaoColeta(postais['tipo_coleta']); 
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);              
  let logErros = new app.classes.Erro(app);

  dados['Cotacoes'].forEach(function(d){            
    if(d['TipoServico'] == coleta){                        
      postaisDAO.gravaFrete(postais['id'], d['Valor'], function(erro, resultado){
        if(erro){          
          let log = {
            'rotina': 'verPedidos->gravarFrete',
            'mensagem': erro['sqlMessage'],        
            'data': new Date()
          }          
          logErros.gravar(log); 
          return;
        }              
      });    
      connection.end();      
    }
  });    
}

function traducaoColeta(tipo_coleta){
  let coleta;

  switch(tipo_coleta){
    case 0:
      coleta = 3;//Remessa Expressa
    break;    

    case 2:
      coleta = 1;//Sedex
    break;  
  }
  return coleta;
}