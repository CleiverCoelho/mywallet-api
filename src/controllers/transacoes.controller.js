import { db } from "../app.js";
import joi from 'joi';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';


export async function realizarTransacao(req, res) {

    // const userToken = req.headers.authorization;
    // para integrar com o front
    const userToken = req.headers.authorization?.replace("Bearer ", "");
    const {descricao, valor} = req.body;
    const {tipo} = req.params;
  
    const existeToken = await db.collection('sessoes').findOne({token: userToken});
    if(!existeToken) return res.status(401).send('usuario nao pode fazer requisicao');
  
    const usuario = existeToken.idUsuario;
  
    const useSchemaParametros = joi.object({
      userToken: joi.string().required(),
      valor: joi.number().precision(2).required(),
      tipo: joi.string().valid("entrada", "saida").required(),
      descricao: joi.string().required()
    });
  
    const validaRequisicao = useSchemaParametros.validate({userToken, descricao, tipo, valor});
    if(validaRequisicao.error) {
      const errors = validaRequisicao.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }
  
    try {
      const dia = dayjs().format('DD/MM')
      const transacaoDB = {descricao, tipo, valor, usuario, dia}
  
      await db.collection('transacoes').insertOne(transacaoDB);
      res.status(200).send('transacao feita com sucesso');
      
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
}
  
export async function pegarTransacoes(req, res) {

    const userToken = req.headers.authorization?.replace("Bearer ", "");
    const validaToken = await db.collection('sessoes').findOne({token: userToken});
    if(!validaToken) return res.status(401).send("token invalido");

    try {
        const transacoes = await db.collection('transacoes').find({usuario: validaToken.idUsuario}).toArray();

        res.send(transacoes);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export async function deletarTransacao(req, res) {

    const idTransacao = req.params.id;
    const tokenUser = req.headers.authorization?.replace("Bearer ", "");
  
    // procura por mensagem na db
    const existeTransacao = await db.collection('transacoes').findOne({_id: new ObjectId(idTransacao)})
    console.log(existeTransacao);
    if(!existeTransacao) return res.status(404).send("Transacao nao existe");
  
    console.log(existeTransacao);
  
    const idUser = await db.collection('sessoes').findOne({token: tokenUser});
  
  
    // console.log(idUser.idUsuario);
    // console.log("\n");
    // console.log(existeTransacao.usuario)
  
    // verifica se a requisicao foi feita pelo dono da mensagem
    if(!idUser.idUsuario.equals(existeTransacao.usuario)) return res.status(401).send("usuario nao pode deletar mensagem");
    try {
  
      await db.collection('transacoes').deleteOne({ _id: new ObjectId(idTransacao) })
      res.status(200).send("transacao deletada com sucesso");
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
}