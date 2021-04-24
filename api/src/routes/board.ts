import express from "express";

import Board from "../models/Board";
import TodoList from "../models/TodoList";

import { isAuth } from "../middlewares/isAuth";

const routes = express.Router();

routes.post("/", isAuth, async (req: any, res) => {
  const board = await Board.create({
    creatorId: req.userId,
    name: req.body.name,
  });
  await board.save();
  res.send({ board });
});

routes.delete("/", isAuth, async (req: any, res) => {
  const board = await Board.findById(req.body.id);
  if (board && board.creatorId.toString() === req.userId) {
    const promises = [];
    promises.push(Board.findByIdAndDelete(req.body.id));
    promises.push(TodoList.deleteMany({ boardId: board._id }));
    await Promise.all(promises);
    return res.send({ success: true });
  }
  return res.send({ success: false });
});

routes.put("/", isAuth, async (req: any, res) => {
  const board = await Board.findById(req.body._id);
  if (!board) {
    return res.send({ success: false });
  }
  if (board.creatorId.toString() === req.userId) {
    if (req.body.name?.trim?.()) {
      board.name = req.body.name.trim();
    }
    await board.save();
    return res.send({ success: true, board });
  }
  return res.send({ success: false });
});

export default routes;
