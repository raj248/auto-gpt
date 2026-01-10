import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

const app: Express = express();

// app.use(cors({
// origin: '*', // your frontend origin
// methods: ['GET','POST','PUT','DELETE'],
// credentials: true
// }));

app.use(
  cors({
    origin: true, // or your frontend IP/domain
    credentials: true,
  })
);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

import gpt from "./controllers/gpt";

app.use("/api/gpt", gpt);

app.use(express.static(path.join(process.cwd(), "public")));

app.use((req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

export default app;
