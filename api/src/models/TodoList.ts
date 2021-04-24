import mongoose, { Schema } from "mongoose";

export interface ITodoList extends mongoose.Document {
  boardId: string;
  creatorId: string;
  title: string;
  todos: Array<{ _id: string; todo: string }>;
}

export const Todo = new Schema({
  _id: { type: String, require: true },
  todo: { type: String, require: true },
});

const TodoListSchema = new Schema({
  boardId: { type: Schema.Types.ObjectId },
  creatorId: { type: Schema.Types.ObjectId },
  title: { type: String, require: true },
  todos: [Todo],
});

export default mongoose.model<ITodoList>("TodoList", TodoListSchema);
