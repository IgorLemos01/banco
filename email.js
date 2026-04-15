const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Envia e-mail de confirmação de pagamento
 * @param {Object} dados - { order_id, nome, email, tipo, valor, metodo, pago_em }
 */
async function enviarEmailConfirmacao(dados) {
  const primeiroNome = (dados.nome || "").split(" ")[0];

  const dataFormatada = new Date(dados.pago_em).toLocaleString("pt-BR", {
    timeZone: "America/Recife",
    dateStyle: "short",
    timeStyle: "short",
  });

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1c32;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">

      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#1a3a5c;border-radius:20px;overflow:hidden;max-width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1c32,#1a3a5c);padding:36px 32px;text-align:center;border-bottom:3px solid #f5c518;">
            <div style="font-size:52px;margin-bottom:8px;">🪗</div>
            <h1 style="color:#f5c518;margin:0 0 6px;font-size:28px;font-weight:900;">Pagamento Confirmado!</h1>
            <p style="color:rgba(255,255,255,.7);margin:0;font-size:15px;">Arraiá da Paz 2026 · Comunidade Shalom</p>
          </td>
        </tr>

        <!-- Saudação -->
        <tr>
          <td style="padding:32px 32px 0;">
            <p style="color:#fff;font-size:17px;margin:0 0 8px;">
              Ebaaa, <strong style="color:#f5c518;">${primeiroNome}</strong>! 🎉
            </p>
            <p style="color:rgba(255,255,255,.7);font-size:15px;margin:0 0 24px;line-height:1.6;">
              Seu pagamento foi confirmado e sua vaga no Arraiá da Paz está <strong style="color:#27ae60;">garantida</strong>!
            </p>
          </td>
        </tr>

        <!-- Detalhes da reserva -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:rgba(255,255,255,.06);border:1px solid rgba(245,197,24,.2);border-radius:14px;overflow:hidden;">
              <tr style="background:rgba(245,197,24,.1);">
                <td style="padding:12px 20px;color:#f5c518;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                  📋 Detalhes da Reserva
                </td>
              </tr>
              <tr><td style="padding:20px;">
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color:rgba(255,255,255,.5);font-size:14px;width:45%;">Tipo de ingresso</td>
                    <td style="color:#fff;font-weight:bold;font-size:14px;">${dados.tipo}</td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,.5);font-size:14px;">Valor pago</td>
                    <td style="color:#27ae60;font-weight:bold;font-size:16px;">R$ ${dados.valor}</td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,.5);font-size:14px;">Forma de pagamento</td>
                    <td style="color:#fff;font-size:14px;">${dados.metodo}</td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,.5);font-size:14px;">Data do pagamento</td>
                    <td style="color:#fff;font-size:14px;">${dataFormatada}</td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,.5);font-size:13px;">Nº do pedido</td>
                    <td style="color:rgba(255,255,255,.4);font-size:12px;">${dados.order_id}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Info do evento -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.25);border-radius:14px;padding:20px;">
              <tr><td>
                <p style="margin:0;color:rgba(255,255,255,.85);font-size:14px;line-height:1.9;">
                  📅 <strong style="color:#f5c518;">04 de Julho de 2026</strong> · Sexta-feira<br>
                  🕓 <strong style="color:#f5c518;">A partir das 16h</strong> · Até meia-noite<br>
                  📍 <strong style="color:#f5c518;">Sales Multieventos</strong><br>
                  &nbsp;&nbsp;&nbsp;&nbsp;Av. Rio de Janeiro, 2500 · Ponto Novo, Aracaju/SE<br>
                  🌽 Leve <strong style="color:#f5c518;">1kg de alimento não perecível</strong> na entrada
                </p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Dúvidas -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <p style="color:rgba(255,255,255,.45);font-size:13px;margin:0;">
              Dúvidas? Fale conosco pelo WhatsApp:<br>
              <a href="https://wa.me/5579999695288" style="color:#f5c518;font-weight:bold;text-decoration:none;">
                (79) 99969-5288
              </a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,.3);padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,.08);">
            <p style="color:rgba(255,255,255,.3);font-size:12px;margin:0;">
              © 2026 Arraiá da Paz · Comunidade Católica Shalom · Aracaju – SE
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
  `;

  await transporter.sendMail({
    from:    `"Arraiá da Paz 2026" <${process.env.GMAIL_USER}>`,
    to:      dados.email,
    subject: `🪗 Pagamento Confirmado – Arraiá da Paz 2026`,
    html,
  });

  console.log(`📧 E-mail enviado para: ${dados.email}`);
}

module.exports = { enviarEmailConfirmacao };
