const express = require("express");
const router  = express.Router();

const { enviarEmailConfirmacao } = require("../email");
const { registrarNaPlanilha }    = require("../sheets");

// ────────────────────────────────────────────────────────
// POST /webhook/pagbank
// PagBank chama aqui quando o pagamento é confirmado
// ────────────────────────────────────────────────────────
router.post("/pagbank", async (req, res) => {
  try {
    const evento = req.body;
    console.log("📩 Webhook recebido:", JSON.stringify(evento, null, 2));

    // Verifica se é pagamento confirmado
    // PagBank pode enviar pelo campo charges[0].status ou order.status
    const order   = evento;
    const charge  = order?.charges?.[0];
    const status  = charge?.status || order?.status || "";

    if (status !== "PAID") {
      console.log(`ℹ️ Status ignorado: ${status}`);
      return res.status(200).json({ recebido: true, acao: "ignorado", status });
    }

    const customer = order.customer || {};
    const item     = order.items?.[0] || {};
    const tipo     = item.reference_id === "mesa" ? "Mesa" : "Ingresso Individual";
    const valor    = ((charge?.amount?.value || 0) / 100).toFixed(2);
    const metodo   = charge?.payment_method?.type || "–";

    const dados = {
      order_id: order.id,
      nome:     customer.name  || "–",
      email:    customer.email || "–",
      cpf:      customer.tax_id || "–",
      tipo,
      valor,
      metodo,
      pago_em:  charge?.paid_at || new Date().toISOString(),
      status:   "Pago ✅",
    };

    console.log("✅ Pagamento confirmado, processando:", dados);

    // Envia e-mail e registra na planilha em paralelo
    const resultados = await Promise.allSettled([
      enviarEmailConfirmacao(dados),
      registrarNaPlanilha(dados),
    ]);

    resultados.forEach((r, i) => {
      const nome = i === 0 ? "E-mail" : "Planilha";
      if (r.status === "rejected") {
        console.error(`❌ ${nome} falhou:`, r.reason?.message);
      } else {
        console.log(`✅ ${nome} OK`);
      }
    });

    return res.status(200).json({ recebido: true, acao: "processado" });

  } catch (err) {
    console.error("❌ Erro no webhook:", err.message);
    // Retorna 200 para evitar que PagBank reenvie em loop
    return res.status(200).json({ recebido: true, erro: err.message });
  }
});

module.exports = router;
