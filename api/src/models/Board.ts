import mongoose, { Schema } from "mongoose";

export interface IBoard extends mongoose.Document {
  name: string;
  creatorId: string;
  todoLists?: Array<string>;
}

const BoardSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId },
  name: { type: String },
  todoLists: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
});

export default mongoose.model<IBoard>("Board", BoardSchema);
