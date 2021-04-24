export type Board = {
  name: string;
  _id: string;
  creatorId: string;
};

export type User = {
  _id: string;
  email?: string;
  name?: string;
  boards: Board[];
};

export type Todo = {
  todo: string;
  _id: string;
};

export type TodoList = {
  title: string;
  _id: string;
  todos: Todo[];
};
