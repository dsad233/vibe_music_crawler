import express from "express";
import VibeRouter from "./src/vibe/vibe.router.js";
import { errorHandler } from "./src/common/middlewares/error.middlewares.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/vibe", VibeRouter);
app.use((err, req, res, next) => {
  errorHandler(err, res, res, next);
});

app.listen(port, () => {
  console.log(port, " listening...");
});
