require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const appRouter = require("./src/modules/app/app.route.js");
const db = require("./src/data/models/index.js");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // URL de ton frontend React
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // si tu veux envoyer les cookies / sessions
  })
);

app.use(express.json());

const server = http.createServer(app);

app.use(appRouter);

// db.sequelize.sync({alter: true}).then(() => {
//   console.log("Database connected");
// });

server.listen(process.env.APP_PORT, async () => {
  console.log(`Server demarer avec succès au port ${process.env.APP_PORT}`);
});

