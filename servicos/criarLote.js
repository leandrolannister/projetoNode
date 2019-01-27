module.exports = function(app){  
  verificaLote(app);
}  

function verificaLote(app){
  let connection = app.infra.servicosConnection();  
  let postaisDAO = new app.dao.PostaisDAO(connection);     
  let data = new app.classes.DateHelper;  
  let lote = data.hoje().replace(/[^0-9]/g,'');      
  
  postaisDAO.verificaLote(lote, function(erro, existeLote){ 
    if(erro){     
      console.log('Erro na rotina de verificar lote: '+erro);                          
      return;
    }    
    if(existeLote.length == 0){       
      criarLote(lote, app); 
      return;
    }
  });
  connection.end();
}

function criarLote(lote, app){  
  let connection = app.infra.servicosConnection();  
  let postaisDAO = new app.dao.PostaisDAO(connection);     
  let data = new app.classes.DateHelper;   
  
  let novoLote = {
  	data: data.hoje(),
  	status: 'CRIADO',
  	lote: lote
  }    
  
  postaisDAO.criarLote(novoLote, function(erro, result){
    if(erro){
      console.log('Erro na criação do lote: '+erro);       
      return;	
   }
   console.log('Lote criado com sucesso'); 
   return;   
  });
  connection.end();
}

