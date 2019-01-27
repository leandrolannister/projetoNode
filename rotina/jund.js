module.exports = function(app){
  gravarLogExecucao(app);
}

function gravarLogExecucao(app){    
  let connection = app.infra.servicosConnection();
  let logsDAO = new app.dao.LogsDAO(connection);           	    

  limpaLog(connection, logsDAO);

  logsDAO.gravaLogExec(servico(), function(erro, resultado){     
    if(erro){
      console.log('Erro->NovaDuque->jund:' +erro);      	
      return;
    }       
    console.log('Gravando logs de execução id: ' + resultado.insertId);     
    require('../servicos/jundSoft')(app, resultado.insertId);        
  });  
  connection.end();  
}  

function limpaLog(connection, logsDAO){
  logsDAO.limpaLog(function(erro, resultado){
    if(erro){
      console.log('Erro->NovaDuque->jund:' +erro);
      return;
    }    
  });  
}

function servico(){
  let data = new Date();

  let servico = {
    'servico': 'novaDuque->Jund',
  	'data': data,
  	'inicio': data.getHours()+':'+data.getMinutes()+":"+data.getSeconds(),
  	'status': 'Executando'
  }	

  return servico;
}



