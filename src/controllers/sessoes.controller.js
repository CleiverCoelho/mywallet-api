import { db } from "../app.js";


export async function pegarSessoes(req, res) {

    try {
      const sessoes = await db.collection('sessoes').find().toArray();
      res.send(sessoes);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }