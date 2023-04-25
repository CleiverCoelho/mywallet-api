import { Router } from "express";
import usuariosRouter from "./usuarios.routes.js";
import transacoesRouter from "./transacoes.routes.js";
import sessoesRouter from "./sessoes.routes.js";

const router = Router()

router.use(usuariosRouter);
router.use(transacoesRouter);
router.use(sessoesRouter);

export default router