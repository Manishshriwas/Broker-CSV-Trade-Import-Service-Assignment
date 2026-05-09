import express from "express";
import importRoute from "./routes/import.route.js";

const app = express();

app.use(express.json());

app.use("/", importRoute);

export default app;