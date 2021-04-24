require("dotenv").config();
// lib
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github";
import { sign, verify } from "jsonwebtoken";
import cors from "cors";

// DB Models
import User from "./models/User";

// routes
import boardRoutes from "./routes/board";
import todoListRoutes from "./routes/todoList";

const main = async () => {
  console.log(process.env, "check env variables here");
  const app = express();
  passport.serializeUser((user: any, done) => {
    done(null, user.accessToken);
  });
  app.use(cors({ origin: "*" }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? process.env.CALLBACK_URL
            : "http://localhost:3002/auth/github/callback",
      },
      async (_, __, profile, cb) => {
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          user.name = profile.displayName;
          user.email = profile.emails?.[0]?.value;
          await user.save();
        } else {
          user = await (
            await User.create({
              githubId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
            })
          ).save();
        }

        cb(null, {
          accessToken: sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET!,
            {
              expiresIn: "1y",
            }
          ),
        });
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { session: false }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { session: false }),
    (req: any, res) => {
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  app.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.send({ user: null });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.send({ user: null });
      return;
    }

    let userId = "";

    try {
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      userId = payload.userId;
    } catch (err) {
      res.send({ user: null });
      return;
    }

    if (!userId) {
      res.send({ user: null });
      return;
    }
    const user = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "boards",
          localField: "_id",
          foreignField: "creatorId",
          as: "boards",
        },
      },
    ]);
    res.send({ user: user[0] });
  });

  app.use("/board", boardRoutes);
  app.use("/todo-list", todoListRoutes);

  // connect to database
  mongoose.connect(process.env.MONGO_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.once("open", () =>
    console.log("connected To MongoDB", process.env)
  );

  // test url
  app.get("/", (_, res) => res.send("Hello Here"));
  app.listen(3002, () => console.log(`listening on port 3002`));
};

main();
