/**
 * form.js — Arraiá da Paz 2026
 * Integração com backend PagBank no Easypanel
 */

// ── URL do backend ────────────────────────────────────────
const BACKEND_URL = "https://painel-banco.mvnptn.easypanel.host";

// ── Estado global ─────────────────────────────────────────
let svAtual        = 1;
let comSelecionada = null;   // true | false | null
let tipoIngresso   = null;   // 'individual' | 'mesa'
let pagSelecionado = null;   // 'pix' | 'cartao'

/* ══════════════════════════════════════════════════════════
   NAVEGAÇÃO ENTRE STEPS
══════════════════════════════════════════════════════════ */

function irSv(n) {
  // Remove active/done do step atual
  document.getElementById("sv" + svAtual).classList.remove("active");
  document.getElementById("si" + svAtual).classList.remove("active");

  if (svAtual < n) {
    document.getElementById("si" + svAtual).classList.add("done");
  } else {
    document.getElementById("si" + n).classList.remove("done");
  }

  svAtual = n;
  document.getElementById("sv" + svAtual).classList.add("active");
  document.getElementById("si" + svAtual).classList.add("active");

  // Scroll pro topo do formulário
  const container = document.querySelector(".form-container");
  if (container) container.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function irSv2() { if (validar1()) irSv(2); }
function irSv3() { if (validar2()) irSv(3); }
function irSv4() {
  if (!tipoIngresso) { toast("⚠️ Selecione o tipo de ingresso."); return; }
  irSv(4);
}

/* ══════════════════════════════════════════════════════════
   VALIDAÇÕES
══════════════════════════════════════════════════════════ */

function _erroField(el, msg) {
  el.classList.add("err");
  toast(msg);
  el.focus();
  setTimeout(() => el.classList.remove("err"), 2500);
}

function validar1() {
  const nome  = document.getElementById("f_nome");
  const email = document.getElementById("f_email");
  const tel   = document.getElementById("f_tel");
  const cpf   = document.getElementById("f_cpf");
  const rg    = document.getElementById("f_rg");

  if (!nome.value.trim() || nome.value.trim().split(" ").length < 2) {
    _erroField(nome, "⚠️ Informe nome e sobrenome."); return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    _erroField(email, "⚠️ Informe um e-mail válido."); return false;
  }
  const telLimpo = tel.value.replace(/\D/g, "");
  if (telLimpo.length < 10 || telLimpo.length > 11) {
    _erroField(tel, "⚠️ Informe um telefone válido com DDD."); return false;
  }
  const cpfLimpo = cpf.value.replace(/\D/g, "");
  if (cpfLimpo.length !== 11 || !_cpfValido(cpfLimpo)) {
    _erroField(cpf, "⚠️ Informe um CPF válido."); return false;
  }
  if (!rg.value.trim()) {
    _erroField(rg, "⚠️ Preencha o RG."); return false;
  }
  return true;
}

function _cpfValido(c) {
  if (/^(\d)\1{10}$/.test(c)) return false;
  let soma = 0, r;
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
  r = (soma * 10) % 11; if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
  r = (soma * 10) % 11; if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

function validar2() {
  if (comSelecionada === null) {
    toast("⚠️ Selecione se é da Comunidade Shalom."); return false;
  }
  if (comSelecionada === false) {
    const ind = document.getElementById("f_indicacao");
    if (!ind.value.trim()) {
      _erroField(ind, "⚠️ Informe quem te indicou."); return false;
    }
  }
  return true;
}

/* ══════════════════════════════════════════════════════════
   COMUNIDADE — CORRIGIDO
   Usa classList para toggle da classe .show (CSS-driven)
══════════════════════════════════════════════════════════ */

function selecionarCom(sim) {
  comSelecionada = sim;

  // Marca visualmente os botões de rádio
  document.getElementById("rbSim").classList.toggle("selected", sim === true);
  document.getElementById("rbNao").classList.toggle("selected", sim === false);

  // Exibe/oculta campo de indicação via classe CSS .show
  const cond = document.getElementById("condIndicacao");
  if (sim === false) {
    cond.classList.add("show");
  } else {
    cond.classList.remove("show");
    document.getElementById("f_indicacao").value = "";
  }
}

/* ══════════════════════════════════════════════════════════
   TIPO DE INGRESSO
══════════════════════════════════════════════════════════ */

function selecionarIngresso(tipo) {
  tipoIngresso = tipo;

  const cardInd  = document.getElementById("ingressoIndividual");
  const cardMesa = document.getElementById("ingressoMesa");
  const btn      = document.getElementById("btnStep3");

  cardInd.classList.toggle("selected", tipo === "individual");
  cardInd.setAttribute("aria-pressed", tipo === "individual");
  cardMesa.classList.toggle("selected", tipo === "mesa");
  cardMesa.setAttribute("aria-pressed", tipo === "mesa");

  btn.disabled = false;
  btn.removeAttribute("aria-disabled");

  // Reseta pagamento ao mudar ingresso
  pagSelecionado = null;
  document.getElementById("pixCard").classList.remove("selected");
  document.getElementById("cartaoCard").classList.remove("selected");
  document.getElementById("pdPix").classList.remove("show");
  document.getElementById("pdCartao").classList.remove("show");
  document.getElementById("btnFinalizar").disabled = true;
}

/* ══════════════════════════════════════════════════════════
   PAGAMENTO
══════════════════════════════════════════════════════════ */

function selecionarPag(tipo) {
  pagSelecionado = tipo;

  document.getElementById("pixCard").classList.toggle("selected", tipo === "pix");
  document.getElementById("cartaoCard").classList.toggle("selected", tipo === "cartao");
  document.getElementById("pdPix").classList.toggle("show", tipo === "pix");
  document.getElementById("pdCartao").classList.toggle("show", tipo === "cartao");

  _atualizarBtnFinalizar();
}

function toggleLGPD() {
  _atualizarBtnFinalizar();
}

function _atualizarBtnFinalizar() {
  const lgpd = document.getElementById("chkLGPD")?.checked;
  const btn  = document.getElementById("btnFinalizar");
  const ok   = !!(pagSelecionado && lgpd);
  btn.disabled = !ok;
  btn.setAttribute("aria-disabled", String(!ok));
}

function copiarPix() {
  const chave = document.getElementById("pixKey")?.textContent?.trim();
  if (!chave) return;
  navigator.clipboard.writeText(chave).then(() => toast("✅ Chave Pix copiada!"));
}

/* ══════════════════════════════════════════════════════════
   FINALIZAR
══════════════════════════════════════════════════════════ */

async function finalizar() {
  // Honeypot anti-bot
  if (document.getElementById("f_website")?.value.trim()) return;

  const btn = document.getElementById("btnFinalizar");
  btn.disabled    = true;
  btn.textContent = "⏳ Processando...";

  const dados = {
    nome:       document.getElementById("f_nome").value.trim(),
    email:      document.getElementById("f_email").value.trim(),
    cpf:        document.getElementById("f_cpf").value.trim(),
    telefone:   document.getElementById("f_tel").value.trim(),
    rg:         document.getElementById("f_rg").value.trim(),
    comunidade: comSelecionada ? "Sim" : "Não",
    indicacao:  document.getElementById("f_indicacao").value.trim() || "–",
    tipo:       tipoIngresso,
    pagamento:  pagSelecionado,
  };

  try {
    if (pagSelecionado === "pix") {
      await _finalizarPix(dados);
    } else {
      await _finalizarCartao(dados);
    }
  } catch (err) {
    console.error("Erro ao finalizar:", err);
    toast("❌ Erro inesperado. Tente novamente.");
    btn.disabled    = false;
    btn.textContent = "🎉 Finalizar Inscrição";
  }
}

async function _finalizarPix(dados) {
  const resp = await fetch(`${BACKEND_URL}/pagbank/pix`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(dados),
  });

  const json = await resp.json();

  if (!resp.ok) {
    toast(json.erro || "❌ Erro ao gerar Pix.");
    document.getElementById("btnFinalizar").disabled    = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
    return;
  }

  // Substitui o conteúdo do step 4 pela tela de Pix gerado
  _mostrarTelaPix(dados, json);
}

function _mostrarTelaPix(dados, pix) {
  const sv4 = document.getElementById("sv4");
  sv4.innerHTML = `
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="font-size:56px;margin-bottom:12px;">💚</div>
      <h3 style="color:#27ae60;margin:0 0 6px;font-size:1.4rem;">Pix Gerado!</h3>
      <p style="color:rgba(255,255,255,.6);font-size:.9rem;margin:0 0 20px;">
        Escaneie o QR Code ou copie o código abaixo
      </p>

      ${pix.pix_qrcode_img ? `
        <img src="${pix.pix_qrcode_img}" alt="QR Code Pix"
          style="width:200px;height:200px;border-radius:14px;margin:0 auto 20px;display:block;
                 background:#fff;padding:8px;">
      ` : ""}

      <div style="background:rgba(0,0,0,.3);border:1px solid rgba(39,174,96,.3);border-radius:10px;
                  padding:12px 16px;font-size:.85rem;color:#fff;word-break:break-all;
                  margin-bottom:16px;text-align:left;">
        ${pix.pix_copia_cola || "–"}
      </div>

      <button class="btn-primary" onclick="copiarPixDinamico('${(pix.pix_copia_cola || "").replace(/'/g, "\\'")}')">
        📋 Copiar Pix Copia e Cola
      </button>

      <div style="margin-top:20px;padding:16px;background:rgba(245,197,24,.08);
                  border:1px solid rgba(245,197,24,.2);border-radius:12px;">
        <p style="color:rgba(255,255,255,.7);font-size:.85rem;margin:0;line-height:1.7;">
          💰 Valor: <strong style="color:#f5c518;">R$ ${pix.valor_reais}</strong><br>
          ⏰ Expira em 24 horas<br>
          📧 Após o pagamento, você receberá um e-mail de confirmação em<br>
          <strong style="color:#f5c518;">${dados.email}</strong>
        </p>
      </div>

      <p style="margin-top:16px;color:rgba(255,255,255,.3);font-size:.75rem;">
        Pedido: ${pix.order_id}
      </p>
    </div>
  `;
}

function copiarPixDinamico(chave) {
  navigator.clipboard.writeText(chave).then(() => toast("✅ Pix copiado!"));
}

async function _finalizarCartao(dados) {
  const resp = await fetch(`${BACKEND_URL}/pagbank/cartao`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(dados),
  });

  const json = await resp.json();

  if (!resp.ok) {
    toast(json.erro || "❌ Erro ao criar checkout.");
    document.getElementById("btnFinalizar").disabled    = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
    return;
  }

  if (json.link_pagamento) {
    toast("🔐 Redirecionando para pagamento seguro...");
    setTimeout(() => { window.location.href = json.link_pagamento; }, 1200);
  } else {
    toast("❌ Link de pagamento não disponível.");
    document.getElementById("btnFinalizar").disabled    = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
  }
}

/* ══════════════════════════════════════════════════════════
   RESET
══════════════════════════════════════════════════════════ */

function resetForm() {
  svAtual        = 1;
  comSelecionada = null;
  tipoIngresso   = null;
  pagSelecionado = null;

  ["sv1","sv2","sv3","sv4"].forEach(id => document.getElementById(id)?.classList.remove("active"));
  document.getElementById("sv1")?.classList.add("active");

  ["si1","si2","si3","si4"].forEach(id =>
    document.getElementById(id)?.classList.remove("active","done")
  );
  document.getElementById("si1")?.classList.add("active");

  document.getElementById("stepsWrap")?.classList.remove("hidden");
  document.getElementById("formBody")?.classList.remove("hidden");
  document.getElementById("successView")?.classList.remove("show");

  document.getElementById("ingressoIndividual")?.classList.remove("selected");
  document.getElementById("ingressoMesa")?.classList.remove("selected");

  const btnStep3 = document.getElementById("btnStep3");
  if (btnStep3) { btnStep3.disabled = true; btnStep3.setAttribute("aria-disabled","true"); }

  document.getElementById("btnFinalizar").disabled = true;
  const chkLGPD = document.getElementById("chkLGPD");
  if (chkLGPD) chkLGPD.checked = false;

  document.getElementById("condIndicacao")?.classList.remove("show");
  document.getElementById("rbSim")?.classList.remove("selected");
  document.getElementById("rbNao")?.classList.remove("selected");
  document.getElementById("pixCard")?.classList.remove("selected");
  document.getElementById("cartaoCard")?.classList.remove("selected");
  document.getElementById("pdPix")?.classList.remove("show");
  document.getElementById("pdCartao")?.classList.remove("show");

  ["f_nome","f_email","f_tel","f_cpf","f_rg","f_indicacao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ══════════════════════════════════════════════════════════
   MÁSCARAS
══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("f_cpf")?.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    this.value = v;
  });

  document.getElementById("f_tel")?.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/, "($1) $2")
         .replace(/(\d{5})(\d)/, "$1-$2");
    this.value = v;
  });
});
