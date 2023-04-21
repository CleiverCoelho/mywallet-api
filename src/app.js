import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';
import {v4 as uuid} from "uuid"
import dayjs from 'dayjs';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
	console.log('MongoDB Connected!');
} catch (err) {
  console.log(err.message);
}

const db = mongoClient.db();

const app = express();
app.use(express.json());

/* Products Routes */
app.post('/cadastro', async (req, res) => {
  
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
});

app.post('/', async (req, res) => {
  
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
      console.log(existeEmail.senha);
      
      // comparar senha inserida pelo usuario a senha criptografada no db
      const senhaValida = bcrypt.compareSync(senha, existeEmail.senha); 
      if(!senhaValida) return res.status(401).send("senha incorreta");
      
       // cria um nova sessao ativa com um novo tokeno do usuario cadastrado
       const usuarioCadastrado = await db.collection('usuarios').findOne({email});
       const token = uuid();
       const novaSessao = {
         idUsuario: usuarioCadastrado._id,
         token
       }
       await db.collection('sessoes').insertOne(novaSessao);

      res.status(200).send(`token do cadastro: ${token}\n do usuario ${existeEmail.nome}`);

  } catch (error) {
      
      console.error(error);
      res.sendStatus(500);
  }
});


app.post('/nova-transacao/:tipo', async (req, res) => {

    // const userToken = req.headers.authorization;
    // para integrar com o front
    const userToken = req.headers.authorization?.replace("Bearer ", "");
    const {descricao, valor} = req.body;
    const {tipo} = req.params;

    const existeToken = await db.collection('sessoes').findOne({token: userToken})
    if(!existeToken) return res.status(401).send('usuario nao pode fazer requisicao')

    const usuario = existeToken.idUsuario;

    const useSchemaParametros = joi.object({
      userToken: joi.string().required(),
      valor: joi.number().precision(2).required(),
      tipo: joi.string().required(),
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

      await db.collection('transacoes').insertOne(transacaoDB)
      res.status(200).send("transacao feita com sucesso")
      
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

// app.post('/messages', async (req, res) => {
//   const message = req.body;
//   const {to, text, type} = req.body;

//   let from;

//   if(req.headers.user === undefined){
//     from = req.headers.User
//   }else{
//     from = req.headers.user
//   }

//   const userSchema = joi.object({
//     to: joi.string().required(),
//     text: joi.string().required(),
//     type: joi.string().valid("message", "private_message").required()
//   })

//   const validacao = userSchema.validate(message, {abortEarly: false})
//   if (validacao.error) {
//     const errors = validacao.error.details.map((detail) => detail.message);
//     return res.status(422).send(errors);
//   }
//   const novaMensagem = {
//     from,
//     to, 
//     text,
//     type,
//     time: dayjs().format('HH:mm:ss')
//   }

//   try {

//     const usuarioOnline = await db.collection('participants').findOne({name: from})
//     console.log(usuarioOnline)
//     if(!usuarioOnline) return res.sendStatus(422)

//     await db.collection("messages").insertOne(novaMensagem)
//     console.log("mensagem enviada com sucesso");
//     res.sendStatus(201);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// app.post('/status', async (req, res) => {
//   const user = req.headers.user

//   const userSchema = joi.object({
//     user: joi.string().required()
//   })

//   // validacao de user usando joi
//   const validacao = userSchema.validate({user}, {abortEarly: false})
//   if(validacao.error) {
//     return res.status(404).send(validacao.error.details);
//   }

//   // verificar se o usuario consta na lista atual de participants
//   const existeNome = await db.collection('participants').findOne({name: user});
//   // se nao existir retorna nulo e nao entra no if
//   if(!existeNome) return res.status(404).send("usuario nao existe");

//   try {

//     const atualizacao = await db.collection('participants').updateOne(
//       {name: user}, 
//       {$set: {lastStatus: Date.now()}}
//     )
//     if(atualizacao.modifiedCount === 0) return res.status(404).send("nao foi possivel atualizar status")

//     res.status(200).send("last status atualizado com sucesso")
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// app.delete('/messages/:id', async (req, res) => {
//   const idMessage = req.params.id;
//   const user = req.headers.user

//   // procura por mensagem na db
//   const existeMensagem = await db.collection("messages").findOne({_id: new ObjectId(idMessage)})
//   console.log(existeMensagem)
//   if(!existeMensagem) return res.status(404).send("Mensagem nao existe")

//   // verifica se a requisicao foi feita pelo dono da mensagem
//   if(user !== existeMensagem.from) return res.status(401).send("usuario nao pode deletar mensagem");
//   try {

//     await db.collection('messages').deleteOne({ _id: new ObjectId(idMessage) })
//     res.status(200).send("mensagem deletada com sucesso");
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });


// app.put('/messages/:id', async (req, res) => {
//   const idMessage = req.params.id;
//   const user = req.headers.user;
//   const {to, text, type} = req.body;
  
//   const useSchema = joi.object({
//     to: joi.string().required(),
//     text: joi.string().required(),
//     type: joi.string().valid("message", "private_message").required()
//   })

//   const validacao = useSchema.validate(req.body, {abortEarly: false});

//   if(validacao.error){
//     return res.status(422).send(validacao.error.details);  
//   }

//   const existeMensagem = await db.collection("messages").findOne({_id: new ObjectId(idMessage)})
//   console.log(existeMensagem)
//   if(!existeMensagem) return res.status(404).send("Mensagem nao existe")

//   if(user !== existeMensagem.from) return res.status(401).send("usuario nao pode editar mensagem");

//   try {
//     await db.collection("messages").updateOne(
//       {_id: new ObjectId(idMessage)},
//       {$set: {
//         to, text, type
//       }}
//     )

//     res.status(200).send("editado com sucesso")
//   }catch(err){
//     res.status(500).send(err)
//   }
// })

app.listen(5000, () => {
  console.log('Server is litening on port 5000.');
});
