create database servicos;
use servicos;

CREATE TABLE credencias(id int auto_increment primary key,
client_id varchar(20),
client_key varchar(300));

CREATE TABLE erros_importacao(id int auto_increment primary key,
idPostal int(11),
cep varchar(9),
motivo varchar(100),
data datetime);

CREATE TABLE logs(id int auto_increment primary key,
id int(11),
rotina varchar(100),
mensagem varchar(200),
data datetime);

CREATE TABLE lotes(id int auto_increment primary key,
id int(11),
data date,
status varchar(50),
lote varchar(8));

CREATE TABLE lotes(id int auto_increment primary key,
id int(11),
registro varchar(255),
remetente varchar(50),
rem_cpf_cnpj varchar(14),
rem_cep varchar(9),
rem_endereco varchar(100),
rem_numero varchar(6),
rem_bairro varchar(50),
rem_cidade varchar(50),
rem_uf varchar(2),
destinatario varchar(50),
dest_cep varchar(9),
dest_endereco varchar(100),
dest_numero varchar(6),
dest_bairro varchar(50),
dest_cidade varchar(50),
dest_uf varchar(2),
peso decimal(10,2),
valor_postal decimal(12,2),
lote varchar(10),
origem varchar(20),
tot_nota_fiscal double,
empresa varchar(3),
tipo_coleta int(11),
status varchar(10),
dtEnvio datetime);