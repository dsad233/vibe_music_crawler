import express from "express";
import VibeRouter from "./src/vibe/vibe.router.js";
import { errorHandler } from "./src/common/middlewares/error.middlewares.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((err, res, req, next) => {
  errorHandler(err, res, res, next);
});
app.use("/vibe", VibeRouter);

app.listen(port, () => {
  console.log(port, " listening...");
});
