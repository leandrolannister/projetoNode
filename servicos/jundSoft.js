var sql = require("mssql");

module.exports = function(app, idLog){  
  listar(app, idLog);    
}    

function listar(app, idLog){      
  let connection = app.infra.connectionJund(); 
  let data = new app.classes.DateHelper;    
  let novaData = data.converter(data.hoje()); 
  
  let logErros = new app.classes.Erro(app);  
  let logExecucao = new app.classes.LogExecucao(app);

  var query = "SELECT ISNULL(NR_SEDEX,0) AS NR_SEDEX,"+  
              " ISNULL(RZ_EMPRESA,0) AS RZ_EMPRESA,"+
              " [EMPRESA_CNPJ] AS CNPJ,"+
              " ISNULL(CEP_EMPRESA,0) AS CEP_EMPRESA,"+
              " ISNULL(END_EMPRESA,0) AS END_EMPRESA,"+
              " ISNULL(BAIR_EMPRESA,0) AS BAIR_EMPRESA,"+
              " ISNULL(CIDADE_EMPRESA,0) AS CIDADE_EMPRESA,"+
              " ISNULL(UF_EMPRESA,0) AS UF_EMPRESA,"+
              " ISNULL(NOME_CLIENTE,0) AS NOME_CLIENTE,"+
              " ISNULL([FT01_PESO_BRUTO],0) AS[FT01_PESO_BRUTO],"+
              " ISNULL([FRETE_CALCULADO],0) AS[FRETE_CALCULADO],"+
              " ISNULL([VALOR_TOTAL_NOTA],0) AS[VALOR_TOTAL_NOTA],"+
              " CASE WHEN CEP_ENTREGA_CLIENTE IS NULL THEN CEP_CLIENTE"+
              " ELSE CEP_ENTREGA_CLIENTE END AS CEP_CLIENTE,"+              
              " CASE WHEN END_ENTREGA_CLIENTE IS NULL THEN END_CLIENTE"+
              " ELSE END_ENTREGA_CLIENTE END AS END_CLIENTE,"+              
              " CASE WHEN BAIR_ENTREGA_CLIENTE IS NULL THEN BAIR_CLIENTE"+
              " ELSE BAIR_ENTREGA_CLIENTE END AS BAIRRO_CLIENTE,"+              
              " CASE WHEN CIDADE_ENTREGA_CLIENTE IS NULL THEN CIDADE_CLIENTE"+
              " ELSE CIDADE_ENTREGA_CLIENTE END AS CIDADE_CLIENTE,"+
              " CASE WHEN UF_ENTREGA_CLIENTE IS NULL THEN UF_CLIENTE"+
              " ELSE UF_ENTREGA_CLIENTE END AS UF_CLIENTE"+              
              
              " FROM [V_AL_100] WITH(NOLOCK)"+
              " WHERE DATA_POSTAGEM IS NOT NULL"+
              " AND NR_SEDEX IS NOT NULL"+
              " AND LEN(NR_SEDEX) >0"+ 
              " AND DATA_POSTAGEM >= convert(date, '"+novaData+"', 103)";   
  
  connection.connect(function(erro){    
    var req = new sql.Request(connection);      
    req.query(query, function(erro, dados){
      if(erro){                  
        logExecucao.atualizaStatus(logServico(idLog));         
        return;
      }                         
        
      if(dados['recordsets'].length == 0){
        let log = {
          'rotina': 'listar->jundSoft',
          'mensagem': 'Lista não possui registros',        
          'data': new Date()
        }
        logErros.gravar(log); 
        return; 
      }                
      //Grava lote do dia
      dados['recordsets'].length > 0 ? require('./criarLote')(app) : '';                
      gravar(app, dados['recordsets']);                    
    });    
  });    
}  

function gravar(app, dados){  
  let connection = app.infra.servicosConnection();
  let postaisDAO = new app.dao.PostaisDAO(connection);           
  let data = new app.classes.DateHelper;    
  let logErros = new app.classes.Erro(app);
  
  dados.forEach(function(postais){    
    postais.forEach(function(p){  
      
      p.rem_numero = p['END_EMPRESA'].match(/(\d{4})/g);      
      p.dest_numero = '0';      
      p.lote = data.hoje().replace(/[^0-9]/g,'');
      p.origem = "JundSoft";
      p.empresa = "21";    
      p.status = 'CRIADO';  

      postaisDAO.incluirJund(p, function(erro, postais){
        if(erro){                                                      
          logErros.gravar(logNegocio); 
          return;
        }      
        console.log('Importando o registro: [Jund] '+ postais.insertId);               
      });      
    });          
  });      
  connection.end();    
}  

function logServico(idLog){
  let servico = {
    'status': 'Erro',
    'id': idLog,
    'erro': 'Connection is closed->jundSoft'
 }  
 return servico;
}

function logNegocio(){
  let log = {
    'rotina': 'jundSoft->incluirJund',
    'mensagem': erro['sqlMessage'],        
    'data': new Date()
  }

  return log;
}
