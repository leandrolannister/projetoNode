function DateHelper(){
  
}

DateHelper.prototype.hoje = function(){
  let today = new Date();	
  return today.toLocaleDateString();       
}

DateHelper.prototype.converter = function(data){
  let d = data.split('-');
  let novaData = d[2]+'/'+d[1]+'/'+d[0];
  return novaData;
}

module.exports = function(tipo){
  return DateHelper;	  
}