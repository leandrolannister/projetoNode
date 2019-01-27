function OiPagoDAO(connection){
  this._connection = connection;
}

OiPagoDAO.prototype.listar = function(data, callback){
  let query = 
  "SELECT tbpedido.Etiqueta AS Etiqueta,"+
  "tbremetentes.reme_razaosocial AS reme_razaosocial,"+
  "tbremetentes.reme_cnpj AS reme_cnpj,"+
  "tbremetentes.reme_cep AS reme_cep,"+
  "tbremetentes.reme_logradouro AS reme_logradouro,"+
  "tbremetentes.reme_numero AS reme_numero,"+
  "tbremetentes.reme_bairro AS reme_bairro,"+
  "tbremetentes.reme_cidade AS reme_cidade,"+
  "tbremetentes.reme_uf AS reme_uf,"+
  "tbpedido.NomeCliente AS NomeCliente,"+
  "tbpedido.CepCliente AS CepCliente,"+
  "tbpedido.EnderecoCliente AS EnderecoCliente,"+
  "tbpedido.NumeroCliente AS NumeroCliente,"+
  "tbpedido.BairroCliente AS BairroCliente,"+
  "tbpedido.MunicipioCliente AS MunicipioCliente,"+
  "tbpedido.EstadoCliente AS EstadoCliente,"+  
  " '' AS Telefone, 0 AS ar,"+
  " tbpedido.Peso AS Peso,"+
  " tbpedido.ValorSeguro AS ValorSeguro,"+
  " CONCAT(tbpedido.NumNFCliente, tbpedido.SerieNFCliente) AS NotaFiscal,"+
  " tbcalculofrete.ValorNotaFiscal AS ValorNotaFiscal,"+
  " '' AS Telefone, 0 AS ar,"+
  " tbpedido.Peso AS Peso,"+
  " tbpedido.ValorSeguro AS ValorSeguro,"+
  " CONCAT(tbpedido.NumNFCliente,"+
  " tbpedido.SerieNFCliente) AS NotaFiscal,"+
  " tbcalculofrete.ValorNotaFiscal AS ValorNotaFiscal,"+
  " (CASE"+
  " WHEN (tbcalculofrete.TipoServico = 1) THEN tbcalculofrete.ValorFreteESedex"+
  " WHEN (tbcalculofrete.TipoServico = 2) THEN tbcalculofrete.ValorFreteSedex"+
  " ELSE '0' END) AS ValorFrete"+  
  
  " FROM ((tbpedido"+
  " JOIN tbremetentes ON ((tbpedido.TipoServicoId = tbremetentes.reme_tipo_servico)))"+
  " JOIN tbcalculofrete ON (((tbcalculofrete.PedId = tbpedido.PedId)"+
  " AND (tbcalculofrete.TipoServico = tbpedido.TipoServicoId))))"+

  " WHERE((tbpedido.TipoServicoId <> 0)"+
  " AND (tbpedido.StatusPedCliente = 11)"+
  " AND (CAST(tbpedido.DtEmissaoCliente AS DATE) >= date (CURDATE() + INTERVAL -(1) MONTH))"+
  " AND (CAST(tbpedido.DtEmissaoCliente AS DATE) < CURDATE())"+
  " AND (LENGTH(tbpedido.Etiqueta) > 0)"+
  " AND (ISNUMERIC(SUBSTR(tbpedido.Etiqueta, 3, 9)) = 1))"+                  
  " AND LENGTH(Etiqueta) > 0"+
  " AND DtEmissaoCliente IS NOT NULL"+
  " AND DATE(DtEmissaoCliente) >= DATE_SUB(?, INTERVAL 1 DAY) limit 5";
  
  this._connection.query(query, data, callback);      
}

OiPagoDAO.prototype.remetente = function(callback){
  let query = 
    "SELECT reme_razaosocial, reme_cnpj, reme_cep, reme_logradouro, reme_numero,"+
    "reme_bairro, reme_cidade, reme_uf"+
    " FROM tbremetentes"+ 
    " WHERE reme_id = 3";    
  
  this._connection.query(query, callback);  
}

module.exports = function(){
  return OiPagoDAO;	
}

