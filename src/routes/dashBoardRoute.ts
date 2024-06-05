import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashBoardStates,
  getLineCharts,
  getPieCharts,
} from "../controllers/dashBoardController.js";

const app = express.Router();

//states
app.get("/stats", adminOnly, getDashBoardStates);

//pie chart
app.get("/pie", adminOnly, getPieCharts);

//bar chard
app.get("/bar", adminOnly, getBarCharts);

//line chard
app.get("/line", adminOnly, getLineCharts);

export default app;
