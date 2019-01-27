function LogExecucao(app){
  this._app = app;    
}

LogExecucao.prototype.atualizaStatus = function(servico){
  let connection = this._app.infra.servicosConnection();  
  let logsDAO = new this._app.dao.LogsDAO(connection);

  logsDAO.atualizaStatus(servico, function(erro, retorno){
    //Tratar log erro
    if(erro){
      console.log('Rotina->logsDAO->verPedidoAtualizado'+ erro); 
      return; 
    }  
    console.log('Atualiza logsExecução');        
  });    
  connection.end();
};


module.exports = function(){
  return LogExecucao;	  
}