/* ============================================================
   IRONFIT — Lógica do aplicativo
   ============================================================ */
'use strict';

/* ---------- utilidades ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = n => String(n).padStart(2, '0');

/** Escapa texto vindo dos dados antes de injetar em HTML. */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const fmt = (n, d = 0) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Data local em YYYY-MM-DD (nunca use toISOString — ele converte para UTC
    e vira o dia anterior para quem está em GMT-3). */
function ymd(dt = new Date()) {
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function diasEntre(a, b) {
  return Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
}
const DIAS_PT = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MES_PT  = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function dataLonga(s) {
  const d = parseYmd(s);
  return `${DIAS_PT[d.getDay()]}, ${d.getDate()} de ${MES_PT[d.getMonth()]} de ${d.getFullYear()}`;
}
function dataCurta(s) {
  const d = parseYmd(s);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/* ---------- tempo de treino ----------
   Mesmo princípio dos totais da dieta: o tempo é DERIVADO da prescrição,
   nunca digitado. Um bloco que ganha uma série mostra o custo na hora. */

/** Segundos de uma série: ~3 s por repetição + entrada e saída do aparelho. */
function segSerie(ex) {
  const r = String(ex.reps);
  const m = r.match(/(\d+)(?:\s*-\s*(\d+))?/);
  const n = m ? (m[2] ? (+m[1] + +m[2]) / 2 : +m[1]) : 10;
  if (/\bs\b|segundo/i.test(r)) return n;          // prescrição já é em segundos
  let s = Math.round(n * 3 + 6);
  if (/cada lado/i.test(r)) s *= 2;                // unilateral custa o dobro
  return s;
}

/** Segundos de um bloco: montagem + (trabalho + descanso) × rodadas. */
function segBloco(b) {
  const setup = 30 * b.exercicios.length;
  const desc = parseInt(String(b.descanso || '60').replace(/\D/g, ''), 10) || 60;
  if (b.tipo === 'forca' || b.tipo === 'final') {
    const e = b.exercicios[0];
    return setup + e.series * (segSerie(e) + desc);
  }
  const rodadas = Math.max(...b.exercicios.map(e => e.series));
  const trabalho = b.exercicios.reduce((a, e) => a + segSerie(e) + 15, 0);
  return setup + rodadas * (trabalho + desc);
}

const minBloco = b => Math.round(segBloco(b) / 60);
const minSessao = w => Math.round(w.aquecimento.min + w.blocos.reduce((a, b) => a + segBloco(b), 0) / 60);

/** Soma os macros de uma lista de itens. Nenhum total é escrito à mão. */
function somaItens(itens) {
  return itens.reduce((a, i) => ({
    kcal: a.kcal + (i.kcal || 0),
    p: a.p + (i.p || 0),
    c: a.c + (i.c || 0),
    g: a.g + (i.g || 0)
  }), { kcal: 0, p: 0, c: 0, g: 0 });
}

/* ============================================================
   ESTADO
   ============================================================ */
const STORE = 'ironfit_v2';

let state = {
  v: 2,
  weights: [],        // [{ d:'YYYY-MM-DD', w:Number }]
  sessions: [],       // [{ d, w:'A', dur:Number, ex:{ 'nome': [{kg,r,ok}] } }]
  curWorkout: 'A',
  tabTreino: 'A',
  tabDieta: 'cardapio',
  tabPlano: 'periodizacao',
  mealOpt: {},        // { mealId: índice da opção }
  mealDone: {},       // { 'YYYY-MM-DD': { mealId:true } }
  logs: {},           // rascunho da sessão em andamento: { 'A': { 'nome ex': [{kg,r,ok}] } }
  token: '',
  gistId: ''
};

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); }
  catch (e) { console.warn('Falha ao salvar', e); }
}

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) { Object.assign(state, JSON.parse(raw)); return; }
    migrarV1();
  } catch (e) { console.warn('Falha ao carregar', e); }
}

/** Traz o histórico da versão anterior do portal para não perder nada. */
function migrarV1() {
  try {
    const raw = localStorage.getItem('ironfit');
    if (!raw) return;
    const old = JSON.parse(raw);
    if (Array.isArray(old.weightHistory)) {
      state.weights = old.weightHistory
        .filter(x => x && x.weight)
        .map(x => ({ d: ymd(new Date(x.date)), w: Number(x.weight) }));
    }
    if (Array.isArray(old.workoutHistory)) {
      state.sessions = old.workoutHistory.map(x => ({
        d: ymd(new Date(x.date)),
        w: x.day || '?',
        legado: true,
        ex: {}
      }));
    }
    if (old.githubToken) state.token = old.githubToken;
    if (old.gistId) state.gistId = old.gistId;
    save();
    setTimeout(() => toast(`Histórico anterior importado: ${state.weights.length} pesagens, ${state.sessions.length} treinos`, 'ok'), 900);
  } catch (e) { console.warn('Migração falhou', e); }
}

/* ---------- derivados ---------- */
const pesoAtual = () => state.weights.length ? state.weights[state.weights.length - 1].w : ATHLETE.peso0;
const hoje = () => ymd();

/** Tipo do dia da semana atual, conforme a semana-tipo do plano. */
function planoDoDia(dt = new Date()) {
  return WEEK_PLAN.find(d => d.idx === dt.getDay()) || WEEK_PLAN[6];
}

/** Em qual das 7 semanas do programa estamos. */
function semanaAtual() {
  const h = hoje();
  for (const p of PERIODIZATION) if (h >= p.ini && h <= p.fim) return p;
  return h < PERIODIZATION[0].ini ? null : PERIODIZATION[PERIODIZATION.length - 1];
}

/* ============================================================
   NAVEGAÇÃO
   ============================================================ */
function go(screen) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const el = $('#screen-' + screen);
  if (el) el.classList.add('active');
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === screen));
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (screen === 'progresso') { renderProgresso(); setTimeout(desenharGrafico, 60); }
  if (screen === 'hoje') renderHoje();
  if (screen === 'dieta') renderDieta();
}

/* ============================================================
   CABEÇALHO
   ============================================================ */
function renderHeader() {
  const p = pesoAtual();
  $('#hdrWeight').innerHTML = `${fmt(p, 1)}<small>kg</small>`;

  const el = $('#hdrDelta');
  if (state.weights.length < 2) {
    el.className = 'hdr-delta flat';
    el.textContent = state.weights.length ? 'primeira pesagem' : 'registre seu peso';
  } else {
    const ant = state.weights[state.weights.length - 2].w;
    const d = p - ant;
    el.className = 'hdr-delta ' + (d < -0.05 ? 'down' : d > 0.05 ? 'up' : 'flat');
    el.textContent = `${d > 0 ? '+' : ''}${fmt(d, 1)} kg vs anterior`;
  }

  const total = ATHLETE.peso0 - ATHLETE.metaFinal;      // 11 kg
  const feito = clamp(ATHLETE.peso0 - p, 0, total);
  const pct = (feito / total) * 100;
  $('#goalFill').style.width = pct + '%';
  $('#goalPct').textContent = `${fmt(pct, 0)}% da meta`;
  $('#goalStart').innerHTML = `<b>${fmt(ATHLETE.peso0, 1)}</b> início`;
  $('#goalEnd').innerHTML = `<b>${fmt(ATHLETE.metaFinal, 1)}</b> meta`;
  // marcador do peso-alvo no torneio
  $('#goalMarker').style.left = ((ATHLETE.peso0 - ATHLETE.metaTorneio) / total * 100) + '%';
  $('#goalMarker').title = `Meta no torneio: ${ATHLETE.metaTorneio} kg`;
}

/* ============================================================
   TELA — HOJE
   ============================================================ */
function renderCountdown() {
  const d = diasEntre(hoje(), ATHLETE.torneio);
  const el = $('#cdDays');
  if (d > 0) {
    el.textContent = d;
    $('#cdUnit').textContent = d === 1 ? 'dia restante' : 'dias restantes';
  } else if (d === 0) {
    el.textContent = 'HOJE';
    el.style.fontSize = '44px';
    $('#cdUnit').textContent = 'é hoje. Confie no trabalho.';
  } else {
    el.textContent = '✓';
    $('#cdUnit').textContent = 'torneio realizado';
  }
  $('#cdDate').textContent = dataLonga(ATHLETE.torneio);

  const totalDias = diasEntre(ATHLETE.inicio, ATHLETE.torneio);
  const passados = clamp(diasEntre(ATHLETE.inicio, hoje()), 0, totalDias);
  $('#cdBar').style.width = (passados / totalDias * 100) + '%';

  const sem = semanaAtual();
  if (sem) {
    $('#cdPhase').textContent = `Semana ${sem.s} de 7 · ${sem.bloco} · meta de peso no fim da semana: ${fmt(sem.peso, 1)} kg`;
  } else {
    const faltam = diasEntre(hoje(), ATHLETE.inicio);
    $('#cdPhase').textContent = faltam === 1
      ? 'O programa começa amanhã, segunda-feira 10/08 — Semana 1, Acumulação'
      : `O programa começa em ${faltam} dias, na segunda-feira 10/08`;
  }
}

function renderHoje() {
  renderCountdown();
  const pd = planoDoDia();
  const dt = DAYTYPES[pd.tipo];
  const w = pd.treino ? WORKOUTS[pd.treino] : null;

  $('#todayCard').innerHTML = `
    <div class="glass card" style="padding:16px">
      <div class="card-row" style="margin-bottom:13px">
        <div>
          <div class="tiny dim" style="text-transform:uppercase;letter-spacing:.12em;font-weight:700">${DIAS_PT[new Date().getDay()]}</div>
          <div class="h-lg" style="margin-top:2px">${w ? esc(w.icone + ' ' + w.nome) : esc(pd.tipo === 'jogo' ? '🏐 Dia de jogo' : '🌿 Descanso ativo')}</div>
        </div>
        <span class="chip" style="background:${dt.cor}22;border-color:${dt.cor}55;color:${dt.cor}">${esc(dt.nome)}</span>
      </div>

      <div class="three-col" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:13px">
        <div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.04);text-align:center">
          <div class="tiny dim">Manhã</div>
          <div style="font-size:12.5px;font-weight:600;margin-top:3px">${esc(pd.manha)}</div>
        </div>
        <div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.04);text-align:center">
          <div class="tiny dim">Almoço</div>
          <div style="font-size:12.5px;font-weight:600;margin-top:3px">${esc(pd.almoco)}</div>
        </div>
        <div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.04);text-align:center">
          <div class="tiny dim">Noite</div>
          <div style="font-size:12.5px;font-weight:600;margin-top:3px">${esc(pd.noite)}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${w ? `<button class="btn btn-primary" onclick="abrirTreino('${w.id}')">
          <svg viewBox="0 0 24 24"><path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11"/></svg>
          Abrir treino ${w.id}
        </button>` : ''}
        <button class="btn" onclick="abrirTreino('casa')">🏠 Bloco de casa · 15 min</button>
        <button class="btn" onclick="go('dieta')">Dieta de hoje</button>
      </div>
    </div>

    <div class="note t">
      <div class="note-t">🎯 Meta calórica de hoje</div>
      <b>${fmt(dt.kcal)} kcal</b> · ${dt.prot} g de proteína · ${dt.carb} g de carbo · ${dt.gord} g de gordura.
      Seu gasto estimado hoje é de <b>${fmt(dt.tdee)} kcal</b> — déficit de ${fmt(dt.tdee - dt.kcal)} kcal.
      ${(pd.idx === 5 || pd.idx === 6) ? '<br><b style="color:var(--fuchsia)">Hoje tem refeição livre à noite</b> — teto de 1.100 kcal, já orçado na semana.' : ''}
    </div>
  `;

  // semana
  const hojeIdx = new Date().getDay();
  $('#weekGrid').innerHTML = WEEK_PLAN.map(d => {
    const ico = d.treino ? WORKOUTS[d.treino].icone : (d.tipo === 'jogo' ? '🏐' : '🌿');
    const lbl = d.treino ? 'Treino ' + d.treino : (d.tipo === 'jogo' ? 'Jogo' : 'Descanso');
    return `<div class="wday ${d.idx === hojeIdx ? 'today' : ''} ${d.tipo === 'off' ? 'rest' : ''}">
      <div class="wday-n">${d.dia}</div>
      <div class="wday-i">${ico}</div>
      <div class="wday-l">${lbl}</div>
    </div>`;
  }).join('');

  const sem = semanaAtual();
  $('#weekLabel').textContent = sem ? `Semana ${sem.s}/7` : '';

  // estatísticas
  const p = pesoAtual();
  const perdido = ATHLETE.peso0 - p;
  const faltaTorneio = Math.max(0, p - ATHLETE.metaTorneio);
  const dTorneio = diasEntre(hoje(), ATHLETE.torneio);
  const treinos30 = state.sessions.filter(s => diasEntre(s.d, hoje()) <= 30).length;

  $('#hojeStats').innerHTML = `
    ${statCard(fmt(p, 1) + ' kg', 'Peso atual', perdido > 0 ? `−${fmt(perdido, 1)} kg desde o início` : 'ainda sem variação', perdido > 0 ? 'var(--ok)' : null)}
    ${statCard(fmt(faltaTorneio, 1) + ' kg', 'Faltam p/ o torneio', `alvo ${fmt(ATHLETE.metaTorneio, 1)} kg em ${dTorneio > 0 ? dTorneio + ' dias' : 'agora'}`)}
    ${statCard(treinos30, 'Treinos em 30 dias', 'meta: 16 a 17')}
    ${(() => {
      const falta = Math.max(0, p - ATHLETE.metaFinal);
      const semanas = Math.max(1, diasEntre(hoje(), ATHLETE.fimAno) / 7);
      return statCard(fmt(falta, 1) + ' kg', 'Faltam p/ 83 kg', `até 31/12 · ${fmt(falta / semanas, 2)} kg/semana`);
    })()}
  `;
}

function statCard(val, lbl, sub, cor) {
  return `<div class="stat glass">
    <div class="stat-val"${cor ? ` style="color:${cor}"` : ''}>${val}</div>
    <div class="stat-lbl">${lbl}</div>
    ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
  </div>`;
}

/* ============================================================
   TELA — TREINO
   ============================================================ */
const TREINO_TABS = [
  { id: 'A', label: '🔥 A · Peito+Bíceps' },
  { id: 'B', label: '⚡ B · Ombro+Tríceps' },
  { id: 'C', label: '🏹 C · Costas' },
  { id: 'D', label: '🦵 D · Pernas' },
  { id: 'casa', label: '🏠 Casa (15 min)' },
  { id: 'bike', label: '🚴 Bike' }
];

function abrirTreino(id) { state.tabTreino = id; save(); go('treino'); renderTreino(); }

function renderTreinoTabs() {
  $('#treinoTabs').innerHTML = TREINO_TABS.map(t =>
    `<button class="seg ${state.tabTreino === t.id ? 'active' : ''}" onclick="setTabTreino('${t.id}')">${t.label}</button>`
  ).join('');
}
function setTabTreino(id) { state.tabTreino = id; save(); renderTreinoTabs(); renderTreino(); }

function renderTreino() {
  renderTreinoTabs();
  const c = $('#treinoContent');
  const t = state.tabTreino;
  if (t === 'casa')  return void (c.innerHTML = viewCasa());
  if (t === 'bike')  return void (c.innerHTML = viewBike());
  c.innerHTML = viewSessao(WORKOUTS[t]);
  restaurarLogs(t);
}

function viewSessao(w) {
  const tempoTotal = minSessao(w);
  const folga = w.teto - tempoTotal;
  let h = `
    <div class="glass-hi card glow-ring" style="padding:16px;margin-bottom:14px">
      <div class="card-row">
        <div>
          <div class="tiny" style="color:${w.cor};text-transform:uppercase;letter-spacing:.12em;font-weight:700">${esc(w.foco)}</div>
          <div class="h-lg" style="margin-top:3px">${w.icone} ${esc(w.nome)}</div>
        </div>
        <div style="text-align:right">
          <div class="num" style="font-size:26px;color:${w.cor}">${tempoTotal}<span style="font-size:13px;color:var(--txt-3)"> min</span></div>
          <div class="tiny dim">de ${w.teto} disponíveis</div>
        </div>
      </div>
      <div style="margin-top:11px">
        <div class="goal-track" style="height:6px">
          <div class="goal-fill" style="width:${clamp(tempoTotal / w.teto * 100, 0, 100)}%;background:${folga >= 0 ? 'var(--grad)' : 'var(--danger)'}"></div>
        </div>
        <div class="tiny dim" style="margin-top:5px">
          ${folga >= 0
            ? `Sobram <b style="color:var(--ok)">${folga} min</b> de margem para esperar aparelho. O tempo é calculado a partir das séries, do descanso e da montagem — não é estimativa no olho.`
            : `<b style="color:var(--danger)">${-folga} min acima do teto.</b> Corte uma série do último bloco.`}
        </div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px">
        <button class="btn btn-primary btn-sm" onclick="iniciarSessao()">
          <svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg> Iniciar cronômetro
        </button>
        <button class="btn btn-sm" onclick="setTabTreino('casa')">+ Bloco de casa</button>
        <span class="session-clock" id="sessionClock" style="display:none"><i></i><span id="sessionClockTxt">0:00</span></span>
      </div>
    </div>

    <div class="glass card" style="padding:14px">
      <div class="card-row" style="margin-bottom:9px">
        <div class="h-md">🔆 Aquecimento</div>
        <span class="chip t">${w.aquecimento.min} min</span>
      </div>
      <ul class="bullets">${w.aquecimento.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  `;

  w.blocos.forEach((b, bi) => {
    h += `<div class="glass block">
      <div class="block-head">
        <span class="block-title">${esc(b.nome)}</span>
        <span style="display:flex;gap:6px;align-items:center">
          ${b.descanso ? `<span class="chip v">${esc(b.descanso)} descanso</span>` : ''}
          <span class="chip t">${minBloco(b)} min</span>
        </span>
      </div>
      ${b.formato ? `<div class="block-note"><b>${esc(b.formato)}</b></div>` : ''}
      ${b.nota ? `<div class="block-note">${esc(b.nota)}</div>` : ''}
      ${b.exercicios.map((ex, ei) => viewExercicio(ex, bi, ei, b)).join('')}
    </div>`;
  });

  h += `<button class="btn btn-ok btn-lg btn-block" id="btnSalvarTreino" onclick="salvarSessao()" style="margin-top:6px">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Finalizar e salvar treino
    </button>
    <p class="tiny dim" style="text-align:center;margin-top:9px">Os pesos ficam salvos e aparecem como referência na próxima vez que você abrir este treino.</p>`;
  return h;
}

function viewExercicio(ex, bi, ei, bloco) {
  const ult = ultimoPeso(ex.nome);
  const nSets = ex.series || 1;
  const isCarga = bloco.tipo === 'forca' || bloco.tipo === 'superset';

  let sets = '';
  if (isCarga) {
    sets = `<div class="sets">
      <div class="sets-hd"><div>#</div><div>Peso (kg)</div><div>Reps</div><div></div></div>
      ${Array.from({ length: nSets }, (_, si) => `
        <div class="set-row" id="row-${bi}-${ei}-${si}">
          <div class="set-n">${si + 1}</div>
          <input class="set-in" type="number" step="0.5" min="0" inputmode="decimal"
                 placeholder="${ult != null ? ult : '—'}"
                 id="kg-${bi}-${ei}-${si}"
                 onchange="setLog(${bi},${ei},${si},'kg',this.value)">
          <input class="set-in" type="number" min="0" inputmode="numeric"
                 placeholder="${esc(String(ex.reps).replace(/[^0-9-]/g, '') || '—')}"
                 id="r-${bi}-${ei}-${si}"
                 onchange="setLog(${bi},${ei},${si},'r',this.value)">
          <button class="set-ok" id="ok-${bi}-${ei}-${si}" aria-label="Concluir série"
                  onclick="marcarSerie(${bi},${ei},${si},'${esc(bloco.descanso || '60s')}')">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>`).join('')}
    </div>`;
  } else {
    sets = `<div class="tiny dim" style="padding-left:31px">Sem registro de carga — execute conforme a prescrição.</div>`;
  }

  return `<div class="ex" data-ex="${esc(ex.nome)}">
    <div class="ex-head">
      <div class="ex-order">${ei + 1}</div>
      <div class="ex-name">${esc(ex.nome)}${ex.alert ? ' <span title="Atenção com a lombar">⚠️</span>' : ''}</div>
    </div>
    <div class="ex-meta">
      <span class="ex-prescr">${ex.series} × ${esc(ex.reps)}</span>
      ${ex.rir ? `<span class="chip">RIR ${esc(ex.rir)}</span>` : ''}
    </div>
    ${ult != null ? `<div class="ex-last">↑ Último registro: ${fmt(ult, 1)} kg</div>` : ''}
    ${ex.tip ? `<div class="ex-tip ${ex.alert ? 'alert' : ''}">${ex.alert ? '<b>ATENÇÃO — LOMBAR.</b> ' : ''}${esc(ex.tip)}</div>` : ''}
    ${sets}
  </div>`;
}

/** Maior carga registrada para o exercício na sessão mais recente que o contém. */
function ultimoPeso(nome) {
  for (let i = state.sessions.length - 1; i >= 0; i--) {
    const s = state.sessions[i];
    const arr = s.ex && s.ex[nome];
    if (arr && arr.length) {
      const pesos = arr.map(x => x && x.kg).filter(v => typeof v === 'number' && v > 0);
      if (pesos.length) return Math.max(...pesos);
    }
  }
  return null;
}

function setLog(bi, ei, si, campo, valor) {
  const w = state.tabTreino;
  const ex = WORKOUTS[w].blocos[bi].exercicios[ei];
  state.logs[w] = state.logs[w] || {};
  state.logs[w][ex.nome] = state.logs[w][ex.nome] || [];
  const arr = state.logs[w][ex.nome];
  while (arr.length <= si) arr.push({});
  const n = parseFloat(String(valor).replace(',', '.'));
  arr[si][campo] = isNaN(n) ? null : n;
  save();
}

function marcarSerie(bi, ei, si, descanso) {
  const w = state.tabTreino;
  const ex = WORKOUTS[w].blocos[bi].exercicios[ei];
  const btn = $(`#ok-${bi}-${ei}-${si}`);
  const row = $(`#row-${bi}-${ei}-${si}`);
  const feito = !btn.classList.contains('done');
  btn.classList.toggle('done', feito);
  row.classList.toggle('done', feito);

  state.logs[w] = state.logs[w] || {};
  state.logs[w][ex.nome] = state.logs[w][ex.nome] || [];
  while (state.logs[w][ex.nome].length <= si) state.logs[w][ex.nome].push({});
  state.logs[w][ex.nome][si].ok = feito;
  save();

  if (feito) {
    const seg = parseInt(String(descanso).replace(/\D/g, ''), 10) || 60;
    iniciarDescanso(seg);
  }
}

/** Repõe na tela o que já foi digitado nesta sessão. */
function restaurarLogs(w) {
  const dados = state.logs[w];
  if (!dados) return;
  WORKOUTS[w].blocos.forEach((b, bi) => b.exercicios.forEach((ex, ei) => {
    const arr = dados[ex.nome];
    if (!arr) return;
    arr.forEach((s, si) => {
      if (!s) return;
      const kg = $(`#kg-${bi}-${ei}-${si}`), r = $(`#r-${bi}-${ei}-${si}`), ok = $(`#ok-${bi}-${ei}-${si}`);
      if (kg && s.kg != null) kg.value = s.kg;
      if (r && s.r != null) r.value = s.r;
      if (ok && s.ok) { ok.classList.add('done'); $(`#row-${bi}-${ei}-${si}`)?.classList.add('done'); }
    });
  }));
}

function salvarSessao() {
  const w = state.tabTreino;
  const dados = state.logs[w] || {};
  const temAlgo = Object.values(dados).some(arr => arr.some(s => s && (s.kg || s.r || s.ok)));
  if (!temAlgo) { toast('Registre ao menos uma série antes de salvar', 'err'); return; }

  state.sessions.push({
    d: hoje(),
    w,
    dur: sessao.ativa ? Math.round((Date.now() - sessao.inicio) / 60000) : null,
    ex: JSON.parse(JSON.stringify(dados))
  });
  state.logs[w] = {};
  save();
  pararSessao();

  const btn = $('#btnSalvarTreino');
  if (btn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Treino salvo!';
    setTimeout(() => renderTreino(), 1400);
  }
  toast('Treino salvo. Bom trabalho.', 'ok');
  renderHeader();
}

/* ---------- vistas auxiliares do treino ---------- */
function viewCasa() {
  const H = HOME;
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="card-row">
        <div>
          <div class="tiny" style="color:var(--violet-lt);text-transform:uppercase;letter-spacing:.12em;font-weight:700">Fora da academia</div>
          <div class="h-lg" style="margin-top:3px">🏠 ${esc(H.nome)}</div>
        </div>
        <div style="text-align:right">
          <div class="num" style="font-size:26px;color:var(--violet-lt)">${H.min}<span style="font-size:13px;color:var(--txt-3)"> min</span></div>
          <div class="tiny dim">todo dia</div>
        </div>
      </div>
      <p class="small muted" style="margin-top:11px">${esc(H.nota)}</p>
    </div>

    <div class="note w">
      <div class="note-t">🌙 Por que à noite, e não junto com a bike</div>
      ${esc(H.porqueNoite)}
    </div>

    <div class="note t">
      <div class="note-t">🎒 O que você precisa</div>
      ${esc(H.material)}
    </div>

    <div class="note d">
      <div class="note-t">🏟️ Sem areia: o que muda</div>
      ${esc(H.avisoPisoFirme)}
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">A rotação da semana</h2><span class="sec-action">algo todo dia</span></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Dia</th><th>Sessão</th><th>Contatos</th><th>Intensidade</th></tr></thead>
        <tbody>${H.rotacao.map(r => `<tr${r.dia === ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date().getDay()] ? ' class="is-now"' : ''}>
          <td><b>${esc(r.dia)}</b></td><td>${esc(r.sessao)}</td>
          <td class="n">${esc(r.contatos)}</td><td class="dim">${esc(r.intensidade)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
      <p class="tiny dim" style="margin-top:9px">${esc(H.notaRotacao)}</p>
    </div>

    ${H.sessoes.map(sx => `
      <div class="glass block">
        <div class="block-head" style="background:linear-gradient(135deg,${sx.cor}22,transparent)">
          <span class="block-title">${esc(sx.nome)}</span>
          <span style="display:flex;gap:6px"><span class="chip">${esc(sx.quando)}</span><span class="chip t">${sx.min} min</span></span>
        </div>
        <div class="block-note">${esc(sx.contatos)}</div>
        ${sx.passos.map(x => `<div class="ex" style="padding:11px 14px">
          <div style="display:flex;gap:11px;align-items:flex-start">
            <span class="chip v" style="min-width:76px;justify-content:center;flex-shrink:0">${esc(x.t)}</span>
            <span style="font-size:13px;line-height:1.6">${esc(x.o)}</span>
          </div>
        </div>`).join('')}
      </div>`).join('')}

    <div class="glass block">
      <div class="block-head" style="background:linear-gradient(135deg,#a78bfa22,transparent)">
        <span class="block-title">${esc(H.coluna.nome)}</span>
        <span class="chip t">todo dia</span>
      </div>
      <div class="block-note">${esc(H.coluna.metodo)}</div>
      ${H.coluna.exercicios.map((e, i) => `
        <div class="ex">
          <div class="ex-head"><div class="ex-order">${i + 1}</div><div class="ex-name">${esc(e.nome)}</div></div>
          <div class="ex-meta"><span class="ex-prescr">${esc(e.prescr)}</span></div>
          <div class="ex-tip">${esc(e.tip)}</div>
        </div>`).join('')}
    </div>

    <div class="note d">
      <div class="note-t">🚫 Nunca</div>
      <ul class="bullets cross" style="margin-top:7px">${H.nunca.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    </div>

    <div class="note d">
      <div class="note-t">🩺 ${esc(RED_FLAGS.titulo)}</div>
      <ul class="bullets cross" style="margin-top:7px">${RED_FLAGS.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <p class="tiny dim" style="margin-top:10px">${esc(RED_FLAGS.nota)}</p>
    </div>`;
}

function viewBike() {
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="tiny" style="color:var(--turq-lt);text-transform:uppercase;letter-spacing:.12em;font-weight:700">Sua pergunta</div>
      <div class="h-md" style="margin-top:4px;margin-bottom:8px">Aumentar a carga ou pedalar mais rápido?</div>
      <p class="small muted">${esc(BIKE.veredito)}</p>
    </div>

    <div class="note t"><div class="note-t">🎚️ Como ajustar na prática</div>${esc(BIKE.regraCarga)}</div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Zonas de esforço</h2><span class="sec-action">FC máx ${ATHLETE.fcMax} bpm</span></div>
      <div class="glass tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Zona</th><th>% FC máx</th><th>BPM</th><th>RPE</th><th>RPM</th><th>Teste da fala</th></tr></thead>
          <tbody>${BIKE.zonas.map(z => `<tr>
            <td><b>${esc(z.nome)}</b></td><td>${esc(z.pct)}</td><td class="n">${esc(z.bpm)}</td>
            <td class="n">${esc(z.rpe)}</td><td class="n">${esc(z.rpm)}</td><td class="dim">${esc(z.fala)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">As 3 sessões</h2></div>
      ${BIKE.sessoes.map(s => `
        <div class="glass block">
          <div class="block-head" style="background:linear-gradient(135deg,${s.cor}22,transparent)">
            <span class="block-title">${esc(s.nome)}</span>
            <span style="display:flex;gap:6px"><span class="chip">${esc(s.freq)}</span><span class="chip t">~${s.kcal} kcal</span></span>
          </div>
          <div class="block-note">${esc(s.resumo)}</div>
          ${s.passos.map(p => `<div class="ex" style="padding:11px 14px">
            <div style="display:flex;gap:11px;align-items:flex-start">
              <span class="chip v" style="min-width:74px;justify-content:center">${esc(p.t)}</span>
              <span style="font-size:13px;line-height:1.55">${esc(p.o)}</span>
            </div>
          </div>`).join('')}
        </div>`).join('')}
    </div>

    <div class="note"><div class="note-t">🪑 Ajuste da bike para proteger o disco</div>
      <ul class="bullets" style="margin-top:7px">${BIKE.postura.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    </div>
    <div class="note d"><div class="note-t">🛑 Sinais para parar</div>${esc(BIKE.alerta)}</div>`;
}


/* ============================================================
   CRONÔMETRO DE SESSÃO
   ============================================================ */
const sessao = { ativa: false, inicio: 0, timer: null };

function iniciarSessao() {
  if (sessao.ativa) { pararSessao(); return; }
  sessao.ativa = true;
  sessao.inicio = Date.now();
  $('#sessionClock').style.display = 'inline-flex';
  sessao.timer = setInterval(tickSessao, 1000);
  tickSessao();
  toast('Cronômetro iniciado. Meta: 40 minutos.', 'ok');
}
function pararSessao() {
  sessao.ativa = false;
  clearInterval(sessao.timer);
  const el = $('#sessionClock');
  if (el) el.style.display = 'none';
}
function tickSessao() {
  const s = Math.floor((Date.now() - sessao.inicio) / 1000);
  const el = $('#sessionClockTxt');
  if (!el) return pararSessao();
  el.textContent = `${Math.floor(s / 60)}:${pad2(s % 60)}`;
  $('#sessionClock').classList.toggle('over', s > 40 * 60);
}

/* ============================================================
   TIMER DE DESCANSO
   ============================================================ */
const rest = { restante: 0, total: 0, timer: null };

function iniciarDescanso(seg) {
  clearInterval(rest.timer);
  rest.total = rest.restante = seg;
  $('#restTimer').classList.add('show');
  pintarDescanso();
  rest.timer = setInterval(() => {
    rest.restante--;
    if (rest.restante <= 0) { fimDescanso(); return; }
    pintarDescanso();
  }, 1000);
}
function pintarDescanso() {
  const m = Math.floor(rest.restante / 60), s = rest.restante % 60;
  const el = $('#rtTime');
  el.textContent = `${m}:${pad2(s)}`;
  el.classList.toggle('ending', rest.restante <= 10);
  $('#rtBar').style.width = (rest.restante / rest.total * 100) + '%';
  $('#rtLabel').textContent = rest.restante <= 10 ? 'Prepare-se' : 'Descanso';
}
function fimDescanso() {
  clearInterval(rest.timer);
  $('#restTimer').classList.remove('show');
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  bip();
  toast('Descanso encerrado — próxima série', 'ok');
}
function restAdd(s) { rest.restante += s; rest.total = Math.max(rest.total, rest.restante); pintarDescanso(); }
function restSkip() { fimDescanso(); }

/** Bip curto via WebAudio — sem arquivo externo, funciona offline. */
function bip() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.16, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.36);
    setTimeout(() => ctx.close(), 600);
  } catch (e) { /* áudio bloqueado pelo navegador — silencioso de propósito */ }
}

/* ============================================================
   TELA — DIETA
   ============================================================ */
const DIETA_TABS = [
  { id: 'cardapio', label: '🍽️ Cardápio' },
  { id: 'energia', label: '🔋 Energia' },
  { id: 'livres', label: '🍕 Refeições livres' },
  { id: 'supl', label: '💊 Suplementos' }
];

function renderDietaTabs() {
  $('#dietaTabs').innerHTML = DIETA_TABS.map(t =>
    `<button class="seg ${state.tabDieta === t.id ? 'active' : ''}" onclick="setTabDieta('${t.id}')">${t.label}</button>`
  ).join('');
}
function setTabDieta(id) { state.tabDieta = id; save(); renderDietaTabs(); renderDieta(); }

function renderDieta() {
  renderDietaTabs();
  const c = $('#dietaContent');
  if (state.tabDieta === 'energia') return void (c.innerHTML = viewEnergia());
  if (state.tabDieta === 'livres')  return void (c.innerHTML = viewLivres());
  if (state.tabDieta === 'supl')    return void (c.innerHTML = viewSupl());
  c.innerHTML = viewCardapio();
  desenharAnel();
}

function viewCardapio() {
  const dt = DAYTYPES[planoDoDia().tipo];
  const feitos = state.mealDone[hoje()] || {};

  // consumo do dia = soma das refeições marcadas como feitas
  let cons = { kcal: 0, p: 0, c: 0, g: 0 };
  DIET.forEach(m => {
    if (!feitos[m.id]) return;
    const o = m.opcoes[state.mealOpt[m.id] || 0];
    const s = somaItens(o.itens);
    cons.kcal += s.kcal; cons.p += s.p; cons.c += s.c; cons.g += s.g;
  });

  let h = `
    <div class="glass-hi card glow-ring" style="padding:16px;margin-bottom:14px">
      <div class="ring-wrap">
        <div class="ring">
          <svg viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="52" stroke-width="11"></circle>
            <circle class="ring-fg" id="ringFg" cx="60" cy="60" r="52" stroke-width="11"
                    stroke-dasharray="326.7" stroke-dashoffset="326.7"></circle>
          </svg>
          <div class="ring-center">
            <div class="ring-num">${fmt(cons.kcal)}</div>
            <div class="ring-lbl">de ${fmt(dt.kcal)}</div>
          </div>
        </div>
        <div style="flex:1;min-width:0">
          <div class="tiny dim" style="text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:9px">${esc(dt.nome)}</div>
          ${macroBar('Proteína', cons.p, dt.prot, 'linear-gradient(90deg,#34d399,#2dd4bf)')}
          ${macroBar('Carbo', cons.c, dt.carb, 'linear-gradient(90deg,#a78bfa,#8b5cf6)')}
          ${macroBar('Gordura', cons.g, dt.gord, 'linear-gradient(90deg,#fbbf24,#e879f9)')}
        </div>
      </div>
      <p class="tiny dim" style="margin-top:12px">Marque cada refeição como feita para acompanhar o dia. O total zera automaticamente à meia-noite.</p>
    </div>

    <div class="note t">
      <div class="note-t">📌 Como usar</div>
      Cada refeição tem <b>5 opções equivalentes</b> — escolha qualquer uma, elas foram desenhadas para bater a mesma meta.
      Os totais são somados a partir dos itens, então você pode conferir grama por grama.
      Valores da <b>TACO (Unicamp)</b>; industrializados marcados conforme rótulo típico.
    </div>
  `;

  DIET.forEach(m => {
    const sel = state.mealOpt[m.id] || 0;
    const opt = m.opcoes[sel];
    const s = somaItens(opt.itens);
    const done = !!feitos[m.id];
    h += `
      <div class="glass meal" id="meal-${m.id}">
        <div class="meal-hd" onclick="toggleMeal('${m.id}')">
          <div class="meal-ico">${m.icone}</div>
          <div style="flex:1;min-width:0">
            <div class="meal-name">${esc(m.nome)}</div>
            <div class="meal-time">${esc(m.hora)} · alvo ${fmt(m.alvo)} kcal</div>
          </div>
          <div>
            <div class="meal-kcal">${fmt(s.kcal)}<small> kcal</small></div>
            <div class="meal-prot">${fmt(s.p)} g proteína</div>
          </div>
          <svg class="chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="meal-body">
          ${m.nota ? `<p class="tiny dim" style="margin-bottom:11px;line-height:1.6">${esc(m.nota)}</p>` : ''}
          <div class="segmented" style="margin-bottom:11px">
            ${m.opcoes.map((o, oi) => `<button class="seg ${sel === oi ? 'active' : ''}" onclick="escolherOpcao('${m.id}',${oi})">${esc(o.label)}</button>`).join('')}
          </div>
          ${opt.itens.map(i => `
            <div class="food">
              <div style="min-width:0">
                <div class="food-name">${esc(i.n)} <span class="dim">· ${esc(i.q)}</span></div>
                ${i.prep ? `<div class="food-prep">💡 ${esc(i.prep)}</div>` : ''}
              </div>
              <div class="food-macros">
                <div class="food-kcal">${fmt(i.kcal)}</div>
                <div class="food-prot">${fmt(i.p, 1)}g P</div>
              </div>
            </div>`).join('')}
          <div class="meal-total">
            <span style="font-size:12.5px;font-weight:650">Total desta opção</span>
            <b>${fmt(s.kcal)} kcal · P ${fmt(s.p)} · C ${fmt(s.c)} · G ${fmt(s.g)}</b>
          </div>
          <button class="btn ${done ? 'btn-ok' : ''} btn-block" style="margin-top:10px" onclick="marcarRefeicao('${m.id}')">
            ${done ? '✓ Refeição registrada' : 'Marcar como feita'}
          </button>
        </div>
      </div>`;
  });

  return h;
}

function macroBar(nome, atual, alvo, grad) {
  const pct = clamp(atual / alvo * 100, 0, 100);
  return `<div class="macro-row">
    <span class="macro-key">${nome}</span>
    <span class="macro-bar"><i style="width:${pct}%;background:${grad}"></i></span>
    <span class="macro-num">${fmt(atual)} / ${fmt(alvo)} g</span>
  </div>`;
}

function desenharAnel() {
  const el = $('#ringFg');
  if (!el) return;
  const dt = DAYTYPES[planoDoDia().tipo];
  const feitos = state.mealDone[hoje()] || {};
  let kcal = 0;
  DIET.forEach(m => {
    if (!feitos[m.id]) return;
    kcal += somaItens(m.opcoes[state.mealOpt[m.id] || 0].itens).kcal;
  });
  const circ = 2 * Math.PI * 52;
  const pct = clamp(kcal / dt.kcal, 0, 1);
  // Aplicado de forma síncrona: requestAnimationFrame não dispara em aba oculta,
  // o que deixaria o anel vazio. A animação fica por conta da transition do CSS.
  el.setAttribute('stroke-dasharray', circ.toFixed(1));
  el.style.strokeDashoffset = (circ * (1 - pct)).toFixed(1);
  el.style.stroke = kcal > dt.kcal * 1.05 ? 'var(--danger)' : 'url(#ringGrad)';
}

function toggleMeal(id) { $('#meal-' + id)?.classList.toggle('open'); }

function escolherOpcao(id, oi) {
  state.mealOpt[id] = oi;
  save();
  renderDieta();
  $('#meal-' + id)?.classList.add('open');
}

function marcarRefeicao(id) {
  const d = hoje();
  state.mealDone[d] = state.mealDone[d] || {};
  state.mealDone[d][id] = !state.mealDone[d][id];
  // mantém só os últimos 14 dias para o armazenamento não crescer sem limite
  Object.keys(state.mealDone).forEach(k => { if (diasEntre(k, d) > 14) delete state.mealDone[k]; });
  save();
  renderDieta();
  $('#meal-' + id)?.classList.add('open');
}

function viewEnergia() {
  const t = ENERGY.tmb;
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">🔋 Quanto você gasta</div>
      <p class="small muted" style="margin-top:8px">Todos os números abaixo saem de fórmulas abertas — nada é chute. A conta está ao lado de cada valor para você conferir.</p>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Metabolismo basal</h2><span class="sec-action">o que você gasta parado</span></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Equação</th><th>Resultado</th><th>Observação</th></tr></thead>
        <tbody>
          <tr><td>Mifflin-St Jeor</td><td class="n">${fmt(t.mifflin)} kcal</td><td class="dim">10×94 + 6,25×185 − 5×28 + 5</td></tr>
          <tr><td>Harris-Benedict revisada</td><td class="n">${fmt(t.harris)} kcal</td><td class="dim">tende a superestimar ~5%</td></tr>
          <tr><td>Katch-McArdle</td><td class="n">${fmt(t.katch)} kcal</td><td class="dim">370 + 21,6 × massa magra (74,3 kg)</td></tr>
          <tr class="is-now"><td><b>Adotado</b></td><td class="n"><b>${fmt(t.usado)} kcal</b></td><td class="dim">a mais validada</td></tr>
        </tbody>
      </table></div>
      <p class="tiny dim" style="margin-top:9px">${esc(t.nota)}</p>
    </div>

    <div class="note w">
      <div class="note-t">⚠️ Por que não uso "multiplicador de atividade"</div>
      Multiplicar a TMB por 1,725 ("treina 4-6×/semana") daria <b>3.383 kcal</b>. Mas esse fator assume sessões de 60-90 min todo dia,
      inclusive no domingo parado — e as suas têm 40 min. O erro seria de <b>~390 kcal/dia</b>, ou 2,5 kg "perdidos no papel" em 7 semanas.
      Aqui uso o <b>método aditivo</b>: base sedentária de ${fmt(ENERGY.base)} kcal (TMB × 1,2) mais o gasto real de cada atividade.
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Gasto por atividade</h2><span class="sec-action">líquido</span></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Atividade</th><th>MET</th><th>Duração</th><th>Gasto líquido</th></tr></thead>
        <tbody>${ENERGY.atividades.map(a => `<tr>
          <td><b>${esc(a.nome)}</b><div class="tiny dim">${esc(a.desc)}</div></td>
          <td class="n">${a.met}</td><td class="n">${a.min} min</td><td class="n" style="color:var(--turq-lt)">${fmt(a.liquido)} kcal</td>
        </tr>`).join('')}</tbody>
      </table></div>
      <p class="tiny dim" style="margin-top:9px">${esc(ENERGY.formula)}</p>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Meta calórica por tipo de dia</h2></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Tipo de dia</th><th>Gasto</th><th>Comer</th><th>Déficit</th><th>P / C / G</th></tr></thead>
        <tbody>${Object.values(DAYTYPES).map(d => `<tr>
          <td><b style="color:${d.cor}">${esc(d.nome)}</b><div class="tiny dim">${esc(d.desc)}</div></td>
          <td class="n">${fmt(d.tdee)}</td>
          <td class="n" style="color:var(--turq-lt)"><b>${fmt(d.kcal)}</b></td>
          <td class="n">−${fmt(d.tdee - d.kcal)}</td>
          <td class="n">${d.prot} / ${d.carb} / ${d.gord} g</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Balanço da semana</h2></div>
      <div class="stat-grid">
        ${statCard(fmt(WEEKLY.tdee), 'Gasto semanal', 'soma dos 7 dias')}
        ${statCard(fmt(WEEKLY.ingestao), 'Ingestão semanal', 'já inclui as 2 livres')}
        ${statCard('−' + fmt(WEEKLY.deficit), 'Déficit semanal', fmt(WEEKLY.pctPeso, 2) + '% do peso corporal', 'var(--ok)')}
        ${statCard(fmt(WEEKLY.kgSemana, 2) + ' kg', 'Perda por semana', 'de gordura', 'var(--ok)')}
      </div>
      <p class="tiny dim" style="margin-top:10px">${esc(WEEKLY.nota)}</p>
    </div>

    <div class="note o">
      <div class="note-t">🎯 Projeção honesta até o torneio</div>
      <b>${fmt(PROJECTION.gorduraPerdida, 1)} kg de gordura</b> em 6 semanas de déficit, mais
      <b>~${fmt(PROJECTION.aguaGlicogenio, 1)} kg</b> de água ligada ao glicogênio na largada =
      <b>${fmt(PROJECTION.totalBalanca, 1)} kg na balança</b>, chegando a <b>${fmt(PROJECTION.pesoEm2009, 1)} kg em 20/09</b>.
      <p style="margin-top:9px">${esc(PROJECTION.recado)}</p>
      <p style="margin-top:9px">${esc(PROJECTION.metaOriginal)}</p>
    </div>`;
}

function viewLivres() {
  const f = FREE_MEALS;
  const badge = v => v === 'ok' ? 'o' : v === 'med' ? 'w' : 'd';
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">🍕 Refeições livres</div>
      <div class="chip f" style="margin-top:8px">${esc(f.quando)} · teto de ${fmt(f.teto)} kcal</div>
      <p class="small muted" style="margin-top:11px">${esc(f.regra)}</p>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">O que cada cenário custa</h2></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Se a refeição livre for</th><th>Excesso semanal</th><th>Perda resultante</th></tr></thead>
        <tbody>${f.matematica.map(m => `<tr>
          <td><b>${esc(m.cenario)}</b><div class="tiny dim">${esc(m.nota)}</div></td>
          <td class="n">${esc(m.excesso)}</td>
          <td><span class="chip ${badge(m.veredito)}">${esc(m.resultado)}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="note"><div class="note-t">✅ Como aproveitar sem perder o progresso</div>
      <ul class="bullets" style="margin-top:7px">${f.dicas.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    </div>
    <div class="note t"><div class="note-t">🍽️ Sugestões que cabem no teto</div>
      <ul class="bullets check" style="margin-top:7px">${f.sugestoes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>`;
}

function viewSupl() {
  const cor = p => p === 'alta' ? 'o' : p === 'media' ? 'v' : '';
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">💊 Suplementos com evidência</div>
      <p class="small muted" style="margin-top:8px">Só o que tem respaldo. Nada de "queimador de gordura".</p>
    </div>
    ${SUPPS.map(s => `
      <div class="glass card">
        <div class="card-row" style="margin-bottom:7px">
          <div class="h-md">${esc(s.nome)}</div>
          <span class="chip ${cor(s.prio)}">${s.prio === 'alta' ? 'prioridade' : s.prio === 'media' ? 'útil' : 'opcional'}</span>
        </div>
        <div class="small" style="color:var(--turq-lt);font-weight:600">${esc(s.dose)}</div>
        <div class="tiny dim" style="margin:3px 0 8px">${esc(s.quando)}</div>
        <p class="small muted">${esc(s.nota)}</p>
      </div>`).join('')}
    <div class="note d"><div class="note-t">🚫 O que evitar</div>${esc(SUPPS_EVITAR)}</div>`;
}

/* ============================================================
   TELA — PLANO
   ============================================================ */
const PLANO_TABS = [
  { id: 'periodizacao', label: '📅 7 semanas' },
  { id: 'torneio', label: '🏆 Torneio' },
  { id: 'lombar', label: '🦴 Lombar' },
  { id: 'fontes', label: '📚 Fontes' }
];

function renderPlanoTabs() {
  $('#planoTabs').innerHTML = PLANO_TABS.map(t =>
    `<button class="seg ${state.tabPlano === t.id ? 'active' : ''}" onclick="setTabPlano('${t.id}')">${t.label}</button>`
  ).join('');
}
function setTabPlano(id) { state.tabPlano = id; save(); renderPlanoTabs(); renderPlano(); }

function renderPlano() {
  renderPlanoTabs();
  const c = $('#planoContent');
  if (state.tabPlano === 'torneio') return void (c.innerHTML = viewTorneio());
  if (state.tabPlano === 'lombar')  return void (c.innerHTML = viewLombar());
  if (state.tabPlano === 'fontes')  return void (c.innerHTML = viewFontes());
  c.innerHTML = viewPeriodizacao();
}

function viewPeriodizacao() {
  const atual = semanaAtual();
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">📅 Sete semanas até o torneio</div>
      <p class="small muted" style="margin-top:8px">
        Cinco semanas de carga real, depois duas de taper. A meta-análise de Bosquet mostra que o taper ideal
        corta <b>40-60% do volume mantendo a intensidade</b> — cortar peso destrói o efeito. Esse é o erro nº1 de amador.
      </p>
    </div>

    ${PERIODIZATION.map(p => {
      const eAtual = atual && atual.s === p.s;
      return `<div class="${eAtual ? 'glass-hi glow-ring' : 'glass'} card" style="padding:15px">
        <div class="card-row" style="margin-bottom:10px">
          <div style="min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="chip ${p.destaque ? 'f' : eAtual ? 'v' : ''}">Semana ${p.s}</span>
              ${eAtual ? '<span class="chip o">você está aqui</span>' : ''}
            </div>
            <div class="h-md" style="margin-top:6px">${esc(p.bloco)}</div>
            <div class="tiny dim">${dataCurta(p.ini)} a ${dataCurta(p.fim)}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div class="num" style="font-size:21px;color:var(--turq-lt)">${fmt(p.peso, 1)}<span style="font-size:12px;color:var(--txt-3)"> kg</span></div>
            <div class="tiny dim">meta da semana</div>
          </div>
        </div>
        <p class="small muted" style="margin-bottom:10px">${esc(p.foco)}</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:10px">
          ${miniStat('Carga', p.carga)}${miniStat('Volume', p.volume)}
          ${miniStat('Bike', p.cardio)}${miniStat('Casa', p.casa)}
        </div>
        <div class="note ${p.destaque ? 'w' : 't'}" style="margin:0">${esc(p.nota)}</div>
      </div>`;
    }).join('')}

    <div class="note o">
      <div class="note-t">📈 Depois do torneio: rumo aos 83 kg</div>
      De 28/09 a 02/10, cinco dias de descarga — bike leve, mobilidade, core, calorias na manutenção.
      A partir de 05/10 retome o programa com um <b>déficit menor, de 350 a 450 kcal/dia</b>.
      De ~89 kg para 83 kg em 13,5 semanas dá <b>0,4 kg por semana</b> — ritmo confortável, com margem para semanas ruins
      e para uma semana de manutenção a cada 6 ou 8.
      <br><br>Marcos de controle: <b>≤86 kg em 31/10</b> e <b>≤84,5 kg em 30/11</b>.
    </div>`;
}

function miniStat(k, v) {
  return `<div style="padding:9px 11px;border-radius:10px;background:rgba(255,255,255,.04)">
    <div class="tiny dim" style="text-transform:uppercase;letter-spacing:.08em;font-weight:700">${k}</div>
    <div style="font-size:12.5px;font-weight:600;margin-top:2px">${esc(v)}</div>
  </div>`;
}

function viewTorneio() {
  const t = TOURNAMENT;
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">🏆 Semana do torneio</div>
      <div class="chip f" style="margin-top:8px">${esc(t.data)}</div>
    </div>

    <div class="note w"><div class="note-t">⚖️ Leia isto antes de subir na balança</div>${esc(t.avisoPeso)}</div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Dia a dia da semana final</h2></div>
      ${t.contagem.map(c => `<div class="glass card" style="padding:13px 15px">
        <div style="display:flex;gap:11px;align-items:flex-start">
          <span class="chip v" style="min-width:82px;justify-content:center;flex-shrink:0">${esc(c.d)}</span>
          <span class="small" style="line-height:1.6">${esc(c.o)}</span>
        </div>
      </div>`).join('')}
    </div>

    <div class="note t"><div class="note-t">🍚 Café da manhã do dia do jogo</div>${esc(t.refeicaoPre)}</div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Aquecimento RAMP — 16 min, inegociável</h2></div>
      ${t.ramp.map(r => `<div class="glass card" style="padding:13px 15px">
        <div class="h-md" style="font-size:14.5px;margin-bottom:5px">${esc(r.f)}</div>
        <p class="small muted">${esc(r.o)}</p>
      </div>`).join('')}
    </div>

    <div class="note"><div class="note-t">💧 Durante o jogo</div>${esc(t.durante)}</div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Entre um jogo e outro</h2></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Intervalo</th><th>O que comer</th></tr></thead>
        <tbody>${t.entreJogos.map(j => `<tr><td><b>${esc(j.j)}</b></td><td>${esc(j.o)}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="note o"><div class="note-t">🔄 Recuperação</div>${esc(t.recuperacao)}</div>
    <div class="note t"><div class="note-t">💦 Hidratação</div>${esc(t.hidratacao)}</div>
    <div class="note d"><div class="note-t">❌ Os 10 erros clássicos</div>
      <ul class="bullets cross" style="margin-top:7px">${t.erros.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
    </div>`;
}

function viewLombar() {
  const L = LUMBAR;
  const cor = n => n === 'ok' ? 'var(--ok)' : n === 'med' ? 'var(--warn)' : n === 'alto' ? '#fb923c' : 'var(--danger)';
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">🦴 Guia da lombar</div>
      <p class="small muted" style="margin-top:8px">${esc(L.contexto)}</p>
    </div>

    <div class="note w"><div class="note-t">🔍 Por que dói DEPOIS dos jogos, não durante</div>${esc(L.porqueDoi)}</div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">${esc(L.pressao.titulo)}</h2></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Posição</th><th>Pressão (MPa)</th></tr></thead>
        <tbody>${L.pressao.linhas.map(l => `<tr>
          <td>${esc(l.pos)}</td>
          <td class="n" style="color:${cor(l.nivel)}">${esc(l.v)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
      <p class="tiny dim" style="margin-top:9px">${esc(L.pressao.fonte)} Levantar 20 kg de costas arredondadas gera <b>23× mais pressão</b> do que estar deitado.</p>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Exercícios que você não deve fazer</h2></div>
      ${L.proibidos.map(p => `<div class="glass card" style="padding:13px 15px;border-left:3px solid var(--danger)">
        <div class="h-md" style="font-size:14.5px;color:var(--danger)">✕ ${esc(p.ex)}</div>
        <p class="small muted" style="margin-top:5px">${esc(p.pq)}</p>
      </div>`).join('')}
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Troque por isto</h2><span class="sec-action">mesmo estímulo, coluna descarregada</span></div>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Em vez de</th><th>Faça</th></tr></thead>
        <tbody>${L.substituicoes.map(s => `<tr>
          <td style="color:var(--danger)">${esc(s.de)}</td>
          <td style="color:var(--ok)"><b>${esc(s.para)}</b></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">${esc(L.testes.titulo)}</h2></div>
      <p class="small muted" style="margin-bottom:11px">${esc(L.testes.intro)}</p>
      <div class="glass tbl-wrap"><table class="tbl">
        <thead><tr><th>Teste</th><th>Norma masculina</th><th>O que significa</th></tr></thead>
        <tbody>${L.testes.itens.map(i => `<tr>
          <td><b>${esc(i.nome)}</b></td><td class="n">${esc(i.norma)}</td><td class="dim">${esc(i.alvo)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="note d"><div class="note-t">🩺 ${esc(RED_FLAGS.titulo)}</div>
      <ul class="bullets cross" style="margin-top:7px">${RED_FLAGS.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <p class="tiny dim" style="margin-top:10px">${esc(RED_FLAGS.nota)}</p>
    </div>`;
}

function viewFontes() {
  const tags = [...new Set(REFS.map(r => r.tag))];
  return `
    <div class="glass-hi card glow-ring" style="padding:16px">
      <div class="h-lg">📚 De onde vieram as decisões</div>
      <p class="small muted" style="margin-top:8px">
        Cada escolha deste programa — do teto de 1.100 kcal na refeição livre ao formato do taper —
        veio de literatura publicada. As referências estão abaixo para você conferir ou levar ao seu médico.
      </p>
    </div>
    ${tags.map(t => `
      <div class="sec">
        <div class="sec-head"><h2 class="sec-title">${esc(t)}</h2></div>
        <div class="glass" style="border-radius:var(--r);overflow:hidden">
          ${REFS.filter(r => r.tag === t).map(r => `
            <a href="${esc(r.u)}" target="_blank" rel="noopener noreferrer"
               style="display:flex;align-items:center;justify-content:space-between;gap:11px;padding:12px 14px;border-bottom:1px solid var(--stroke);color:var(--txt)">
              <span class="small">${esc(r.t)}</span>
              <svg style="width:14px;height:14px;stroke:var(--txt-4);fill:none;stroke-width:2;flex-shrink:0" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>`).join('')}
        </div>
      </div>`).join('')}`;
}

/* ============================================================
   TELA — PROGRESSO
   ============================================================ */
function renderProgresso() {
  const p = pesoAtual();
  const perdido = ATHLETE.peso0 - p;
  const sem = semanaAtual();
  const alvoSem = sem ? sem.peso : ATHLETE.peso0;
  const desvio = p - alvoSem;

  $('#progressoContent').innerHTML = `
    <div class="glass-hi card glow-ring" style="padding:16px;margin-bottom:14px">
      <div class="h-md" style="margin-bottom:11px">Registrar peso</div>
      <div class="row">
        <input class="input input-xl" type="number" id="pesoInput" placeholder="${fmt(p, 1)}" step="0.1" min="40" max="220" inputmode="decimal">
        <button class="btn btn-primary" onclick="logWeight('pesoInput')" style="padding-inline:22px">Salvar</button>
      </div>
      <p class="tiny dim" style="margin-top:10px">De manhã, em jejum, depois do banheiro, sem roupa. Sempre nas mesmas condições.</p>
    </div>

    <div class="stat-grid" style="margin-bottom:14px">
      ${statCard(fmt(p, 1) + ' kg', 'Peso atual', state.weights.length + ' pesagens')}
      ${statCard((perdido >= 0 ? '−' : '+') + fmt(Math.abs(perdido), 1) + ' kg', 'Desde o início', fmt(Math.abs(perdido) / ATHLETE.peso0 * 100, 1) + '% do peso', perdido > 0 ? 'var(--ok)' : null)}
      ${statCard(sem ? 'S' + sem.s : '—', 'Semana atual', sem ? esc(sem.bloco) : 'fora do ciclo')}
      ${statCard((desvio > 0 ? '+' : '') + fmt(desvio, 1) + ' kg', 'Vs. plano', desvio <= 0.3 ? 'no rumo certo' : 'acima do previsto', desvio <= 0.3 ? 'var(--ok)' : 'var(--warn)')}
    </div>

    <div class="glass chart-box">
      <div class="card-row" style="margin-bottom:12px">
        <div class="h-md">Peso: real vs. planejado</div>
      </div>
      <div class="chart-canvas"><canvas id="grafPeso"></canvas></div>
      <div class="legend">
        <span class="legend-i"><span class="legend-d" style="background:#a78bfa"></span> Peso registrado</span>
        <span class="legend-i"><span class="legend-d" style="background:#22d3ee"></span> Projeção do plano</span>
        <span class="legend-i"><span class="legend-d" style="background:#34d399"></span> Meta 83 kg</span>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Treinos registrados</h2><span class="sec-action">${state.sessions.length} no total</span></div>
      <div class="glass" style="border-radius:var(--r);overflow:hidden">${listaSessoes()}</div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Pesagens</h2></div>
      <div class="glass" style="border-radius:var(--r);overflow:hidden">${listaPesagens()}</div>
    </div>`;
}

function listaSessoes() {
  if (!state.sessions.length) return vazio('Nenhum treino registrado ainda. Complete um treino para ver o histórico aqui.');
  return [...state.sessions].reverse().slice(0, 25).map((s, i) => {
    const w = WORKOUTS[s.w];
    const nEx = s.ex ? Object.keys(s.ex).length : 0;
    const idxReal = state.sessions.length - 1 - i;
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:11px;padding:12px 14px;border-bottom:1px solid var(--stroke)">
      <div style="min-width:0">
        <div style="font-weight:600;font-size:13.5px">${w ? esc(w.icone + ' ' + w.nome) : 'Treino ' + esc(s.w)}</div>
        <div class="tiny dim">${dataCurta(s.d)}${s.dur ? ` · ${s.dur} min` : ''}${nEx ? ` · ${nEx} exercícios` : ''}${s.legado ? ' · importado' : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span class="chip" style="${w ? `background:${w.cor}22;border-color:${w.cor}55;color:${w.cor}` : ''}">${esc(s.w)}</span>
        <button class="btn btn-sm" onclick="apagarSessao(${idxReal})" aria-label="Apagar" style="padding:6px 9px;color:var(--txt-4)">✕</button>
      </div>
    </div>`;
  }).join('');
}

function listaPesagens() {
  if (!state.weights.length) return vazio('Nenhuma pesagem registrada.');
  return [...state.weights].reverse().slice(0, 25).map((x, i) => {
    const idxReal = state.weights.length - 1 - i;
    const ant = idxReal > 0 ? state.weights[idxReal - 1].w : null;
    const d = ant != null ? x.w - ant : null;
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:11px;padding:11px 14px;border-bottom:1px solid var(--stroke)">
      <div>
        <div style="font-weight:600;font-size:13.5px">${fmt(x.w, 1)} kg</div>
        <div class="tiny dim">${dataCurta(x.d)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${d != null ? `<span class="chip ${d < -0.05 ? 'o' : d > 0.05 ? 'd' : ''}">${d > 0 ? '+' : ''}${fmt(d, 1)} kg</span>` : '<span class="chip">início</span>'}
        <button class="btn btn-sm" onclick="apagarPeso(${idxReal})" aria-label="Apagar" style="padding:6px 9px;color:var(--txt-4)">✕</button>
      </div>
    </div>`;
  }).join('');
}

function vazio(msg) {
  return `<div class="empty">
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    <p>${esc(msg)}</p>
  </div>`;
}

function logWeight(inputId) {
  const el = $('#' + inputId);
  const v = parseFloat(String(el.value).replace(',', '.'));
  if (!v || v < 40 || v > 220) { toast('Peso inválido', 'err'); return; }
  const d = hoje();
  const i = state.weights.findIndex(x => x.d === d);
  if (i >= 0) state.weights[i].w = v; else state.weights.push({ d, w: v });
  state.weights.sort((a, b) => a.d.localeCompare(b.d));
  save();
  el.value = '';
  renderHeader(); renderHoje();
  if ($('#screen-progresso').classList.contains('active')) { renderProgresso(); setTimeout(desenharGrafico, 60); }
  toast(`Peso registrado: ${fmt(v, 1)} kg`, 'ok');
}

function apagarPeso(i) {
  if (!confirm('Apagar esta pesagem?')) return;
  state.weights.splice(i, 1); save();
  renderHeader(); renderProgresso(); setTimeout(desenharGrafico, 60);
}
function apagarSessao(i) {
  if (!confirm('Apagar este treino do histórico?')) return;
  state.sessions.splice(i, 1); save(); renderProgresso();
}

/* ---------- gráfico ---------- */
let chart = null;

function desenharGrafico() {
  const cv = $('#grafPeso');
  if (!cv || typeof Chart === 'undefined') return;
  if (chart) { chart.destroy(); chart = null; }

  // eixo: início do programa + fim de cada uma das 7 semanas
  const labels = ['10/08', ...PERIODIZATION.map(p => dataCurta(p.fim))];
  const projecao = [ATHLETE.peso0, ...PERIODIZATION.map(p => p.peso)];

  // encaixa cada pesagem real no marco de semana mais próximo
  const real = new Array(labels.length).fill(null);
  if (state.weights.length) {
    const marcos = [ATHLETE.inicio, ...PERIODIZATION.map(p => p.fim)];
    state.weights.forEach(x => {
      let melhor = 0, dist = Infinity;
      marcos.forEach((m, i) => {
        const dd = Math.abs(diasEntre(m, x.d));
        if (dd < dist) { dist = dd; melhor = i; }
      });
      if (dist <= 5) real[melhor] = x.w;
    });
    // garante que a pesagem mais recente sempre apareça
    const ult = state.weights[state.weights.length - 1];
    if (!real.some(v => v != null)) real[0] = ult.w;
  }

  const grad = cv.getContext('2d').createLinearGradient(0, 0, 0, 210);
  grad.addColorStop(0, 'rgba(167,139,250,.30)');
  grad.addColorStop(1, 'rgba(167,139,250,0)');

  chart = new Chart(cv.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Peso registrado', data: real, borderColor: '#a78bfa', backgroundColor: grad,
          pointBackgroundColor: '#a78bfa', pointBorderColor: '#0d0a1a', pointBorderWidth: 2,
          pointRadius: 5, pointHoverRadius: 7, borderWidth: 3, tension: .35, fill: true, spanGaps: true },
        { label: 'Projeção do plano', data: projecao, borderColor: '#22d3ee', borderDash: [6, 5],
          pointRadius: 0, borderWidth: 2, tension: .35, fill: false },
        { label: 'Meta final', data: labels.map(() => ATHLETE.metaFinal), borderColor: '#34d399',
          borderDash: [2, 4], pointRadius: 0, borderWidth: 1.5, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(18,14,34,.96)', borderColor: 'rgba(255,255,255,.17)', borderWidth: 1,
          titleColor: '#f4f2ff', bodyColor: '#b9b3d4', padding: 11, cornerRadius: 10, displayColors: true,
          callbacks: { label: c => c.parsed.y == null ? null : ` ${c.dataset.label}: ${fmt(c.parsed.y, 1)} kg` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#7d769b', font: { size: 10.5 } }, border: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#7d769b', font: { size: 10.5 }, callback: v => v + ' kg' },
             border: { display: false }, suggestedMin: 82, suggestedMax: 95 }
      }
    }
  });
}

/* ============================================================
   TELA — AJUSTES
   ============================================================ */
function renderAjustes() {
  $('#ajustesContent').innerHTML = `
    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Perfil</h2></div>
      <div class="glass" style="border-radius:var(--r);overflow:hidden">
        ${cfg('Nome', ATHLETE.nome)}
        ${cfg('Altura / idade', `${(ATHLETE.altura / 100).toFixed(2).replace('.', ',')} m · ${ATHLETE.idade} anos`)}
        ${cfg('Peso inicial', fmt(ATHLETE.peso0, 1) + ' kg')}
        ${cfg('Meta no torneio', fmt(ATHLETE.metaTorneio, 1) + ' kg', null, true)}
        ${cfg('Meta em 31/12', fmt(ATHLETE.metaFinal, 1) + ' kg', null, true)}
        ${cfg('Condição', ATHLETE.condicao)}
        ${cfg('Academia', ATHLETE.academia)}
        ${cfg('TMB / FC máxima', `${fmt(ENERGY.tmb.usado)} kcal · ${ATHLETE.fcMax} bpm`)}
      </div>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Sincronizar entre dispositivos</h2></div>
      <div class="glass" style="border-radius:var(--r);overflow:hidden">
        <div class="cfg-row stack">
          <div><div class="cfg-k">Token do GitHub</div>
            <div class="cfg-s">Crie em github.com/settings/tokens → New token (classic) → marque apenas o escopo <b>gist</b></div></div>
          <input class="input" type="password" id="tokenInput" placeholder="ghp_..." value="${esc(state.token)}" onchange="setToken(this.value)">
        </div>
        <div class="cfg-row stack">
          <div><div class="cfg-k">ID do Gist</div>
            <div class="cfg-s">Preenchido sozinho no primeiro envio</div></div>
          <input class="input" type="text" id="gistInput" placeholder="vazio" value="${esc(state.gistId)}" onchange="setGist(this.value)" style="font-size:12px">
        </div>
        <div style="padding:14px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="enviarGist()">⬆ Enviar</button>
          <button class="btn btn-sm" onclick="baixarGist()">⬇ Baixar</button>
        </div>
        <div id="syncMsg" class="note" style="display:none;margin:0 14px 14px"></div>
      </div>
      <p class="tiny dim" style="margin-top:9px">Tudo fica salvo neste navegador. O Gist é privado e serve para levar seus dados para outro aparelho. O token nunca sai deste dispositivo a não ser para o GitHub.</p>
    </div>

    <div class="sec">
      <div class="sec-head"><h2 class="sec-title">Dados</h2></div>
      <div class="glass" style="border-radius:var(--r);overflow:hidden">
        <div class="cfg-row">
          <div><div class="cfg-k">Exportar backup</div><div class="cfg-s">Baixa um JSON com todo o histórico</div></div>
          <button class="btn btn-sm" onclick="exportar()">Exportar</button>
        </div>
        <div class="cfg-row">
          <div><div class="cfg-k">Importar backup</div><div class="cfg-s">Restaura de um arquivo exportado</div></div>
          <label class="btn btn-sm" style="cursor:pointer">Importar
            <input type="file" accept="application/json" style="display:none" onchange="importar(this)">
          </label>
        </div>
        <div class="cfg-row">
          <div><div class="cfg-k">Apagar tudo</div><div class="cfg-s">Remove pesagens e treinos deste aparelho</div></div>
          <button class="btn btn-sm btn-danger" onclick="resetar()">Apagar</button>
        </div>
      </div>
    </div>

    <div class="note w" style="margin-top:6px">
      <div class="note-t">⚕️ Aviso</div>
      ${esc(RED_FLAGS.nota)}
    </div>

    <p class="tiny dim" style="text-align:center;padding:18px 0 6px;line-height:1.7">
      IronFit v2 · ${esc(ATHLETE.nome)}<br>
      Programa de 10/08 a 27/09/2026 · torneio em 26-27/09<br>
      Depois: rumo aos ${fmt(ATHLETE.metaFinal, 0)} kg até 31/12
    </p>`;
}

function cfg(k, v, s, hl) {
  return `<div class="cfg-row">
    <div><div class="cfg-k">${esc(k)}</div>${s ? `<div class="cfg-s">${esc(s)}</div>` : ''}</div>
    <div class="cfg-v ${hl ? 'hl' : ''}">${esc(v)}</div>
  </div>`;
}

function setToken(v) { state.token = v.trim(); save(); }
function setGist(v) { state.gistId = v.trim(); save(); }

function syncMsg(tipo, txt) {
  const el = $('#syncMsg');
  if (!el) return;
  el.style.display = 'block';
  el.className = 'note ' + (tipo === 'ok' ? 'o' : tipo === 'err' ? 'd' : 't');
  el.textContent = txt;
}

async function enviarGist() {
  if (!state.token) return syncMsg('err', 'Configure o token do GitHub primeiro.');
  syncMsg('info', 'Enviando…');
  const conteudo = JSON.stringify({
    weights: state.weights, sessions: state.sessions,
    mealOpt: state.mealOpt, em: new Date().toISOString()
  }, null, 2);
  try {
    const headers = { Authorization: 'token ' + state.token, 'Content-Type': 'application/json' };
    const body = JSON.stringify({
      description: 'IronFit — dados de treino e peso',
      public: false,
      files: { 'ironfit-data.json': { content: conteudo } }
    });
    const url = state.gistId ? 'https://api.github.com/gists/' + state.gistId : 'https://api.github.com/gists';
    const res = await fetch(url, { method: state.gistId ? 'PATCH' : 'POST', headers, body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ' + res.status);
    if (!state.gistId) { state.gistId = data.id; $('#gistInput').value = data.id; save(); }
    syncMsg('ok', '✓ Dados enviados com sucesso.');
    toast('Sincronizado', 'ok');
  } catch (e) { syncMsg('err', '✗ ' + e.message); }
}

async function baixarGist() {
  if (!state.token || !state.gistId) return syncMsg('err', 'Token e ID do Gist são necessários.');
  if (!confirm('Isso substitui os dados deste aparelho pelos do Gist. Continuar?')) return;
  syncMsg('info', 'Baixando…');
  try {
    const res = await fetch('https://api.github.com/gists/' + state.gistId, { headers: { Authorization: 'token ' + state.token } });
    const g = await res.json();
    if (!res.ok) throw new Error(g.message || 'Erro ' + res.status);
    const d = JSON.parse(g.files['ironfit-data.json'].content);
    if (Array.isArray(d.weights)) state.weights = d.weights;
    if (Array.isArray(d.sessions)) state.sessions = d.sessions;
    if (d.mealOpt) state.mealOpt = d.mealOpt;
    save(); renderHeader(); renderHoje();
    syncMsg('ok', '✓ Dados restaurados.');
    toast('Dados baixados', 'ok');
  } catch (e) { syncMsg('err', '✗ ' + e.message); }
}

function exportar() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ironfit-backup-${hoje()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Backup exportado', 'ok');
}

function importar(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || (!Array.isArray(d.weights) && !Array.isArray(d.weightHistory)))
        throw new Error('Arquivo não parece um backup do IronFit');
      if (Array.isArray(d.weights)) state.weights = d.weights;
      if (Array.isArray(d.sessions)) state.sessions = d.sessions;
      if (d.mealOpt) state.mealOpt = d.mealOpt;
      save(); renderHeader(); renderHoje(); renderAjustes();
      toast('Backup importado', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };
  r.readAsText(f);
  input.value = '';
}

function resetar() {
  if (!confirm('Isso apaga TODAS as pesagens e treinos deste aparelho. Não dá para desfazer. Continuar?')) return;
  state.weights = []; state.sessions = []; state.logs = {}; state.mealDone = {};
  save(); renderHeader(); renderHoje(); renderAjustes();
  toast('Dados apagados', 'ok');
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;
function toast(msg, tipo) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'show ' + (tipo || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3200);
}

/* ============================================================
   INÍCIO
   ============================================================ */
function init() {
  load();
  renderHeader();
  renderHoje();
  renderTreino();
  renderDieta();
  renderPlano();
  renderProgresso();
  renderAjustes();
  console.info('IronFit v2 pronto ·', state.weights.length, 'pesagens ·', state.sessions.length, 'treinos');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
