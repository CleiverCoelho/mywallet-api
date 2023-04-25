import { deletarTransacao, pegarTransacoes, realizarTransacao } from '../controllers/transacoes.controller.js';
import { Router } from 'express';

const transacoesRouter = Router();

transacoesRouter.post('/nova-transacao/:tipo', realizarTransacao);

transacoesRouter.get('/home', pegarTransacoes);

transacoesRouter.delete('/transacoes/:id', deletarTransacao);


export default transacoesRouter;