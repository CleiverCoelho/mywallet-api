import { realizarCadastro, realizarLogin, realizarLogout } from '../controllers/usuarios.controller.js';
import { Router } from 'express';

const usuariosRouter = Router();


usuariosRouter.post('/cadastro', realizarCadastro);

usuariosRouter.post('/', realizarLogin);

usuariosRouter.post('/home', realizarLogout);

export default usuariosRouter;