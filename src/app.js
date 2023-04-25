import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import transacoesRouter from './routes/transacoes.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import sessoesRouter from './routes/sessoes.routes.js';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
	console.log('MongoDB Connected!');
} catch (err) {
  console.log(err.message);
}

export const db = mongoClient.db();

const app = express();
app.use(cors());
app.use(express.json());
app.use(transacoesRouter);
app.use(usuariosRouter);
app.use(sessoesRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is litening on port ${port}.`);
});
