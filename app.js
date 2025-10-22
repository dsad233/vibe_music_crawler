import express from "express";
import VibeRouter from "./src/vibe/vibe.router.js";
import { ErrorHandler } from "./src/common/middlewares/error.middleware.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/vibe", VibeRouter);
app.use((err, req, res, next) => {
  ErrorHandler(err, res, res, next);
});

app.listen(port, () => {
  console.log(port, " listening...");
});
