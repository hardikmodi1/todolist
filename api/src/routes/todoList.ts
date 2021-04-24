import express from "express";
import { v4 as uuidv4 } from "uuid";

import TodoList from "../models/TodoList";

import { isAuth } from "../middlewares/isAuth";
import Board from "../models/Board";

const routes = express.Router();

routes.get("/:boardId", isAuth, async (req: any, res: any) => {
  if (req.params.boardId !== "undefined") {
    const board = await Board.findById(req.params.boardId);
    if (!board || board.creatorId.toString() !== req.userId) {
      return res.send({ success: false });
    }
    const todoLists = await TodoList.find({
      _id: { $in: board?.todoLists },
    }).sort({ _id: -1 });
    return res.send({
      success: true,
      todoLists,
      board,
      todoListsIds: board.todoLists,
    });
  } else {
    const boards = await Board.find({ creatorId: req.userId });
    if (boards.length === 0) {
      return res.send({ success: true });
    }
    if (boards[0].creatorId.toString() !== req.userId) {
      return res.send({ success: false });
    }
    const todoLists = await TodoList.find({
      _id: { $in: boards[0].todoLists },
    }).sort({ _id: -1 });
    return res.send({
      success: true,
      todoLists,
      board: boards[0],
      todoListsIds: boards[0].todoLists,
    });
  }
});

routes.post("/", isAuth, async (req: any, res) => {
  const board = await Board.findById(req.body.boardId);
  if (
    req.body.title?.trim?.() &&
    board &&
    board.creatorId.toString() === req.userId
  ) {
    const promises: Array<Promise<any>> = [];
    const todoList = await TodoList.create({
      title: req.body.title,
      boardId: req.body.boardId,
      creatorId: req.userId,
    });

    promises.push(todoList.save());
    if (!board.todoLists) {
      board.todoLists = [];
    }
    board.todoLists.push(todoList._id);
    promises.push(board.save());

    await Promise.all(promises);
    return res.send({ todoList, success: true });
  }
  return res.send({ success: false });
});

routes.post("/todo", isAuth, async (req: any, res: any) => {
  const todoList = await TodoList.findById(req.body.id);
  if (
    todoList &&
    todoList.creatorId.toString() === req.userId &&
    req.body.todo?.trim?.()
  ) {
    const todo = {
      _id: uuidv4(),
      todo: req.body.todo.trim(),
    };
    if (!todoList.todos) {
      todoList.todos = [];
    }
    todoList.todos.push(todo);
    await todoList.save();
    return res.send({ success: true, todo });
  }
  return res.send({ success: false });
});

routes.put("/", isAuth, async (req: any, res) => {
  const todoList = await TodoList.findById(req.body._id);
  if (!todoList) {
    return res.send({ success: false });
  }
  if (todoList.creatorId.toString() === req.userId) {
    if (req.body.title?.trim?.()) {
      todoList.title = req.body.title.trim();
    }
    await todoList.save();
    return res.send({ success: true, todoList });
  }
  return res.send({ success: false });
});

routes.put("/todo", isAuth, async (req: any, res: any) => {
  const todoList = await TodoList.findById(req.body.todoListId);
  if (!todoList || todoList.creatorId.toString() !== req.userId) {
    return res.send({ success: false });
  }
  if (req.body.todo?.trim?.()) {
    const todoIndex = todoList.todos.findIndex(
      (todo) => todo._id == req.body.todoId
    );

    todoList.todos[todoIndex].todo = req.body.todo.trim();
    await todoList.save();
    return res.send({ success: true, todo: req.body.todo.trim() });
  }
  return res.send({ success: false });
});

routes.put("/todo/reorder", isAuth, async (req: any, res: any) => {
  const todoList = await TodoList.findById(req.body.todoListId);
  if (todoList && todoList.creatorId.toString() === req.userId) {
    todoList.todos = req.body.todos;
    await todoList.save();
    return res.send({ success: true, todos: todoList.todos });
  }
  return res.send({ success: false });
});

routes.delete("/", isAuth, async (req: any, res) => {
  const todoList = await TodoList.findById(req.body.id);
  const board = await Board.findById(req.body.boardId);

  if (todoList?.creatorId.toString() === req.userId && board) {
    const promises: Array<any> = [];
    promises.push(TodoList.findByIdAndDelete(req.body.id));
    const indexToDelete = board.todoLists?.indexOf(todoList?._id);
    if (indexToDelete !== undefined && indexToDelete > -1) {
      board.todoLists?.splice(indexToDelete, 1);
    }
    promises.push(board.save());
    await Promise.all(promises);
    return res.send({ success: true });
  }
  return res.send({ success: false });
});

routes.delete("/todo", isAuth, async (req: any, res) => {
  const todoList = await TodoList.findById(req.body.todoListId);

  if (todoList && todoList?.creatorId.toString() === req.userId) {
    const todoIndex = todoList.todos.findIndex(
      (todo) => todo._id == req.body.todoId
    );

    todoList.todos.splice(todoIndex, 1);
    await todoList.save();
    return res.send({ success: true });
  }
  return res.send({ success: false });
});

export default routes;
