/* ============================================================
   IRONFIT — Camada de dados
   Programa construído para: Daniel Campos · 94 kg · 1,85 m
   Hérnias discais L2-L3 e L3-L4
   Alvo: torneio de beach tennis 26-27/09/2026
   ------------------------------------------------------------
   REGRA DE OURO deste arquivo: nenhum total é escrito à mão.
   As refeições guardam apenas os itens; o app soma na renderização.
   Assim é impossível o total divergir dos itens.
   ============================================================ */

/* ---------- ATLETA ---------- */
const ATHLETE = {
  nome: 'Daniel Campos',
  peso0: 94.0,          // peso no início do programa
  altura: 185,          // cm
  idade: 28,
  metaTorneio: 89.0,    // alvo realista na semana do torneio
  metaFinal: 83.0,      // alvo em 31/12/2026
  inicio: '2026-08-10', // segunda-feira da semana 1
  torneio: '2026-09-26',
  fimAno: '2026-12-31',
  academia: 'Iron Health La Salle · Toledo/PR',
  condicao: 'Hérnias discais L2-L3 e L3-L4',
  fcMax: 189            // Tanaka: 208 − 0,7 × 28
};

/* ---------- ENERGIA ----------
   TMB por 3 equações; base sedentária pelo método aditivo
   (multiplicador genérico superestima ~390 kcal/dia no caso dele). */
const ENERGY = {
  tmb: {
    mifflin: 1961,   // 10×94 + 6,25×185 − 5×28 + 5
    harris: 2077,    // Roza & Shizgal 1984
    katch: 1974,     // 370 + 21,6 × MLG (74,3 kg @ 21% GC)
    usado: 1961,
    nota: 'Mifflin-St Jeor é a mais validada (±10% em 82% dos não-obesos). As três convergem numa faixa de 116 kcal.'
  },
  fatorBase: 1.2,
  base: 2353,        // 1961 × 1,2 — TMB + efeito térmico + NEAT de escritório
  // gasto LÍQUIDO (já descontado o metabolismo de repouso do período)
  atividades: [
    { id: 'muscu',  nome: 'Musculação 40 min',      met: 6.0, min: 40, liquido: 339, desc: 'Supersets/densidade alta' },
    { id: 'bikeZ2', nome: 'Bike Zona 2 · 30 min',   met: 6.8, min: 30, liquido: 294, desc: '85-95 RPM, FC 123-142' },
    { id: 'bikeHI', nome: 'Bike HIIT · 30 min',     met: 8.8, min: 30, liquido: 391, desc: '4 × 3 min forte' },
    { id: 'bikeLv', nome: 'Bike leve · 30 min',     met: 4.0, min: 30, liquido: 148, desc: 'Recuperação, RPE 3' },
    { id: 'areia',  nome: 'Treino de areia 25 min', met: 8.0, min: 25, liquido: 288, desc: 'Velocidade e mudança de direção' },
    { id: 'jogo',   nome: 'Beach tennis 60 min',    met: 7.5, min: 60, liquido: 657, desc: 'Duplas, ritmo de treino' }
  ],
  formula: 'kcal/min = MET × 3,5 × peso(kg) ÷ 200 · líquido = bruto − metabolismo de repouso do período'
};

/* ---------- TIPOS DE DIA ----------
   Calorias cicladas: carboidrato vai para onde rende performance.
   Proteína e gordura ficam fixas todo dia. */
const DAYTYPES = {
  treino: { id:'treino', nome:'Dia de treino',  kcal:2050, prot:200, gord:62, carb:173, tdee:2986, cor:'#a78bfa',
            desc:'Bike de manhã + musculação no almoço' },
  jogo:   { id:'jogo',   nome:'Dia de jogo',    kcal:2400, prot:200, gord:62, carb:260, tdee:3304, cor:'#22d3ee',
            desc:'Beach tennis — carbo mais alto para sustentar o jogo' },
  leve:   { id:'leve',   nome:'Dia leve',       kcal:1950, prot:200, gord:62, carb:148, tdee:2647, cor:'#5eead4',
            desc:'Só bike, sem musculação' },
  off:    { id:'off',    nome:'Descanso',       kcal:1800, prot:200, gord:62, carb:110, tdee:2353, cor:'#7d769b',
            desc:'Sem treino — o menor dia da semana' }
};

/* ---------- BALANÇO SEMANAL ----------
   Todos estes números saem da soma dos 7 dias da semana-tipo.
   Conferidos por script — ver tasks/todo.md. */
const WEEKLY = {
  tdee: 20905,        // 4 dias de treino + 2 de jogo + 1 off
  ingestao: 15880,    // 14.800 do plano + 1.080 de excesso das 2 refeições livres
  deficit: 5025,
  kgSemana: 0.65,     // 5025 ÷ 7700
  pctPeso: 0.69,      // % do peso corporal por semana — bem no alvo de Garthe (0,7%)
  nota: 'Garthe et al. 2011: perder 0,7%/semana aumentou massa magra em 2,1% em atletas de elite; 1,4%/semana estagnou a massa magra e derrubou a força. Você está exatamente na faixa que constrói músculo enquanto perde gordura.'
};

/* ---------- PROJEÇÃO HONESTA ---------- */
const PROJECTION = {
  semanasDeficit: 6,          // semana 7 é manutenção
  gorduraPerdida: 3.9,        // 6 × 0,65
  aguaGlicogenio: 1.0,        // queda inicial de água ligada ao glicogênio
  totalBalanca: 4.9,
  pesoEm2009: 89.1,           // fim da semana 6 — a pesagem que vale
  pesoNoTorneio: 90.0,        // após a recarga de carboidrato: +1 kg de glicogênio e água
  recado: 'A pesagem que conta é 20/09, no fim da semana 6: ~89 kg, quase 5 kg abaixo do início. Na manhã do torneio a balança vai marcar cerca de 1 kg a mais por causa da recarga de carboidrato — isso é combustível dentro do músculo, não gordura. Sua gordura corporal terá caído ~4 kg.',
  metaOriginal: 'Você pediu 5-6 kg. A literatura é clara: acima de 0,7% do peso por semana a massa magra estagna e a força cai (Garthe 2011) — e força cair é perder exatamente a explosão que você quer ganhar. O plano entrega ~5 kg com a potência intacta. Os outros 6 kg até os 83 kg têm 13 semanas de sobra depois do torneio, a um ritmo confortável de 0,4 kg/semana.'
};

/* ============================================================
   TREINO
   Estrutura fixa de cada sessão (40 min):
   aquecimento 4' → potência 5' → força 10-11' → densidade 16' → core 4-5'
   ============================================================ */

const WARMUP_PADRAO = [
  'Cat-camel — 6 ciclos lentos (mobilidade, não alongamento)',
  'Bird dog — 2 × 5 cada lado',
  'Dead bug — 2 × 8 cada lado',
  'Monster walk com miniband — 2 × 15 passos',
  '1 série de aproximação leve do primeiro exercício'
];

const WORKOUTS = {
  A: {
    id:'A', nome:'Peito + Bíceps', foco:'Empurrar horizontal', icone:'🔥', cor:'#a78bfa', teto:45,
    aquecimento:{ min:3, itens:[
      'Esteira ou bike leve — 90 s',
      'Band pull-apart — 2 × 15',
      'Rotação torácica deitado de lado — 8 cada lado',
      '1 série de aproximação leve no supino'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        nota:'Carga alta é o que protege sua massa magra em déficit. Suba explosivo — a intenção de acelerar na fase concêntrica gera estímulo de potência sem custar um minuto a mais.',
        exercicios:[
          { nome:'Supino Inclinado 30° — Smith Machine', series:4, reps:'6-8', rir:'2',
            tip:'Primeira série é de aproximação, leve. Inclinação 30° pega o peitoral superior. Descida controlada em 3 s, subida o mais rápido que a carga permitir. Escápulas presas no banco, sem ponte lombar.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'Peito e bíceps não competem entre si: enquanto um trabalha, o outro descansa de verdade. Cada músculo recebe quase 3 minutos de pausa real enquanto o relógio anda pela metade.',
        exercicios:[
          { nome:'Supino Reto — Máquina ou Halteres', series:3, reps:'8-10', rir:'2',
            tip:'Com halteres, não deixe os cotovelos descerem muito abaixo da linha do tronco — protege o ombro.' },
          { nome:'Rosca Scott — Banco Scott ou Máquina', series:3, reps:'10-12', rir:'1',
            tip:'Cotovelos travados no apoio. Não solte a tensão no fundo. O banco elimina o balanço de tronco que castiga a lombar.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'60s',
        exercicios:[
          { nome:'Crossover — Cabo Baixo (ou Peck Deck)', series:3, reps:'12-15', rir:'1',
            tip:'Braços cruzam na altura do peito, 1 s de aperto no fechamento. Aqui pode chegar perto da falha: é máquina, risco zero para a coluna.' },
          { nome:'Rosca Martelo — Cabo com corda', series:3, reps:'12-15', rir:'1',
            tip:'Polegar para cima. Trabalha braquial e braquiorradial, a parte do braço que aparece de lado. Core firme, sem jogar o tronco.' }
        ]},
      { tipo:'final', nome:'Finalizador', descanso:'45s',
        nota:'A panturrilha entra aqui de propósito: o tornozelo é o gargalo de quem corre na areia, e este é o dia com tempo sobrando.',
        exercicios:[
          { nome:'Panturrilha em Pé — Máquina ou Leg Press', series:3, reps:'15-20', rir:'0-1',
            tip:'Joelho estendido isola o gastrocnêmio. Desça devagar até alongar por completo, segure 1 s em cima. Se usar máquina em pé, tronco ereto — nada de curvar para alcançar.' }
        ]}
    ]
  },

  B: {
    id:'B', nome:'Ombro + Tríceps', foco:'Empurrar vertical', icone:'⚡', cor:'#22d3ee', teto:45,
    aquecimento:{ min:3, itens:[
      'Bike leve — 90 s',
      'Rotação externa com elástico — 2 × 15 cada lado',
      'Band pull-apart — 2 × 15',
      'Elevação lateral com 2 kg — 1 × 15'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        exercicios:[
          { nome:'Desenvolvimento Sentado — Máquina ou Halteres, com encosto', series:4, reps:'6-8', rir:'2', alert:true,
            tip:'SEMPRE sentado com encosto, glúteo e lombar colados nele. Em pé com barra você compensa arqueando a lombar, e hiperlordose sob carga é o que a sua hérnia não tolera. Se a lombar descolar do encosto, o peso está alto demais.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'Elevação lateral e tríceps não se sobrepõem — por isso são pareados. O desenvolvimento já usou o tríceps, então ele vem depois, nunca junto.',
        exercicios:[
          { nome:'Elevação Lateral — Cabo ou Halteres', series:3, reps:'12-15', rir:'1',
            tip:'O cabo mantém tensão no arco inteiro; o halter só no topo. Sobe até a altura do ombro, sem impulso de tronco.' },
          { nome:'Tríceps Testa — Banco com halteres ou barra EZ', series:3, reps:'8-10', rir:'2',
            tip:'Deitado, cotovelos apontando para o teto e fixos. Alonga a cabeça longa do tríceps, que é a maior parte do músculo.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'60s',
        exercicios:[
          { nome:'Face Pull — Cabo com corda', series:3, reps:'15', rir:'1',
            tip:'Cotovelos ALTOS, puxe até a altura das orelhas com rotação externa no final. Saúde do manguito é inegociável para quem saca e dá smash.' },
          { nome:'Tríceps Corda — Cabo', series:3, reps:'12-15', rir:'0-1',
            tip:'Cotovelos colados ao corpo, abra as pontas no final. Pode ir até a falha: é polia, coluna descarregada.' }
        ]},
      { tipo:'final', nome:'Finalizador', descanso:'45s',
        nota:'Ombro responde por 14% das lesões no beach tennis. Dois minutos de manguito por semana custam muito menos que um mês parado.',
        exercicios:[
          { nome:'Rotação Externa — Cabo ou elástico', series:2, reps:'15 cada lado', rir:'2',
            tip:'Cotovelo colado ao corpo formando 90°, gire o antebraço para fora sem mexer o ombro. Carga leve — aqui a qualidade importa mais que o peso.' }
        ]}
    ]
  },

  C: {
    id:'C', nome:'Costas + Cadeia Posterior', foco:'Puxar', icone:'🏹', cor:'#5eead4', teto:45,
    aquecimento:{ min:3, itens:[
      'Esteira ou bike leve — 90 s',
      'Band pull-apart — 2 × 15',
      'Ponte de glúteo — 1 × 15',
      '1 série de aproximação leve na puxada'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        exercicios:[
          { nome:'Puxada Frente — Polia, pegada aberta', series:3, reps:'6-8', rir:'2',
            tip:'Puxe pelos cotovelos, levando-os para baixo e para trás. Peito alto, sem jogar o tronco para trás para roubar. Primeira série de aproximação.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'A mesa flexora entra no dia de costas de propósito: assim o posterior de coxa recebe estímulo 2× na semana em vez de 1×. É o músculo que produz o arranque e o que mais estira na areia. Ela tem 4 séries contra 3 da remada — faça 3 rodadas em par e a 4ª de flexora sozinha.',
        exercicios:[
          { nome:'Remada Baixa Sentada — Cabo, peito apoiado se houver', series:3, reps:'8-10', rir:'2', alert:true,
            tip:'Tronco ERETO o tempo todo. Não deixe a lombar arredondar ao ir para a frente — se acontecer, reduza a carga. Deixe o peso puxar a escápula, nunca a coluna.' },
          { nome:'Mesa Flexora (deitada)', series:4, reps:'10-12', rir:'1',
            tip:'Amplitude completa, sem levantar o quadril do apoio. Substitui o stiff com segurança total para o disco.' }
        ]},
      { tipo:'superset', nome:'Tri-Set B', descanso:'60s',
        exercicios:[
          { nome:'Remada Unilateral — Halter apoiado no banco', series:3, reps:'10 cada lado', rir:'1',
            tip:'Uma mão e um joelho no banco, coluna paralela ao chão e NEUTRA. Cotovelo sobe rente ao corpo até passar da linha das costas.' },
          { nome:'Elevação Pélvica (Hip Thrust) — Smith ou máquina', series:3, reps:'10-12', rir:'1', alert:true,
            tip:'Seu substituto do levantamento terra: extensão de quadril forte com compressão quase nula na coluna. Queixo colado ao peito, costelas para baixo, e PARE quando o quadril chegar em linha reta — não hiperestenda a lombar no topo.' },
          { nome:'Panturrilha Sentada', series:3, reps:'15-20', rir:'0-1',
            tip:'Joelho dobrado isola o SÓLEO, que é o motor de quem corre na areia. Zero carga axial. Desça devagar até alongar, segure 1 s em cima.' }
        ]}
    ]
  },

  D: {
    id:'D', nome:'Pernas', foco:'Agachar e empurrar', icone:'🦵', cor:'#e879f9', teto:45,
    aquecimento:{ min:3, itens:[
      'Bike leve — 90 s',
      'Ponte de glúteo — 2 × 12',
      'Monster walk com miniband — 2 × 15 passos',
      '1 série de aproximação no leg press'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        exercicios:[
          { nome:'Leg Press Horizontal — amplitude controlada', series:3, reps:'8-10', rir:'2', alert:true,
            tip:'PARE a descida ANTES do quadril começar a enrolar. O instante em que o cóccix descola do apoio é flexão lombar com centenas de quilos em cima — é o mecanismo clássico de piora de hérnia. Nunca use o leg press 45° profundo.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'A flexora tem 4 séries contra 3 da extensora: o posterior precisa de mais volume que o quadríceps aqui, porque é ele que protege o joelho e produz o arranque. Faça 3 rodadas em par e a 4ª de flexora sozinha.',
        exercicios:[
          { nome:'Cadeira Extensora', series:3, reps:'12-15', rir:'1',
            tip:'Segure 1 s no topo, volta controlada em 3 s. Quadril fixo no encosto — não empurre a lombar contra ele no final.' },
          { nome:'Mesa Flexora', series:4, reps:'12-15', rir:'1',
            tip:'Se quiser corrigir diferença entre as pernas, faça uma das quatro séries unilateral. Amplitude completa.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'60s',
        exercicios:[
          { nome:'Agachamento Búlgaro — Halteres', series:3, reps:'10 cada lado', rir:'1', alert:true,
            tip:'Pé de trás no banco, halteres ao lado do corpo, tronco ERETO — não incline para a frente. Se a lombar reclamar, reduza a amplitude ou troque por afundo apoiado no Smith.' },
          { nome:'Cadeira Abdutora', series:3, reps:'15-20', rir:'1',
            tip:'O glúteo médio é quem freia o corpo nas mudanças de direção laterais — o movimento mais repetido do beach tennis. Postura ereta, abra controlado.' }
        ]}
    ]
  }
};

/* ============================================================
   TREINO DE CASA — 15 min, à noite
   Saiu da academia para os 45 min fecharem: core de McGill e
   agilidade. Nenhum dos dois precisa de carga externa.
   ============================================================ */
const HOME = {
  nome: 'Bloco de Casa',
  min: 15,
  quando: 'À noite, 4 a 6 vezes por semana. A parte de coluna pode ser feita todos os dias.',
  material: 'Um elástico (miniband ou tubo com alça) e um espaço de 2 × 2 metros. Só isso.',
  porqueNoite: 'NUNCA de manhã. A rigidez de flexão do disco é cerca de 300% maior na primeira hora depois de acordar (Adams & Dolan, Spine 1987), e o próprio McGill orienta não fazer a rotina cedo. Como você já pedala de manhã, a noite é o horário livre — e é também o mais seguro.',
  partes: [
    {
      id:'coluna', nome:'Coluna — McGill Big 3', min:8, cor:'#a78bfa',
      metodo:'Pirâmide descendente: 5 repetições → descanso de 20-30 s → 3 repetições → descanso → 1 repetição. Cada repetição é uma sustentação de 8 segundos, respirando normal. Progride-se aumentando REPETIÇÕES (6-4-2, depois 8-6-4), nunca o tempo de sustentação.',
      exercicios:[
        { nome:'Cat-camel', prescr:'6 ciclos lentos',
          tip:'Mobilidade, não alongamento. Não force a amplitude — é para lubrificar a coluna, não para esticar.' },
        { nome:'Curl-up de McGill', prescr:'5-3-1 · 8 s cada',
          tip:'Deitado, UMA perna dobrada e a outra estendida, mãos sob a lombar para manter a curva natural. Levante só cabeça e ombros poucos centímetros, como um bloco rígido. A lombar NÃO se move — é isso que separa este do abdominal comum.' },
        { nome:'Prancha Lateral', prescr:'5-3-1 · 8 s cada lado',
          tip:'Nível 1: joelhos dobrados. Nível 2: pés empilhados. Complete a pirâmide inteira de um lado antes de trocar.' },
        { nome:'Bird Dog', prescr:'5-3-1 · 8 s cada lado',
          tip:'Braço e perna opostos, punho e calcanhar empurrando paredes opostas. O quadril não pode rodar.' },
        { nome:'Pallof Press com elástico', prescr:'2 × 10 cada lado, 3 s de sustentação',
          tip:'Prenda o elástico numa maçaneta na altura do peito, fique de lado e empurre à frente resistindo à rotação. O tronco NÃO gira. É o exercício mais específico que existe para a sua lombar no beach tennis.' },
        { nome:'Ponte de Glúteo', prescr:'2 × 12 com 3 s de sustentação',
          tip:'Aperte o glúteo, não a lombar. Costelas para baixo. Glúteo forte é o que impede a lombar de fazer o trabalho dele.' }
      ]
    },
    {
      id:'agilidade', nome:'Agilidade e pé-tornozelo', min:7, cor:'#22d3ee',
      metodo:'Circuito: os exercícios em sequência com 30 s de pausa entre eles, 2 voltas. Qualidade acima de quantidade — quando a execução piorar, encerre.',
      exercicios:[
        { nome:'Pogo Hops', prescr:'2 × 15 saltos',
          tip:'Saltos baixos e rápidos só do tornozelo, joelho quase reto, contato mínimo com o chão. Treina a rigidez do tornozelo, que é justamente o que a areia rouba de você.' },
        { nome:'Skater Hop lateral', prescr:'2 × 8 cada lado',
          tip:'Salto lateral baixo de uma perna para a outra, aterrissando suave e estável. Segure 1 s em cima da perna antes de saltar de volta.' },
        { nome:'Line Hops — frente/trás e lateral', prescr:'2 × 20 s de cada',
          tip:'Uma fita ou linha imaginária no chão. Pés juntos, saltinhos rápidos por cima. Puro tempo de contato.' },
        { nome:'Split-step + arranque de 3 m', prescr:'2 × 5',
          tip:'O saltinho de preparação que você dá antes da bola, seguido de uma arrancada curta. É literalmente o gesto do jogo. Se faltar espaço, faça o split-step parado e arranque 2 passos.' },
        { nome:'Elevação de ponta do pé (tibial anterior)', prescr:'2 × 20',
          tip:'Calcanhares no chão, levante as pontas dos pés. O tibial é o que mais fadiga na areia e quase ninguém treina — é ele que segura o pé quando você freia.' },
        { nome:'Apoio em uma perna, olhos fechados', prescr:'2 × 30 s cada perna',
          tip:'Treina o tornozelo a se corrigir sozinho, que é exatamente o que a areia instável exige a cada passo.' }
      ]
    }
  ],
  nota: 'Este bloco não é "o resto do treino". É onde mora quase todo o trabalho que ataca as suas duas queixas: a dor lombar depois dos jogos e a lentidão na areia. A academia constrói o motor; aqui o motor aprende a funcionar no terreno.'
};

/* ---------- BICICLETA ERGOMÉTRICA ---------- */
const BIKE = {
  veredito: 'Aumente a CARGA e mantenha a cadência alta (85-95 RPM). Não faça o contrário: pedalar devagar com carga pesada vira uma série de agachamento diluída, cansa o quadríceps para o treino do almoço e ainda aumenta a tração na lombar.',
  regraCarga: 'Se a frequência cardíaca está abaixo da zona, suba 1 nível de resistência ANTES de aumentar o RPM. Se está acima, baixe a resistência mantendo 85-90 RPM.',
  zonas: [
    { nome:'Aquecimento', pct:'<60%', bpm:'até 113', rpe:'2',   rpm:'80-85',  fala:'conversa fácil' },
    { nome:'Zona 2 / LISS', pct:'65-75%', bpm:'123-142', rpe:'4-5', rpm:'85-95', fala:'frases completas' },
    { nome:'Limiar', pct:'80-87%', bpm:'151-164', rpe:'6-7', rpm:'90-95', fala:'frases curtas' },
    { nome:'HIIT', pct:'88-93%', bpm:'166-176', rpe:'8-9', rpm:'95-105', fala:'só palavras soltas' },
    { nome:'Sprint (SIT)', pct:'máximo', bpm:'não olhe', rpe:'10', rpm:'105-120', fala:'nada' }
  ],
  sessoes: [
    {
      id:'Z2', nome:'Sessão A — Zona 2', freq:'3× por semana', kcal:294, cor:'#5eead4',
      resumo:'A base. Queima calórica sem atrapalhar a musculação do almoço.',
      passos:[
        { t:'0-5 min',  o:'Aquecimento — resistência baixa, 85 RPM, RPE 2-3' },
        { t:'5-27 min', o:'Resistência fixa · 85-95 RPM · FC 130-140 · RPE 4-5 — sem variar nada' },
        { t:'27-30 min',o:'Solto, RPE 2' }
      ]
    },
    {
      id:'HIIT', nome:'Sessão B — HIIT longo', freq:'1× por semana', kcal:391, cor:'#a78bfa',
      resumo:'Para VO₂máx. Intervalos de 3-4 min batem sprints curtos em quem já treina (6,5% vs 3,3%).',
      passos:[
        { t:'0-6 min',   o:'Aquecimento progressivo + 3 acelerações de 15s' },
        { t:'6-26 min',  o:'4 × [3 min a RPE 8, FC 166-176, 95 RPM] com 2 min leve a 75 RPM entre eles' },
        { t:'26-30 min', o:'Desaquecimento' }
      ]
    },
    {
      id:'SIT', nome:'Sessão C — Sprints (SIT)', freq:'1× por semana até 30/08', kcal:430, cor:'#e879f9',
      resumo:'Capacidade de repetir esforço. A partir de 31/08 esta sessão dá lugar ao treino de areia, que transfere muito mais.',
      passos:[
        { t:'0-8 min',   o:'Aquecimento + 4 acelerações de 8s' },
        { t:'8-22 min',  o:'3 blocos de [5 × 8s all-out a 110+ RPM com resistência alta / 32s leve], 2 min entre blocos' },
        { t:'22-30 min', o:'Desaquecimento longo' }
      ]
    }
  ],
  postura: [
    'Guidão na altura do selim ou acima — tronco a 15-30° da vertical, nunca deitado.',
    'Altura do selim: joelho com 25-35° de flexão no ponto mais baixo do pedal.',
    'Recuo: joelho sobre o eixo do pedal com a manivela às 3 horas.',
    'Se você precisa arredondar a lombar para alcançar o guidão, ele está baixo ou longe demais.',
    'Espere 30-45 min depois de acordar antes de pedalar — o disco está mais vulnerável logo cedo.',
    'A cada 8-10 min, fique 20-30s pedalando em pé para descarregar a lombar.',
    'Ao descer da bike, faça 5 extensões lombares suaves (press-up de bruços).'
  ],
  alerta: 'PARE se aparecer: dor irradiando abaixo do joelho, formigamento ou dormência no pé, fraqueza para levantar a ponta do pé, ou dor que persiste mais de 1 hora após a sessão. Dor local que some em 20 min é aceitável.'
};

/* ---------- TREINO DE AREIA ---------- */
const SAND = {
  nome: 'Treino de Areia',
  porque: 'Correr na areia custa 1,6× mais energia que em piso firme, porque o pé afunda e o tendão devolve muito menos energia elástica (a eficiência do ciclo alongamento-encurtamento cai de ~0,55 para ~0,40). Nenhuma máquina de academia reproduz isso. E a boa notícia: o impacto axial na areia é MENOR — é o melhor lugar do mundo para você fazer pliometria com hérnia.',
  frequencia: '2 sessões por semana, 20-25 min, separadas por 48-72h. Sempre ANTES do jogo, nunca cansado.',
  blocos: [
    { nome:'Bloco A — Potência pura', desc:'8-12 arranques de 5-10 m, pausa de 60-90s entre eles. Qualidade acima de quantidade: quando o tempo cair ~3%, encerre o bloco.' },
    { nome:'Bloco B — Mudança de direção reativa', desc:'6-8 repetições de 6-8s: split-step seguido de 2 mudanças de direção ao comando visual de um parceiro. Pausa de 45-60s.' },
    { nome:'Pliometria', desc:'80-120 contatos por sessão (comece com 60). Pogo hops, line hops laterais, skater hops baixos, A-skip. Um salto com os dois pés conta 2 contatos.' }
  ],
  nota: 'Esta é a resposta para "me sinto lento na areia". Musculação constrói o motor; a areia ensina o motor a funcionar naquele terreno.'
};

/* ---------- SEMANA-TIPO ---------- */
const WEEK_PLAN = [
  { dia:'Seg', idx:1, manha:'Bike Zona 2',  almoco:'A — Peito + Bíceps',     noite:'Casa · coluna + agilidade',      tipo:'treino', treino:'A', casa:'completo' },
  { dia:'Ter', idx:2, manha:'Bike HIIT',    almoco:'B — Ombro + Tríceps',    noite:'Areia 20 min + casa · coluna',   tipo:'treino', treino:'B', casa:'coluna' },
  { dia:'Qua', idx:3, manha:'Bike Zona 2',  almoco:'C — Costas + Posterior', noite:'Casa · coluna + agilidade',      tipo:'treino', treino:'C', casa:'completo' },
  { dia:'Qui', idx:4, manha:'Bike leve',    almoco:'—',                      noite:'Beach tennis',                   tipo:'jogo',   treino:null, casa:null },
  { dia:'Sex', idx:5, manha:'Bike Zona 2',  almoco:'D — Pernas',             noite:'Refeição livre + casa · coluna', tipo:'treino', treino:'D', casa:'coluna' },
  { dia:'Sáb', idx:6, manha:'Areia 25 min', almoco:'—',                      noite:'Beach tennis + refeição livre',  tipo:'jogo',   treino:null, casa:null },
  { dia:'Dom', idx:0, manha:'Caminhada',    almoco:'—',                      noite:'Casa · coluna',                  tipo:'off',    treino:null, casa:'coluna' }
];

/* ---------- PERIODIZAÇÃO: 7 SEMANAS ---------- */
const PERIODIZATION = [
  { s:1, ini:'2026-08-10', fim:'2026-08-16', bloco:'Acumulação', foco:'Aprender os padrões novos e fixar a rotina de coluna',
    carga:'75-80% · RIR 3', volume:'8-10 séries/músculo', cardio:'3× Z2 + 1× HIIT', areia:'2× (60 contatos)', peso:92.7,
    nota:'Semana de calibragem: anote as cargas de tudo. Faça os 3 testes de resistência de core.' },
  { s:2, ini:'2026-08-17', fim:'2026-08-23', bloco:'Acumulação', foco:'Sobrecarga progressiva nos compostos',
    carga:'75-80% · RIR 3', volume:'8-10 séries/músculo', cardio:'3× Z2 + 1× HIIT + 1× SIT', areia:'2× (80 contatos)', peso:91.7,
    nota:'Suba 2,5 kg em qualquer exercício que você completou todas as reps com RIR 3.' },
  { s:3, ini:'2026-08-24', fim:'2026-08-30', bloco:'Intensificação', foco:'Mais carga, mesmo volume',
    carga:'80-85% · RIR 2', volume:'8-9 séries/músculo', cardio:'3× Z2 + 1× HIIT + 1× SIT', areia:'2× (100 contatos)', peso:91.0,
    nota:'Última semana com a sessão de sprint na bike. A partir de 31/08 ela vira treino de areia.' },
  { s:4, ini:'2026-08-31', fim:'2026-09-06', bloco:'Intensificação', foco:'Potência e velocidade viram prioridade',
    carga:'80-85% · RIR 2', volume:'8-9 séries/músculo', cardio:'3× Z2 + 1× HIIT', areia:'2× (120 contatos)', peso:90.4,
    nota:'Troque a sessão C da bike por 25 min de areia. Reteste o salto vertical e compare com a semana 1.' },
  { s:5, ini:'2026-09-07', fim:'2026-09-13', bloco:'Pico de força', foco:'Cargas mais altas do ciclo',
    carga:'85-88% · RIR 1-2', volume:'6-8 séries/músculo', cardio:'3× Z2 + 1× HIIT', areia:'2× (120 contatos)', peso:89.7,
    nota:'Converta a refeição livre de sexta em recarga de carboidrato (sushi, massa, arroz — gordura baixa).' },
  { s:6, ini:'2026-09-14', fim:'2026-09-20', bloco:'Taper leve', foco:'Volume −40%, MESMA carga',
    carga:'85% · RIR 2-3', volume:'2 séries por exercício', cardio:'3× Z2 + HIIT reduzido (3×3 min)', areia:'2× leve', peso:89.1,
    nota:'Corte séries, nunca peso. Zero falha, zero exercício novo. Último jogo-treino duro: domingo 20/09.' },
  { s:7, ini:'2026-09-21', fim:'2026-09-27', bloco:'TAPER + TORNEIO', foco:'Volume −60%, chegar leve e explosivo',
    carga:'85% · RIR 3-4', volume:'2 sessões de 25 min (seg e qua)', cardio:'Bike 20 min fácil', areia:'Só técnica', peso:90.0,
    nota:'DÉFICIT ENCERRADO — vá para manutenção. Recarga de carboidrato 24-25/09. Última musculação: quarta 23/09.',
    destaque:true }
];

/* ---------- SEMANA DO TORNEIO ---------- */
const TOURNAMENT = {
  data: '26 e 27 de setembro de 2026',
  contagem: [
    { d:'Seg 21/09', o:'Musculação full-body 25 min: 4 exercícios × 2 séries × 4-6 reps a 85%, explosivo na subida. Bike 20 min fácil. Manutenção calórica (~2.950 kcal), carbo ~5 g/kg.' },
    { d:'Ter 22/09', o:'Bike 20 min zona 2 + mobilidade de quadril e torácica + rotina de coluna leve.' },
    { d:'Qua 23/09', o:'ÚLTIMA musculação: 25 min, mesmo formato de segunda. Depois disso, só mobilidade.' },
    { d:'Qui 24/09', o:'Recarga começa: 6-8 g de carbo/kg (530-700 g). Arroz branco, batata, pão branco, banana, mel, macarrão. Gordura e fibra BAIXAS. Sódio normal a alto.' },
    { d:'Sex 25/09', o:'Véspera. 30-40 min de quadra técnica: saques, devoluções, 6-8 arranques de 5-8 m submáximos, 10 saltos leves. Recarga continua. Soneca de 20-30 min. Bolsa pronta à noite.' },
    { d:'Sáb 26/09', o:'DIA 1 — protocolo completo abaixo.' },
    { d:'Dom 27/09', o:'DIA 2 — reaqueça com atenção redobrada; o corpo está mais rígido.' }
  ],
  avisoPeso: 'A balança vai SUBIR 1 a 1,5 kg na recarga. Isso é glicogênio puxando água para dentro do músculo — é combustível, não gordura. Não corte comida na sexta por causa disso. Chegar leve com o músculo vazio é exatamente a sensação de "lento e pesado" que você quer eliminar.',
  refeicaoPre: '3h antes do primeiro jogo: 1,5-2 g de carbo/kg (140-190 g), gordura e fibra baixas. Exemplo: 100 g de aveia + 1 banana grande + 400 ml de leite com whey + 2 fatias de pão branco com mel + café. 30-40 min antes: 20-30 g de carbo rápido + 400 ml de água com 500-700 mg de sódio.',
  ramp: [
    { f:'1. Raise (4 min)', o:'Trote leve na areia, skipping, deslocamento lateral progressivo.' },
    { f:'2. Activate (4 min)', o:'Ponte de glúteo 2×12 · monster walk 2×15 cada lado · prancha lateral 2×20s · bird dog 2×6 · dead bug 2×8. É esta parte que salva sua lombar: glúteo ativado significa menos compensação lombar na areia.' },
    { f:'3. Mobilise (3 min)', o:'Mobilidade dinâmica de quadril, rotação torácica, círculos de ombro. NADA de alongamento estático longo antes de jogar — derruba a potência.' },
    { f:'4. Potentiate (5 min)', o:'6-8 arranques de 5 m · 6 saltos · 10 saques e smashes progressivos até 90-100% · alguns pontos rápidos.' }
  ],
  durante: 'Bebida esportiva a 6-8% com 500-1.000 mg de sódio por litro: 500-750 ml/h, 150-250 ml a cada troca de lado. Beba por relógio, não por sede. 30-60 g de carbo por hora.',
  entreJogos: [
    { j:'Menos de 1h', o:'Só líquido e carbo rápido: 1,0-1,2 g/kg (95-115 g). Bebida esportiva + banana + gel.' },
    { j:'1 a 3h', o:'Sanduíche de pão branco com peito de peru + fruta + isotônico ≈ 95 g de carbo e 30 g de proteína. Gordura e fibra mínimas.' },
    { j:'Mais de 3h', o:'Refeição completa: arroz + frango + fruta ≈ 140 g de carbo.' }
  ],
  recuperacao: 'Reaqueça SEMPRE antes do segundo jogo (versão curta do RAMP, 6-8 min). Entre os dias: 1,0-1,2 g de carbo/kg por hora nas 4h pós-jogo + 30 g de proteína; imersão fria 10-15 min a 11-15 °C; pernas para cima 10 min; sono como prioridade absoluta.',
  hidratacao: 'Pese-se sem roupa antes e depois de um jogo de treino ao sol para descobrir sua taxa de suor — cada 1 kg perdido é ~1 L. Reponha 125-150% do que perdeu, sempre com sódio. Perder 2% do peso (1,9 kg) já degrada a performance e dispara cãibra.',
  erros: [
    'Treinar pesado ou "compensar" na quinta e sexta.',
    'Cortar carboidrato para "ficar seco" — é a causa nº1 de pernas mortas no domingo.',
    'Estrear suplemento, comida, tênis, cinta ou encordoamento no torneio.',
    'Jogar 3 horas de treino na véspera.',
    'Alongamento estático longo antes de entrar em quadra.',
    'Chegar 4 horas antes e ficar no sol. Chegue 60-75 min antes e fique na sombra.',
    'Depender da lanchonete do clube. Leve sua comida.',
    'Excesso de cafeína no sábado → sono ruim → domingo perdido.',
    'Pular o reaquecimento entre jogos.',
    'Álcool no sábado à noite: atrapalha glicogênio, sono e reparo muscular.'
  ]
};

/* ---------- GUIA DA LOMBAR ---------- */
const LUMBAR = {
  pressao: {
    titulo: 'Pressão dentro do disco por posição',
    fonte: 'Wilke et al. 1999 — sensor implantado em disco lombar, medido in vivo. Valores em MPa.',
    linhas: [
      { pos:'Deitado de costas com joelhos dobrados', v:'0,09', nivel:'ok' },
      { pos:'Deitado de bruços', v:'0,10', nivel:'ok' },
      { pos:'De lado', v:'0,12', nivel:'ok' },
      { pos:'Sentado relaxado', v:'0,45-0,50', nivel:'med' },
      { pos:'Em pé relaxado (referência)', v:'0,50', nivel:'med' },
      { pos:'Sentado em flexão máxima', v:'0,83', nivel:'alto' },
      { pos:'Em pé, inclinado à frente', v:'1,10', nivel:'alto' },
      { pos:'Levantar 20 kg perto do corpo', v:'1,10', nivel:'alto' },
      { pos:'Levantar 20 kg com joelhos dobrados', v:'1,70', nivel:'risco' },
      { pos:'Levantar 20 kg de costas arredondadas', v:'2,30', nivel:'risco' }
    ]
  },
  proibidos: [
    { ex:'Leg press 45° profundo', pq:'No fundo do movimento a pelve enrola e a lombar flexiona sob centenas de quilos. É o pior cenário possível.' },
    { ex:'Levantamento terra convencional', pq:'Barra longe do corpo: 1,7-2,3 MPa. Qualquer perda da curva neutra carrega a parede posterior do disco.' },
    { ex:'Agachamento livre pesado', pq:'6 a 10× o peso corporal de compressão em L3-L4 — exatamente o seu nível. Com 1,85 m o risco de enrolar o quadril no fundo é alto.' },
    { ex:'Remada curvada com barra', pq:'Tronco flexionado sustentado funciona como uma isometria carregada na lombar.' },
    { ex:'Good morning', pq:'Momento flexor máximo com alavanca longa. Não existe justificativa de custo-benefício.' },
    { ex:'Abdominal supra, sit-up e máquina de crunch', pq:'Flexão lombar repetida. O disco falha por NÚMERO de ciclos de flexão, não só por peso. Sit-up gera mais de 3.000 N de compressão.' },
    { ex:'Hiperextensão no banco romano com anilha', pq:'Passa do neutro em extensão com carga: comprime as facetas e gera cisalhamento.' },
    { ex:'Russian twist pesado e rotação de tronco na máquina', pq:'Rotação sob carga com lombar flexionada — a combinação mais destrutiva para o ânulo.' },
    { ex:'Elevação de pernas suspenso e canivete', pq:'O psoas puxa L1-L4 para a frente: cisalhamento somado à flexão.' },
    { ex:'Stiff e RDL pesados', pq:'Só liberados com carga leve, dobradiça de quadril perfeita e sem buscar amplitude. Fora disso, não compensam.' }
  ],
  substituicoes: [
    { de:'Leg press 45°',            para:'Leg press horizontal com amplitude parcial' },
    { de:'Agachamento livre',        para:'Agachamento no Smith com pés à frente ou búlgaro com halteres' },
    { de:'Levantamento terra',       para:'Elevação pélvica (hip thrust) + mesa flexora' },
    { de:'Stiff',                    para:'Mesa flexora unilateral + extensão de quadril no cabo' },
    { de:'Remada curvada',           para:'Remada baixa sentada no cabo com peito apoiado' },
    { de:'Abdominal supra',          para:'Curl-up de McGill + dead bug' },
    { de:'Hiperextensão com carga',  para:'Bird dog + ponte de glúteo' },
    { de:'Russian twist',            para:'Pallof press + chop/lift no cabo' },
    { de:'Desenvolvimento em pé',    para:'Desenvolvimento sentado com encosto' },
    { de:'Rosca direta em pé',       para:'Rosca no banco Scott, inclinado ou no cabo' },
    { de:'Panturrilha em pé pesada', para:'Panturrilha sentada (zero carga axial)' }
  ],
  testes: {
    titulo: 'Teste sua resistência de core (faça na semana 1 e repita na semana 6)',
    intro: 'McGill mostrou que o que prediz dor lombar não é o valor absoluto, e sim a PROPORÇÃO entre os testes. Cronometre cada um até não conseguir mais manter a posição.',
    itens: [
      { nome:'Extensão (Biering-Sørensen)', norma:'161s', alvo:'Abaixo de 176s prediz dor lombar no ano seguinte; acima de 198s prediz ausência de dor.' },
      { nome:'Flexão', norma:'136s', alvo:'Proporção flexão ÷ extensão deve ser menor que 1,0.' },
      { nome:'Prancha lateral direita', norma:'95s', alvo:'Proporção lateral ÷ extensão menor que 0,75.' },
      { nome:'Prancha lateral esquerda', norma:'99s', alvo:'Diferença entre os lados acima de 5% é bandeira vermelha — comum em esporte de raquete.' }
    ]
  },
  porqueDoi: 'Não falta força — falta RESISTÊNCIA. Os estabilizadores (transverso, multífidos, quadrado lombar, oblíquos) fadigam ao longo do jogo; quando fadigam, a rigidez entre as vértebras cai, os micromovimentos aumentam e o disco passa a receber a carga que o músculo deveria absorver. Por isso a dor aparece no terceiro ou quarto game, não no primeiro. Na areia isso é amplificado: superfície instável significa mais correções posturais por segundo e fadiga acelerada.',
  contexto: 'Em praticantes brasileiros de beach tennis, 48,8% relatam alguma lesão ortopédica; 11,3% são de coluna, e 55,6% dessas são discais. Sua dor é o padrão da modalidade, não uma exceção.'
};

/* ============================================================
   DIETA
   Cada opção guarda apenas os itens. Os totais são somados
   pelo app na renderização — não existe total escrito à mão.
   Valores: TACO 4ª ed. (NEPA/Unicamp); USDA para itens ausentes.
   ============================================================ */

const DIET = [
  {
    id:'prebike', nome:'Pré-bike', hora:'06:00 — 06:30', icone:'🚴', alvo:70,
    nota:'Opcional. A bike em Zona 2 pode ser feita em jejum sem prejuízo — não existe vantagem comprovada do jejum na perda de gordura em 24h (Schoenfeld 2014). Coma se render mais. Em dia de HIIT ou SIT, coma sempre.',
    opcoes:[
      { label:'Café puro', itens:[
        { n:'Café preto sem açúcar', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Banana', itens:[
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Pão + pasta', itens:[
        { n:'Pão de forma integral', q:'1 fatia (25 g)', kcal:63, p:2.4, c:12.5, g:0.9 },
        { n:'Pasta de amendoim integral', q:'1 c. chá (7 g)', kcal:44, p:1.5, c:1.7, g:3.5 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Whey na água', itens:[
        { n:'Whey isolado', q:'15 g', kcal:55, p:13, c:0.5, g:0.2 },
        { n:'Água', q:'300 ml', kcal:0, p:0, c:0, g:0 }
      ]}
    ]
  },
  {
    id:'cafe', nome:'Café da Manhã', hora:'07:30 — 08:30', icone:'☀️', alvo:420,
    nota:'Primeira das quatro doses de proteína do dia. Mire 35-40 g aqui — dose alta pela manhã melhora a retenção de massa magra em déficit.',
    opcoes:[
      { label:'Ovos & pão', itens:[
        { n:'Ovos inteiros mexidos', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6, prep:'Na frigideira antiaderente com azeite em spray' },
        { n:'Claras', q:'3 un (100 g)', kcal:57, p:13.2, c:0, g:0.1 },
        { n:'Pão de forma integral', q:'2 fatias (50 g)', kcal:126, p:4.8, c:25, g:1.8 },
        { n:'Tomate', q:'80 g', kcal:12, p:0.9, c:2.5, g:0.2 },
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Grego & aveia', itens:[
        { n:'Iogurte grego zero', q:'200 g', kcal:120, p:20, c:8, g:0.8 },
        { n:'Aveia em flocos', q:'30 g', kcal:118, p:4.2, c:20, g:2.6 },
        { n:'Morangos', q:'100 g', kcal:30, p:0.9, c:6.8, g:0.3 },
        { n:'Chia', q:'10 g', kcal:49, p:1.7, c:4.2, g:3.1 },
        { n:'Pasta de amendoim integral', q:'1 c. sopa (15 g)', kcal:95, p:3.3, c:3.6, g:7.4 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Tapioca proteica', itens:[
        { n:'Goma de tapioca hidratada', q:'40 g', kcal:96, p:0.1, c:23.6, g:0 },
        { n:'Frango desfiado', q:'100 g', kcal:163, p:31.5, c:0, g:3.2, prep:'Cozido e desfiado; tempere com páprica e alho' },
        { n:'Queijo cottage', q:'40 g', kcal:36, p:4.8, c:1.2, g:1.4 },
        { n:'Leite desnatado', q:'200 ml', kcal:70, p:7.2, c:9.8, g:0.2, prep:'Com café' },
        { n:'Mamão formosa', q:'100 g', kcal:45, p:0.8, c:11.6, g:0.1 }
      ]},
      { label:'Omelete', itens:[
        { n:'Ovos inteiros', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6 },
        { n:'Claras', q:'3 un (100 g)', kcal:57, p:13.2, c:0, g:0.1 },
        { n:'Queijo cottage', q:'50 g', kcal:45, p:6, c:1.5, g:1.8 },
        { n:'Espinafre e tomate', q:'100 g', kcal:19, p:1.9, c:3, g:0.3, prep:'Refogados dentro da omelete' },
        { n:'Pão de forma integral', q:'1 fatia (25 g)', kcal:63, p:2.4, c:12.5, g:0.9 },
        { n:'Mamão formosa', q:'150 g', kcal:68, p:1.2, c:17.4, g:0.2 }
      ]},
      { label:'Shake corrido', itens:[
        { n:'Whey concentrado', q:'30 g', kcal:120, p:24, c:3, g:1.5, prep:'Bata tudo no liquidificador' },
        { n:'Leite desnatado', q:'200 ml', kcal:70, p:7.2, c:9.8, g:0.2 },
        { n:'Banana nanica congelada', q:'100 g', kcal:92, p:1.4, c:23.8, g:0.1 },
        { n:'Aveia em flocos', q:'25 g', kcal:99, p:3.5, c:16.7, g:2.1 },
        { n:'Pasta de amendoim', q:'1 c. chá (7 g)', kcal:44, p:1.5, c:1.7, g:3.5 }
      ]}
    ]
  },
  {
    id:'almoco', nome:'Almoço', hora:'12:30 — 13:30', icone:'🍽️', alvo:610,
    nota:'É a sua refeição pós-treino. Mire 60 g de proteína e o maior aporte de carboidrato do dia — o músculo está mais receptivo agora.',
    opcoes:[
      { label:'Clássico brasileiro', itens:[
        { n:'Patinho grelhado', q:'140 g', kcal:307, p:50.3, c:0, g:10.2, prep:'Grelhe na chapa; tempere com alho e ervas' },
        { n:'Arroz integral cozido', q:'120 g', kcal:149, p:3.1, c:31, g:1.2 },
        { n:'Feijão carioca cozido', q:'130 g', kcal:99, p:6.2, c:17.7, g:0.7 },
        { n:'Salada de alface, tomate e pepino', q:'150 g', kcal:18, p:1.7, c:3.4, g:0.2 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 }
      ]},
      { label:'Frango & batata doce', itens:[
        { n:'Frango grelhado, peito', q:'180 g', kcal:286, p:57.6, c:0, g:4.5, prep:'Marinado em limão, alho e páprica' },
        { n:'Batata doce cozida', q:'250 g', kcal:193, p:1.5, c:46, g:0.3 },
        { n:'Brócolis cozido', q:'150 g', kcal:38, p:3.2, c:6.6, g:0.5 },
        { n:'Cenoura crua ralada', q:'80 g', kcal:27, p:1, c:6.2, g:0.2 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 },
        { n:'Laranja pera', q:'100 g', kcal:37, p:1, c:8.9, g:0.1 }
      ]},
      { label:'Peixe branco', itens:[
        { n:'Tilápia grelhada', q:'200 g', kcal:258, p:52.4, c:0, g:4, prep:'No forno ou airfryer com limão e ervas' },
        { n:'Arroz integral cozido', q:'180 g', kcal:223, p:4.7, c:46.4, g:1.8 },
        { n:'Vagem e cenoura no vapor', q:'150 g', kcal:44, p:2.3, c:9.8, g:0.3 },
        { n:'Feijão preto cozido', q:'80 g', kcal:62, p:3.6, c:11.2, g:0.4 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 }
      ]},
      { label:'Macarrão à bolonhesa', itens:[
        { n:'Macarrão integral cozido', q:'180 g', kcal:223, p:9.5, c:47.7, g:0.9 },
        { n:'Patinho moído', q:'140 g', kcal:307, p:50.3, c:0, g:10.2, prep:'Refogue sem óleo; escorra a gordura' },
        { n:'Molho de tomate caseiro', q:'120 g', kcal:46, p:1.6, c:8.4, g:0.8 },
        { n:'Salada verde grande', q:'150 g', kcal:18, p:1.7, c:3.4, g:0.2 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 }
      ]},
      { label:'Bowl mexicano', itens:[
        { n:'Frango desfiado', q:'170 g', kcal:277, p:53.6, c:0, g:5.4, prep:'Cozido e desfiado com cominho e páprica defumada' },
        { n:'Feijão preto cozido', q:'130 g', kcal:100, p:5.9, c:18.2, g:0.7 },
        { n:'Arroz integral cozido', q:'120 g', kcal:149, p:3.1, c:31, g:1.2 },
        { n:'Abacate', q:'50 g', kcal:48, p:0.6, c:3, g:4.2 },
        { n:'Pico de gallo (tomate, cebola, coentro, limão)', q:'100 g', kcal:22, p:1, c:4.5, g:0.2 }
      ]}
    ]
  },
  {
    id:'tarde', nome:'Café da Tarde', hora:'16:00 — 17:00', icone:'💪', alvo:310,
    nota:'O seu combo favorito continua aqui — só ajustei as quantidades. Terceira dose de proteína.',
    opcoes:[
      { label:'Combo favorito', itens:[
        { n:'Iogurte grego zero', q:'170 g', kcal:102, p:17, c:6.8, g:0.7 },
        { n:'Whey concentrado', q:'25 g', kcal:100, p:20, c:2.5, g:1.3, prep:'Misture direto no iogurte' },
        { n:'Granola sem açúcar', q:'25 g', kcal:113, p:2.8, c:15, g:4.3, prep:'Pese! 100 g de granola são 450 kcal' },
        { n:'Canela', q:'a gosto', kcal:3, p:0.1, c:0.8, g:0 }
      ]},
      { label:'Pão com atum', itens:[
        { n:'Pão de forma integral', q:'2 fatias (50 g)', kcal:126, p:4.8, c:25, g:1.8 },
        { n:'Atum light em água, drenado', q:'100 g', kcal:100, p:23, c:0, g:0.8 },
        { n:'Queijo cottage', q:'40 g', kcal:36, p:4.8, c:1.2, g:1.4 },
        { n:'Alface e tomate', q:'60 g', kcal:8, p:0.7, c:1.4, g:0.1 },
        { n:'Mostarda', q:'1 c. sopa (15 g)', kcal:10, p:0.6, c:0.9, g:0.5 }
      ]},
      { label:'Shake & fruta', itens:[
        { n:'Whey isolado', q:'30 g', kcal:110, p:26, c:1, g:0.3 },
        { n:'Leite desnatado', q:'200 ml', kcal:70, p:7.2, c:9.8, g:0.2 },
        { n:'Cacau 100%', q:'5 g', kcal:20, p:1, c:2.4, g:1.1 },
        { n:'Maçã com casca', q:'150 g', kcal:84, p:0.5, c:22.8, g:0 }
      ]},
      { label:'Crepioca', itens:[
        { n:'Ovo inteiro', q:'1 un (50 g)', kcal:73, p:6.6, c:0.3, g:4.8 },
        { n:'Clara', q:'1 un (33 g)', kcal:19, p:4.4, c:0, g:0 },
        { n:'Goma de tapioca', q:'20 g', kcal:48, p:0.1, c:11.8, g:0 },
        { n:'Frango desfiado', q:'90 g', kcal:147, p:28.4, c:0, g:2.9 },
        { n:'Queijo cottage', q:'30 g', kcal:27, p:3.6, c:0.9, g:1.1 }
      ]},
      { label:'Ovos & vegetais', itens:[
        { n:'Ovos cozidos', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6 },
        { n:'Queijo cottage', q:'50 g', kcal:45, p:6, c:1.5, g:1.8 },
        { n:'Cenoura e pepino em palitos', q:'150 g', kcal:33, p:1.6, c:7.3, g:0.2 },
        { n:'Pão de forma integral', q:'1 fatia (25 g)', kcal:63, p:2.4, c:12.5, g:0.9 },
        { n:'Whey isolado', q:'10 g', kcal:37, p:8.7, c:0.3, g:0.1 }
      ]}
    ]
  },
  {
    id:'janta', nome:'Janta', hora:'19:30 — 20:30', icone:'🌙', alvo:510,
    nota:'Carboidrato mais baixo, proteína alta. Última dose grande do dia.',
    opcoes:[
      { label:'Salmão & legumes', itens:[
        { n:'Salmão grelhado', q:'150 g', kcal:344, p:35.9, c:0, g:21, prep:'Azeite, limão e dill; 4 min de cada lado' },
        { n:'Brócolis e abobrinha no vapor', q:'200 g', kcal:40, p:3.2, c:7.4, g:0.5 },
        { n:'Batata doce assada', q:'150 g', kcal:116, p:0.9, c:27.6, g:0.2 },
        { n:'Salada de folhas', q:'100 g', kcal:11, p:1.3, c:1.7, g:0.2 }
      ]},
      { label:'Omelete reforçada', itens:[
        { n:'Ovos inteiros', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6 },
        { n:'Claras', q:'4 un (132 g)', kcal:76, p:17.6, c:0, g:0.1 },
        { n:'Queijo cottage', q:'60 g', kcal:54, p:7.2, c:1.8, g:2.1 },
        { n:'Espinafre, cebola e tomate', q:'150 g', kcal:28, p:2.8, c:4.5, g:0.5 },
        { n:'Pão de forma integral', q:'2 fatias (50 g)', kcal:126, p:4.8, c:25, g:1.8 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 },
        { n:'Iogurte grego zero', q:'100 g', kcal:60, p:10, c:4, g:0.4, prep:'De sobremesa, com canela' }
      ]},
      { label:'Frango & purê', itens:[
        { n:'Frango grelhado, peito', q:'180 g', kcal:286, p:57.6, c:0, g:4.5 },
        { n:'Purê de abóbora e chuchu', q:'250 g', kcal:60, p:1.8, c:13, g:0.5, prep:'Cozido e amassado, sem manteiga' },
        { n:'Salada grande com azeite', q:'150 g', kcal:18, p:1.7, c:3.4, g:0.2 },
        { n:'Azeite de oliva', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 },
        { n:'Abacate', q:'40 g', kcal:38, p:0.5, c:2.4, g:3.4 },
        { n:'Arroz integral cozido', q:'80 g', kcal:99, p:2.1, c:20.6, g:0.8 }
      ]},
      { label:'Sopa proteica', itens:[
        { n:'Patinho em cubos', q:'140 g', kcal:307, p:50.3, c:0, g:10.2 },
        { n:'Legumes variados (abobrinha, chuchu, cenoura, vagem)', q:'300 g', kcal:66, p:3.6, c:14.4, g:0.5 },
        { n:'Batata inglesa', q:'120 g', kcal:62, p:1.4, c:14.3, g:0 },
        { n:'Azeite de oliva', q:'1 c. sopa (8 g)', kcal:72, p:0, c:0, g:8 }
      ]},
      { label:'Wrap de frango', itens:[
        { n:'Tortilla integral', q:'1 un (40 g)', kcal:120, p:4, c:20, g:2.5 },
        { n:'Frango desfiado', q:'150 g', kcal:245, p:47.3, c:0, g:4.8 },
        { n:'Queijo cottage', q:'50 g', kcal:45, p:6, c:1.5, g:1.8 },
        { n:'Folhas, tomate e cebola roxa', q:'100 g', kcal:14, p:1.2, c:2.6, g:0.2 },
        { n:'Iogurte grego zero', q:'100 g', kcal:60, p:10, c:4, g:0.4, prep:'De sobremesa' },
        { n:'Morangos', q:'100 g', kcal:30, p:0.9, c:6.8, g:0.3 }
      ]}
    ]
  },
  {
    id:'ceia', nome:'Ceia', hora:'22:00', icone:'🌜', alvo:130,
    nota:'Opcional. Proteína de digestão lenta antes de dormir ajuda a recuperação — e mata a fome que faz a dieta desandar.',
    opcoes:[
      { label:'Grego & morango', itens:[
        { n:'Iogurte grego zero', q:'170 g', kcal:102, p:17, c:6.8, g:0.7 },
        { n:'Morangos', q:'80 g', kcal:24, p:0.7, c:5.4, g:0.2 },
        { n:'Canela', q:'a gosto', kcal:3, p:0.1, c:0.8, g:0 }
      ]},
      { label:'Cottage', itens:[
        { n:'Queijo cottage', q:'150 g', kcal:135, p:18, c:4.5, g:5.3 },
        { n:'Canela e adoçante', q:'a gosto', kcal:3, p:0.1, c:0.8, g:0 }
      ]},
      { label:'Caseína', itens:[
        { n:'Caseína ou albumina', q:'30 g', kcal:110, p:24, c:3, g:0.5, prep:'Batida na água' },
        { n:'Castanha-do-pará', q:'1 un (4 g)', kcal:27, p:0.6, c:0.6, g:2.7 }
      ]},
      { label:'Ovos', itens:[
        { n:'Ovos cozidos', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6 }
      ]}
    ]
  }
];

/* ---------- REFEIÇÕES LIVRES ---------- */
const FREE_MEALS = {
  quando: 'Sexta e sábado à noite',
  teto: 1100,
  regra: 'Teto de 1.100 kcal por refeição livre. Ela SUBSTITUI a janta planejada (~560 kcal), então o excesso real é de ~540 kcal cada. Duas por semana = ~1.080 kcal, que já estão orçados no balanço semanal.',
  matematica: [
    { cenario:'Livre de 1.100 kcal', excesso:'+1.080/semana', resultado:'0,64 kg/semana', veredito:'ok', nota:'É o plano. Chega a ~89 kg no torneio.' },
    { cenario:'Livre de 1.500 kcal', excesso:'+1.880/semana', resultado:'0,49 kg/semana', veredito:'med', nota:'Ainda funciona, mas você chega a ~90 kg.' },
    { cenario:'Livre de 2.500 kcal (pizza + 4 chopes + sobremesa)', excesso:'+3.880/semana', resultado:'0,23 kg/semana', veredito:'ruim', nota:'1,6 kg em 7 semanas. A meta se perde aqui.' }
  ],
  dicas: [
    'Mantenha 40-50 g de proteína dentro da refeição livre — ela sacia e protege a massa magra.',
    'Coma normal nas outras refeições do dia. Não "guarde" calorias pulando o almoço: isso leva à compulsão.',
    'Álcool tem 7 kcal/g, suprime a queima de gordura e destrói a qualidade do sono. Máximo 2 doses — e ZERO nas 72h antes do torneio.',
    'Nas semanas 5 e 6, converta a livre de sexta em recarga de carboidrato: sushi, massa, arroz, pão. Mesmo prazer, gordura baixa, glicogênio cheio.',
    'Peça a versão grelhada, divida a sobremesa, e tome água entre as garfadas. Nada disso é sacrifício — é o que mantém o teto de 1.100.'
  ],
  sugestoes: [
    'Rodízio de sushi com foco em sashimi e niguiri — proteína alta, gordura baixa',
    'Churrasco: picanha sem a capa de gordura, frango, salada à vontade, farofa de leve',
    'Hambúrguer artesanal simples, sem bacon duplo e sem batata grande',
    'Pizza: 3 fatias de massa fina com recheio magro + salada antes',
    'Massa ao molho de tomate com carne moída magra'
  ]
};

/* ---------- SUPLEMENTOS ---------- */
const SUPPS = [
  { nome:'Creatina monoidratada', dose:'5 g por dia, todo dia', quando:'Qualquer horário',
    nota:'Comece HOJE. A retenção de água é intracelular (dentro do músculo, não sob a pele) e adiciona 1-2 kg na balança nas primeiras 2-4 semanas. Começando agora, esse ganho já terá acontecido e não vai poluir a leitura do peso em setembro.', prio:'alta' },
  { nome:'Whey protein', dose:'25-35 g conforme a refeição', quando:'Pós-treino ou onde faltar proteína',
    nota:'Ferramenta prática para bater 195 g/dia tendo só 40 min de almoço.', prio:'alta' },
  { nome:'Cafeína', dose:'3-6 mg/kg = 280-560 mg. Na prática: 200-300 mg', quando:'45-60 min antes do jogo; 150-200 mg antes do treino',
    nota:'Teto de 400 mg/dia. Nada depois das 14h. NUNCA estreie no dia do torneio — teste nas próximas semanas.', prio:'alta' },
  { nome:'Eletrólitos / sódio', dose:'500-1.000 mg de sódio por litro (até 1.500 no calor extremo)', quando:'Durante jogos e treinos ao sol',
    nota:'É o principal antídoto contra cãibra. Não restrinja sal — você sua muito na areia.', prio:'alta' },
  { nome:'Beta-alanina', dose:'4-6 g/dia divididos em 2 doses de 2-3 g', quando:'Todo dia, por pelo menos 4 semanas',
    nota:'Você tem 48 dias — dá tempo de saturar. Ganho modesto, útil em games longos. O formigamento some ao fracionar a dose.', prio:'media' },
  { nome:'Ômega-3 (EPA+DHA)', dose:'2-3 g por dia', quando:'Com uma refeição',
    nota:'Modulação inflamatória — relevante para a lombar e para a recuperação entre jogos.', prio:'media' },
  { nome:'Vitamina D', dose:'2.000-4.000 UI se o exame mostrar nível baixo', quando:'Com refeição que tenha gordura',
    nota:'Dose o 25(OH)D antes. Importante para osso e disco.', prio:'media' },
  { nome:'Magnésio', dose:'400 mg', quando:'À noite',
    nota:'Cãibra e qualidade do sono.', prio:'baixa' }
];

const SUPPS_EVITAR = 'Evite termogênicos e diuréticos. Risco cardiovascular no calor e desidratação — exatamente o oposto do que jogar na areia sob sol exige.';

/* ---------- ALERTAS MÉDICOS ---------- */
const RED_FLAGS = {
  titulo: 'Quando parar e procurar um médico',
  itens: [
    'Dor que irradia abaixo do joelho, formigamento ou dormência no pé ou na perna.',
    'Fraqueza para levantar a ponta do pé ou para ficar na ponta dos pés.',
    'Dor lombar que persiste mais de 1 hora depois do treino, ou que piora sessão após sessão.',
    'Qualquer alteração no controle de bexiga ou intestino, ou dormência na região da sela — isso é emergência.',
    'Dor noturna que acorda você, febre, ou perda de peso não explicada pela dieta.'
  ],
  nota: 'Este programa foi construído a partir da literatura científica, mas nenhum plano substitui a avaliação de um médico ou fisioterapeuta que possa examinar você e ver seus exames de imagem. Hérnias em L2-L3 e L3-L4 são menos comuns que as de L4-L5 e L5-S1 e merecem acompanhamento profissional antes de qualquer carga pesada.'
};

/* ---------- FONTES ---------- */
const REFS = [
  { t:'Wilke et al. 1999 — pressão intradiscal medida in vivo', u:'https://pubmed.ncbi.nlm.nih.gov/10222525/', tag:'Lombar' },
  { t:'McGill Big 3 — execução e progressões (BackFitPro)', u:'https://www.backfitpro.com/mastering-the-mcgill-big-three-progressions-variations-and-common-pitfalls/', tag:'Lombar' },
  { t:'Biering-Sørensen — resistência de core prediz lombalgia', u:'https://www.physio-pedia.com/Biering-Sorenson_Test', tag:'Lombar' },
  { t:'Adams, Dolan & Hutton 1987 — variação diurna nas tensões da coluna', u:'https://pubmed.ncbi.nlm.nih.gov/3589804/', tag:'Lombar' },
  { t:'Lesões ortopédicas em jogadores brasileiros de beach tennis', u:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11193591/', tag:'Beach tennis' },
  { t:'Análise temporal do beach tennis de elite (World BT Tour)', u:'https://doi.org/10.1177/17479541251319279', tag:'Beach tennis' },
  { t:'Demandas fisiológicas do beach tennis (Frontiers 2024)', u:'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2024.1434636/full', tag:'Beach tennis' },
  { t:'Lejeune, Willems & Heglund 1998 — custo energético de correr na areia', u:'https://pubmed.ncbi.nlm.nih.gov/9622579/', tag:'Areia' },
  { t:'Meta-análise de supersets — mesma adaptação em 37% menos tempo', u:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12011898/', tag:'Treino' },
  { t:'Schoenfeld, Ogborn & Krieger — dose-resposta de volume', u:'https://www.tandfonline.com/doi/full/10.1080/02640414.2016.1210197', tag:'Treino' },
  { t:'Roth 2023 — volume não altera retenção de massa magra em déficit', u:'https://onlinelibrary.wiley.com/doi/10.1111/sms.14237', tag:'Treino' },
  { t:'Wilson 2012 — efeito de interferência do treino concorrente', u:'https://journals.lww.com/nsca-jscr/fulltext/2012/08000/concurrent_training__a_meta_analysis_examining.35.aspx', tag:'Treino' },
  { t:'Bosquet — meta-análise sobre taper', u:'https://www.semanticscholar.org/paper/Effects-of-tapering-on-performance%3A-a-Bosquet-Montpetit/a41517ab5fa06b92568b861e2b1aa32b3003d214', tag:'Taper' },
  { t:'Taper em esportes coletivos — meta-análise (Freitas 2020)', u:'https://pubmed.ncbi.nlm.nih.gov/32172680/', tag:'Taper' },
  { t:'Garthe 2011 — taxa de perda de peso em atletas de elite', u:'https://pubmed.ncbi.nlm.nih.gov/21558571/', tag:'Nutrição' },
  { t:'Helms 2014 — proteína em restrição calórica', u:'https://journals.humankinetics.com/view/journals/ijsnem/24/2/article-p127.xml', tag:'Nutrição' },
  { t:'Morton 2018 — meta-análise de proteína (49 estudos)', u:'https://pubmed.ncbi.nlm.nih.gov/28698222/', tag:'Nutrição' },
  { t:'Schoenfeld 2014 — cardio em jejum não traz vantagem', u:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4242477/', tag:'Nutrição' },
  { t:'TACO 4ª ed. — Tabela Brasileira de Composição de Alimentos', u:'https://nepa.unicamp.br/publicacoes/tabela-taco-pdf/', tag:'Nutrição' },
  { t:'Compendium of Physical Activities — valores de MET', u:'https://pacompendium.com/bicycling/', tag:'Energia' },
  { t:'Tanaka 2001 — equação de frequência cardíaca máxima', u:'https://www.sciencedirect.com/science/article/pii/S0735109700010548', tag:'Energia' },
  { t:'Viana 2019 (BJSM) — HIIT vs contínuo para perda de gordura', u:'https://pubmed.ncbi.nlm.nih.gov/30765340/', tag:'Cardio' },
  { t:'Cadência e fadiga do quadríceps (EJAP 2023)', u:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11055783/', tag:'Cardio' },
  { t:'Protocolo RAMP de aquecimento (Jeffreys)', u:'https://blog.teambuildr.com/understanding-and-implementing-the-ramp-protocol', tag:'Torneio' },
  { t:'Cochrane — cintas lombares não previnem dor', u:'https://pubmed.ncbi.nlm.nih.gov/18425875/', tag:'Torneio' },
  { t:'ISSN — cafeína e performance (2021)', u:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7777221/', tag:'Suplementos' }
];
