const axios = require("axios");

// URL oficial do seu Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbz_Sz_tc06wopqbjYbv-gn0yA4o9htEHHNNS5l5bPLjwcWcCQ7Sc7IvUGjLAQ2ADrlf/exec";

async function registrarNaPlanilha(dados) {
  try {
    console.log("📤 Enviando dados para o Apps Script...");
    
    const resposta = await axios.post(APPS_SCRIPT_URL, dados, {
      headers: { "Content-Type": "application/json" }
    });

    if (resposta.data && resposta.data.ok) {
      console.log("✅ Dados salvos na planilha com sucesso!");
    } else {
      console.error("⚠️ Apps Script retornou um erro:", resposta.data.erro);
    }
  } catch (error) {
    console.error("❌ Falha de comunicação com o Apps Script:", error.message);
  }
}

module.exports = { registrarNaPlanilha };
