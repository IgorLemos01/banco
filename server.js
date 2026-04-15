require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const pagbankRoutes = require("./pagbank");
const webhookRoutes = require("./webhook");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/pagbank", pagbankRoutes);
app.use("/webhook", webhookRoutes);

app.get("/", (_req, res) => res.json({ status: "ok", app: "Arraiá da Paz 2026" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
