function Erro(app){
  this._app = app;  
}

Erro.prototype.gravar = function(log){
  let connection = this._app.infra.servicosConnection();
  let logsDao = new this._app.dao.LogsDAO(connection);

  logsDao.gravarLog(log, function(erro, resultado){
    if(erro){
      console.log('Erro gravar log');
      return; 
    }
    console.log('Gravando tabela logs');      
  });     
}


module.exports = function(){
  return Erro;	  
}