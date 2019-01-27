function PostaisDAO(connection){
  this._connection = connection;
}

PostaisDAO.prototype.incluirVerPedido = function(postais, remetente, callback){
  let query =   
  "INSERT INTO postais(registro, remetente, rem_cpf_cnpj, rem_cep, rem_endereco,"+ 
  "rem_numero, rem_bairro, rem_cidade, rem_uf, destinatario, dest_cep,"+ 
  "dest_endereco, dest_numero, dest_bairro, dest_cidade, dest_uf, peso,"+
  "valor_postal, lote, origem, tot_nota_fiscal, empresa, tipo_coleta, status)"+
  "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  let values = [
    postais['SEDEX'],
    remetente[0]['reme_razaosocial'],    
    remetente[0]['reme_cnpj'],
    remetente[0]['reme_cep'],
    remetente[0]['reme_logradouro'],
    remetente[0]['reme_numero'],
    remetente[0]['reme_bairro'],
    remetente[0]['reme_cidade'],
    remetente[0]['reme_uf'],
    postais['NOMECLIENTE'],
    postais['CEP'],
    postais['ENDERECO'],   
    postais.dest_numero, 
    postais['BAIRRO'],
    postais['MUNICIPIO'],
    postais['UF'],
    postais['PESO'],
    postais['FRETE_CALCULADO'],
    postais.lote,    
    postais.origem,
    postais['TOTALNOTAFISCAL'],
    postais.empresa,
    postais['COLETA'],
    postais.status
  ];    
  
  this._connection.query(query, values , callback);                  
}

PostaisDAO.prototype.incluirOiPago = function(postais, callback){
  let query =   
  "INSERT INTO postais(registro, remetente, rem_cpf_cnpj, rem_cep, rem_endereco,"+ 
  "rem_numero, rem_bairro, rem_cidade, rem_uf, destinatario, dest_cep,"+ 
  "dest_endereco, dest_numero, dest_bairro, dest_cidade, dest_uf, peso,"+
  "valor_postal, lote, origem, tot_nota_fiscal, empresa, status)"+ 
  "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  
  let values = [
    postais['Etiqueta'],
    postais['reme_razaosocial'],
    postais['reme_cnpj'],
    postais['reme_cep'],
    postais['reme_logradouro'],
    postais['reme_numero'],
    postais['reme_bairro'],
    postais['reme_cidade'],
    postais['reme_uf'],    
    postais['NomeCliente'],
    postais['CepCliente'],
    postais['EnderecoCliente'],
    postais['NumeroCliente'],
    postais['BairroCliente'],
    postais['MunicipioCliente'],
    postais['EstadoCliente'],
    postais['Peso'],
    postais['ValorFrete'],
    postais.lote,    
    postais.origem,
    postais['ValorNotaFiscal'],
    postais.empresa,
    postais.status
  ];

  this._connection.query(query, values , callback);                    
}

PostaisDAO.prototype.incluirJund = function(postais, callback){  

  let query =   
    "INSERT INTO postais(registro,remetente,rem_cpf_cnpj,rem_cep,rem_endereco,"+ 
    "rem_numero,rem_bairro,rem_cidade,rem_uf,destinatario,dest_cep,"+    
    "dest_endereco,dest_numero,dest_bairro,dest_cidade,dest_uf,peso,"+
    "valor_postal,lote,origem,tot_nota_fiscal, empresa, status)"+    
    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";  
  
  let values = [
    postais['NR_SEDEX'],
    postais['RZ_EMPRESA'],
    postais['CNPJ'],
    postais['CEP_EMPRESA'],
    postais['END_EMPRESA'],
    postais.rem_numero,
    postais['BAIR_EMPRESA'],
    postais['CIDADE_EMPRESA'],
    postais['UF_EMPRESA'],    
    postais['NOME_CLIENTE'],
    postais['CEP_CLIENTE'],    
    postais['END_CLIENTE'],
    postais.dest_numero,
    postais['BAIRRO_CLIENTE'],
    postais['CIDADE_CLIENTE'],
    postais['UF_CLIENTE'],
    postais['FT01_PESO_BRUTO'],
    postais['FRETE_CALCULADO'],
    postais.lote,
    postais.origem,
    postais['VALOR_TOTAL_NOTA'],
    postais.empresa,
    postais.status
  ];

  this._connection.query(query, values, callback);                       
}

PostaisDAO.prototype.listarParaCalculoFrete = function(idPostal, callback){  
  query = "SELECT id, empresa, replace(dest_cep, '-', '') as cep,"+
  " tot_nota_fiscal, peso, tipo_coleta "+
  "FROM postais "+
  "WHERE id = ?";
  
  this._connection.query(query, idPostal, callback);        
}

PostaisDAO.prototype.gravaErroImportacao = function(postais, callback){    
  query = "INSERT INTO erros_importacao(idPostal, cep, motivo, data)"+     
    " VALUES(?,?,?,?)"; 

  let values = [
    postais['id'],
    postais['cep'],       
    postais['motivo'],
    postais.data    
  ];  
  
  this._connection.query(query, values, callback);        
}

PostaisDAO.prototype.atualizaStatus = function(postais, callback){
  query = "update postais set status = '"+postais['status']+"' where id = "+postais['id'];   
  
  this._connection.query(query, callback);
}

PostaisDAO.prototype.gravaFrete = function(id, valor, callback){
  query = "update postais set valor_postal = '"+valor+"' where id = "+id; 
  
  this._connection.query(query, callback);
}

PostaisDAO.prototype.verificaLote = function(lote, callback){
  query = "select lote from lotes where lote = ?";
  
  this._connection.query(query, lote, callback);
}

PostaisDAO.prototype.criarLote = function(lotes, callback){
  
  query = "INSERT INTO lotes(data, status, lote)"+
  " VALUES(?,?,?)";   

  let values = [
    lotes['data'],
    lotes['status'],
    lotes['lote']
  ];  
  
  this._connection.query(query, values, callback);    
}

PostaisDAO.prototype.listaLote = function(callback){
  
  query = "SELECT data, lote, status FROM lotes";    
  
  this._connection.query(query, callback);    
}

PostaisDAO.prototype.verificaLoteDoDia = function(lote, callback){  
  query = "SELECT lote FROM lotes where lote = "+lote;          
  this._connection.query(query, callback);    
}

PostaisDAO.prototype.numRegistros = function(callback){  
  query = "SELECT COUNT(status) FROM postais where status = 'CRIADO'";          
  
  this._connection.query(query, callback);    
}

PostaisDAO.prototype.dadosParaEnvio = function(callback){  
  
  let query = "SELECT registro, remetente, rem_cpf_cnpj, rem_cep,"+
  "rem_endereco, rem_numero, rem_bairro, rem_cidade, rem_uf,"+
  "destinatario, dest_cep, dest_endereco, dest_numero, dest_bairro,"+
  "dest_cidade, dest_uf, valor_postal "+
  "FROM postais "+  
  "WHERE status = 'CRIADO' "+
  "AND status != 'ERRO' LIMIT 20";    
  
  this._connection.query(query, callback);  
}

PostaisDAO.prototype.dadosAcesso = function(callback){  
  
  let query = "SELECT client_id, client_key FROM credencias;"  
  
  this._connection.query(query, callback);  
}

PostaisDAO.prototype.registroEnviado = function(status, registro, dtEnvio, callback){
  query = 
    "update postais set status = '"+status+"', dtEnvio = now() "+
    "where registro = '"+registro+"'";     
 
  this._connection.query(query, callback);
}

module.exports = function(){
  return PostaisDAO;	
}

