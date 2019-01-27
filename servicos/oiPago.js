module.exports = function(app){    
  listar(app);          
} 

function listar(app){    
  let connection = app.infra.oiPagoConnection();
  let oiPagoDao = new app.dao.OiPagoDAO(connection);   
  let data = new app.classes.DateHelper;    
  let logErros = new app.classes.Erro(app);
  
  oiPagoDao.listar("2018-11-19", function(erro, registros){     
    if(erro){             
      let log = {
        'rotina': 'oiPago->listar',
        'mensagem': erro['sqlMessage'],        
        'data': new Date()
      }
      
      logErros.gravar(log);  
      return; 

    }else if(registros.length == 0){            
      let log = {
        'rotina': 'oiPago->listar',
        'mensagem': 'Oi pago não possui registros',        
        'data': new Date()
      }
      logErros.gravar(log);  
      return;
    }     

    //Grava lote do dia
    registros.length > 0 ? require('./criarLote')(app) : '';    
    gravar(app, registros);                        
  });
  connection.end();  
}  

function gravar(app, postais){    
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);           
  let data = new app.classes.DateHelper;    
  let logErros = new app.classes.Erro(app);
   
  postais.forEach(function(p){            
    p.lote = data.hoje().replace(/[^0-9]/g,'');     
    p.origem = 'oiPago';  
    p.empresa = "21";    
    p.status = "CRIADO"; 
    p.reme_cnpj = p.reme_cnpj.replace(/[.,/,-]/g, '');  
    p.reme_cep = p.reme_cep.replace(/[-]/g, '');       
    
    postaisDAO.incluirOiPago(p, function(erro, postais){
      if(erro){                                        
        let log = {
          'rotina': 'oiPago->incluirOiPago',
          'mensagem': erro['sqlMessage'],        
          'data': new Date()
        }
        
        logErros.gravar(log);
        return; 
      }      
      console.log('Importando o registro: [oiPago]'+ postais.insertId);      
    });    
  });
  connection.end();        
}

