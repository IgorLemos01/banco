const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const PAGBANK_URL = (process.env.PAGBANK_URL || "").replace(/\/$/, ""); // remove barra final
const TOKEN       = process.env.PAGBANK_TOKEN;
const SITE_URL    = (process.env.SITE_URL || "https://arraiadapaz.com.br").replace(/\/$/, "");

const PRECOS = {
  mesa:       parseInt(process.env.PRECO_MESA       || "15000"),
  individual: parseInt(process.env.PRECO_INDIVIDUAL || "4000"),
};

function headers() {
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${TOKEN}`,
  };
}

function limparCPF(cpf) {
  return (cpf || "").replace(/\D/g, "");
}

function montarTelefone(telefone) {
  if (!telefone) return undefined;
  const digits = telefone.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  return [{
    country: "55",
    area:    digits.substring(0, 2),
    number:  digits.substring(2),
    type:    "MOBILE",
  }];
}

// ────────────────────────────────────────────────────────
// POST /pagbank/pix
// ────────────────────────────────────────────────────────
router.post("/pix", async (req, res) => {
  try {
    // 1. Alterado: Capturando todos os campos novos
    const { nome, email, cpf, telefone, rg, comunidade, indicacao, tipo } = req.body;

    if (!nome || !email || !cpf || !tipo) {
      return res.status(400).json({ erro: "Campos obrigatórios: nome, email, cpf, tipo" });
    }

    const valor = PRECOS[tipo];
    if (!valor) {
      return res.status(400).json({ erro: "Tipo inválido. Use 'mesa' ou 'individual'" });
    }

    const nomeItem = tipo === "mesa"
      ? "Mesa – Arraiá da Paz 2026"
      : "Ingresso Individual – Arraiá da Paz 2026";

    const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 2. Alterado: Empacotando dados no ID
    const refId = `ADPAZ|${rg || "-"}|${comunidade || "-"}|${(indicacao || "-").replace(/\|/g, "")}|${telefone || "-"}|${tipo || "-"}`;

    const payload = {
      reference_id: refId, // Usando o nosso ID empacotado
      customer: {
        name:   nome,
        email:  email,
        tax_id: limparCPF(cpf),
        ...(montarTelefone(telefone) && { phones: montarTelefone(telefone) }),
      },
      items: [{
        reference_id: tipo,
        name:         nomeItem,
        quantity:     1,
        unit_amount:  valor,
      }],
      qr_codes: [{
        amount:          { value: valor },
        expiration_date: expiracao,
      }],
      notification_urls: [`${SITE_URL}/webhook/pagbank`],
    };

    console.log("📤 Criando Pix:", JSON.stringify(payload, null, 2));

    const { data } = await axios.post(
      `${PAGBANK_URL}/orders`,
      payload,
      { headers: headers() }
    );

    console.log("✅ Resposta PagBank Pix:", JSON.stringify(data, null, 2));

    const qrCode = data.qr_codes?.[0];
    const qrImg  = qrCode?.links?.find(l => l.media === "image/png")?.href;

    return res.json({
      order_id:       data.id,
      status:         data.status,
      valor_reais:    (valor / 100).toFixed(2),
      pix_copia_cola: qrCode?.text,
      pix_qrcode_img: qrImg,
      expira_em:      qrCode?.expiration_date,
    });

  } catch (err) {
    console.error("❌ Erro /pix:", JSON.stringify(err.response?.data || err.message, null, 2));
    return res.status(500).json({
      erro:    "Erro ao criar cobrança Pix",
      detalhe: err.response?.data || err.message,
    });
  }
});

// ────────────────────────────────────────────────────────
// POST /pagbank/cartao
// ────────────────────────────────────────────────────────
router.post("/cartao", async (req, res) => {
  try {
    // 1. Alterado: Capturando todos os campos novos
    const { nome, email, cpf, telefone, rg, comunidade, indicacao, tipo } = req.body;

    if (!nome || !email || !cpf || !tipo) {
      return res.status(400).json({ erro: "Campos obrigatórios: nome, email, cpf, tipo" });
    }

    const valor = PRECOS[tipo];
    if (!valor) {
      return res.status(400).json({ erro: "Tipo inválido. Use 'mesa' ou 'individual'" });
    }

    const nomeItem = tipo === "mesa"
      ? "Mesa – Arraiá da Paz 2026"
      : "Ingresso Individual – Arraiá da Paz 2026";

    // 2. Alterado: Empacotando dados no ID
    const refId = `ADPAZ|${rg || "-"}|${comunidade || "-"}|${(indicacao || "-").replace(/\|/g, "")}|${telefone || "-"}|${tipo || "-"}`;

    const payload = {
      reference_id: refId,
      customer: {
        name:   nome,
        email:  email,
        tax_id: limparCPF(cpf),
        ...(montarTelefone(telefone) && { phones: montarTelefone(telefone) }),
      },
      items: [{
        reference_id: tipo,
        name:         nomeItem,
        quantity:     1,
        unit_amount:  valor,
      }],
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "DEBIT_CARD" },
      ],
      // Adicionamos um fallback: se a variável SITE_URL falhar, ele usa o link da Vercel
      redirect_url:      `${process.env.SITE_URL || 'https://arraiadapaz.vercel.app'}/sucesso`,
      notification_urls: [`${process.env.SITE_URL || 'https://painel-banco.mvnptn.easypanel.host'}/webhook/pagbank`],
    };

    console.log("📤 Criando Checkout Cartão:", JSON.stringify(payload, null, 2));

    const { data } = await axios.post(
      `${PAGBANK_URL}/checkouts`,
      payload,
      { headers: headers() }
    );

    console.log("✅ Resposta PagBank Cartão:", JSON.stringify(data, null, 2));

    const checkoutLink = data.links?.find(l => l.rel === "PAY")?.href;

    return res.json({
      checkout_id:    data.id,
      link_pagamento: checkoutLink,
      expira_em:      data.expiration_date,
    });

  } catch (err) {
    console.error("❌ Erro /cartao:", JSON.stringify(err.response?.data || err.message, null, 2));
    return res.status(500).json({
      erro:    "Erro ao criar checkout de cartão",
      detalhe: err.response?.data || err.message,
    });
  }
});

module.exports = router;
