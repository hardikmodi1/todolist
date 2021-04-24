import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name?: string;
  email?: string;
  githubId?: string;
}

const UserSchema = new mongoose.Schema({
  githubId: { type: String, unique: true },
  name: { type: String },
  email: { type: String },
});

export default mongoose.model<IUser>("User", UserSchema);
