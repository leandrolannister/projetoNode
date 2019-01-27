function LogsDAO(connection){
  this._connection = connection;
}

LogsDAO.prototype.gravarLog = function(erros, callback){    
  query = "INSERT INTO logs(rotina, mensagem, data) "+     
  "VALUES(?,?,?)";     

  let values = [
    erros['rotina'],
    erros['mensagem'],
    erros['data']
  ];
   
  this._connection.query(query, values, callback);          
}

LogsDAO.prototype.gravaLogExec = function(servico, callback){  
  let query =   
    "INSERT INTO logsExecucao(rotina, data, inicio, status) "+     
    "VALUES(?,?,?,?)";    
  
  let values = [
    servico['servico'],
    servico['data'],
    servico['inicio'],
    servico['status']
  ];  

  this._connection.query(query, values, callback);                       
}

LogsDAO.prototype.limpaLog = function(servico, callback){  
  let query =   
    "DELETE FROM logsexecucao where rotina = 'novaDuque->jund'";         
  
  this._connection.query(query, callback);                       
}

LogsDAO.prototype.atualizaStatus = function(servico, callback){  
  query = "update logsExecucao set status = '"+servico['status']+"', "+
  "erro = '"+servico['erro']+"' where id = "+servico['id'];     

  this._connection.query(query, callback);                       
}

LogsDAO.prototype.consulta = function(servico, callback){    
  query = "SELECT status, data, inicio, fim, erro "+
          "FROM logsExecucao "+
          "WHERE rotina = '" +servico['servico']+ "' "+
          "AND data = '"+servico['data']+"' ORDER BY id DESC LIMIT 1";     

  this._connection.query(query, callback);                       
}

module.exports = function(){
  return LogsDAO;	
}