import express from "express";
import dotenv from "dotenv";
import AppError from "./utils/appError.util.js";
import { globalErrorHandler } from "./controllers/Errors.controller.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.set("query parser", "extended");

app.all("/{*path}", (request, response, next) => {
  // response.status(404).json({
  //   status: "fail",
  //   message: ,
  // });

  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;