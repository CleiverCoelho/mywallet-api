import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
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
// app.post('/participants', async (req, res) => {
  
//     const {name} = req.body;
//     const novoModelo = {name,lastStatus: Date.now()}

//     // verificacoes com joi
//     const useSchema = joi.object({name: joi.string().required()})

//     const validacao = useSchema.validate(req.body);
//     if(validacao.error) return res.status(422).send(validacao.error.details);
    
//     try {

//         const existeNome = await db.collection('participants').findOne({name: req.body.name});
//         // se nao existir retorna nulo e nao entra no if
//         if(existeNome) return res.status(409).send("usuario ja cadastrado");
        
//         // inserir participante com lasStatus incluido no obj
//         await db.collection('participants').insertOne(novoModelo);
        
//         // res.send("Participante adicionado com sucesso")
//         // montar mensagem de post na colleciton mensagem
//         const mensagemEntrou = { 
//             from: name,
//             to: 'Todos',
//             text: 'entra na sala...',
//             type: 'status',
//             time: dayjs().format('HH:mm:ss')
//         }

//         // realizar post na collection mensagem
//         await db.collection('messages').insertOne(mensagemEntrou);
//         res.status(201).send("mensagem e participante criados com sucesso")
//         // res.sendStatus(201);

//     } catch (error) {
        
//         console.error(error);
//         res.sendStatus(500);
//     }
// });

// app.get('/participants', async (req, res) => {

//   try {
//     const participants = await db.collection('participants').find().toArray()
//     if (!participants) {
//       return res.sendStatus(404);
//     }

//     res.send(participants);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// app.get('/messages', async (req, res) => {

//     const {user} = req.headers
//     const {limit} = req.query

//     try {
//       // se nao houver mensagens retorna o array vazio mesmo
//       const messages = await db.collection('messages').find( { $or: [ { to: user }, { to: "Todos" }, {from: user} ] }).toArray()
//       if(messages[0] === null) return res.send([])

//       if(limit !== undefined){
//         // se limite for invalido, retorna erro, senao, continua
//         if(limit <= 0 || (limit !== undefined && isNaN(limit))){
//           return res.status(422).send("limite invalido");
//         }
//         const limitedMessages = []
//         for(let i = messages.length - 1; i > messages.length -1 - limit; i--){
//           if(messages[i] === undefined) {
//             break
//           }
//           limitedMessages.push(messages[i])
//         }
//         return res.status(200).send(limitedMessages);
//       }

//       res.status(200).send(messages)
      
//     } catch (error) {
//       console.error(error);
//       res.sendStatus(500);
//     }
//   });

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
