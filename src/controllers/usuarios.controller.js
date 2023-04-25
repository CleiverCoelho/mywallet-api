import { db } from "../app.js";
import bcrypt from 'bcrypt';
import {v4 as uuid} from "uuid";
import joi from 'joi';


export async function realizarCadastro(req, res){
  
    const {nome, email, senha} = req.body;
  
    // verificacoes com joi
    const useSchemaCadastro = joi.object({
      nome: joi.string().required(),
      email: joi.string().required().email(),
      senha: joi.string().required().min(3),
    })
  
    const validacao = useSchemaCadastro.validate(req.body, {abortEarly: false})
    if (validacao.error) {
      const errors = validacao.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }
    try {
  
        const existeNome = await db.collection('usuarios').findOne({email});
        // se nao existir retorna nulo e nao entra no if
        if(existeNome) return res.status(409).send("usuario ja cadastrado");
        
        // criptografar a senha antes de guardar no db
        const senhaCriptografada = bcrypt.hashSync(senha, 10);
        const novoCadastro = {
          nome,
          email, 
          senha: senhaCriptografada
        }
        // inserir participante com lasStatus incluido no obj
        await db.collection('usuarios').insertOne(novoCadastro);
        res.status(201).send("usuario cadastrado com sucesso")
  
    } catch (error) {
        
        console.error(error);
        res.sendStatus(500);
    }
  }
  
export async function realizarLogin(req, res) {
    
    const {email, senha} = req.body;
  
    // verificacoes com joi
    const useSchemaLogin = joi.object({
      email: joi.string().required().email(),
      senha: joi.string().required(),
    })
  
    const validacao = useSchemaLogin.validate(req.body, {abortEarly: false})
    if (validacao.error) {
      const errors = validacao.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }
    try {
  
        const existeEmail = await db.collection('usuarios').findOne({email});
        // se nao existir retorna nulo e nao entra no if
        if(!existeEmail) return res.status(404).send("email nao cadastrado");
        const nome = existeEmail.nome;
        // comparar senha inserida pelo usuario a senha criptografada no db
        const senhaValida = bcrypt.compareSync(senha, existeEmail.senha); 
        if(!senhaValida) return res.status(401).send("senha incorreta");
        
         // cria um nova sessao ativa com um novo tokeno do usuario cadastrado
         const usuarioCadastrado = await db.collection('usuarios').findOne({email});
         const token = uuid();
         console.log("TOKEN GERADO")
         const novaSessao = {
           idUsuario: usuarioCadastrado._id,
           token
         }
         await db.collection('sessoes').insertOne(novaSessao);
  
        res.status(200).send({token, nome});
  
    } catch (error) {
        
        console.error(error);
        res.sendStatus(500);
    }
}
  
export async function realizarLogout(req, res) {

const userToken = req.headers.authorization?.replace("Bearer ", "");
const validaToken = await db.collection('sessoes').findOne({token: userToken});
if(!validaToken) return res.status(401).send("token invalido");

try {
    const verificacao = await db.collection('sessoes').deleteOne({token: userToken});
    if(!verificacao.deletedCount) return res.status(400).send("falha ao realizar logout")

    res.sendStatus(200);
} catch (error) {
    console.error(error);
    res.sendStatus(500);
}
}