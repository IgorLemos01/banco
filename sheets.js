const { google } = require("googleapis");

/**
 * Registra pagamento confirmado na planilha Google Sheets
 * @param {Object} dados - { order_id, nome, email, cpf, tipo, valor, metodo, pago_em, status }
 */
async function registrarNaPlanilha(dados) {
  const sheetId = process.env.SHEET_ID;

  // Se não tiver SHEET_ID configurado, pula silenciosamente
  if (!sheetId || sheetId === "INSIRA_AQUI_O_ID_DA_PLANILHA") {
    console.warn("⚠️ SHEET_ID não configurado, pulando registro na planilha.");
    return;
  }

  let serviceAccount;
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    // Remove aspas duplas escapadas caso o JSON venha com ""chave""
    const cleaned = raw.replace(/""/g, '"').replace(/^"|"$/g, "");
    serviceAccount = JSON.parse(cleaned);
  } catch (e) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT_JSON inválido:", e.message);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const dataFormatada = new Date(dados.pago_em).toLocaleString("pt-BR", {
    timeZone: "America/Recife",
  });

  const linha = [
    dados.order_id,
    dados.nome,
    dados.email,
    dados.cpf,
    dados.tipo,
    `R$ ${dados.valor}`,
    dados.metodo,
    dataFormatada,
    dados.status,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range:         "Pagina1!A:I",
    valueInputOption: "USER_ENTERED",
    requestBody:   { values: [linha] },
  });

  console.log(`📊 Planilha atualizada: ${dados.nome}`);
}

module.exports = { registrarNaPlanilha };
