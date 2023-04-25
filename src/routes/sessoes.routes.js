import { pegarSessoes } from '../controllers/sessoes.controller.js';
import { Router } from 'express';

const sessoesRouter = Router();

sessoesRouter.get('/sessoes', pegarSessoes);

export default sessoesRouter;