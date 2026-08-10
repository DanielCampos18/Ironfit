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
  fatorBase: 1.3,
  base: 2550,        // 1961 × 1,3 — TMB + efeito térmico + deslocamento do dia a dia
  notaBase: 'O multiplicador 1,2 seria "sedentário puro": escritório e quase nenhum deslocamento. Para quem trabalha e anda no dia a dia, 1,3 é mais fiel — e faz diferença de quase 200 kcal por dia. Se em 3 semanas o peso cair mais rápido que o previsto, o seu número real é maior; se cair menos, é menor. A balança é o instrumento; a conta é só o ponto de partida.',
  atividades: [
    { id: 'muscu',  nome: 'Musculação 42 min',      met: 6.0, min: 42, liquido: 345, desc: 'Supersets, descanso curto' },
    { id: 'bikeZ2', nome: 'Bike Zona 2 · 30 min',   met: 6.8, min: 30, liquido: 286, desc: '85-95 RPM, FC 123-142' },
    { id: 'bikeHI', nome: 'Bike HIIT · 30 min',     met: 8.8, min: 30, liquido: 383, desc: '4 × 3 min forte' },
    { id: 'casa',   nome: 'Bloco de casa · 18 min', met: 5.5, min: 18, liquido: 133, desc: 'Potência e agilidade' },
    { id: 'jogo',   nome: 'Beach tennis 60 min',    met: 7.5, min: 60, liquido: 642, desc: 'Duplas, ritmo de treino' }
  ],
  formula: 'kcal/min = MET × 3,5 × peso(kg) ÷ 200 · líquido = bruto − metabolismo de repouso do período'
};

/* ---------- TIPOS DE DIA ----------
   Calorias cicladas: carboidrato vai para onde rende performance.
   Proteína e gordura ficam fixas todo dia. */
const DAYTYPES = {
  treino: { id:'treino', nome:'Dia de treino', kcal:2200, prot:195, gord:62, carb:216, tdee:3181, cor:'#a78bfa',
            desc:'Bike de manhã + academia no almoço' },
  jogo:   { id:'jogo',   nome:'Dia de jogo',   kcal:2500, prot:195, gord:62, carb:291, tdee:3192, cor:'#22d3ee',
            desc:'Beach tennis — carbo mais alto para sustentar o jogo' },
  leve:   { id:'leve',   nome:'Dia leve',      kcal:2050, prot:195, gord:62, carb:178, tdee:2836, cor:'#5eead4',
            desc:'Só bike, sem academia' },
  off:    { id:'off',    nome:'Descanso',      kcal:1850, prot:195, gord:62, carb:128, tdee:2550, cor:'#7d769b',
            desc:'Sem treino — só o bloco de casa' }
};

/* ---------- BALANÇO SEMANAL ----------
   Derivado da soma dos 7 dias da semana-tipo. Conferido por script. */
const WEEKLY = {
  tdee: 21016,       // 4 dias de treino + 1 de jogo + 2 off
  ingestao: 16200,   // 15.000 do plano + 1.200 de excesso das 2 refeições livres
  deficit: 4816,
  kgSemana: 0.63,
  pctPeso: 0.67,
  pctDeficit: 23,
  nota: 'Garthe et al. 2011: perder 0,7% do peso por semana aumentou massa magra em 2,1% em atletas de elite; 1,4%/semana estagnou a massa magra e derrubou a força. Você está em 0,67% — exatamente na faixa que constrói músculo enquanto perde gordura.'
};

/* ---------- PROJEÇÃO ---------- */
const PROJECTION = {
  semanasDeficit: 6,
  gorduraPerdida: 3.8,
  aguaGlicogenio: 1.0,
  totalBalanca: 4.8,
  pesoEm2009: 89.2,
  pesoNoTorneio: 90.2,
  recado: 'A pesagem que conta é 20/09, no fim da semana 6: cerca de 89 kg, quase 5 kg abaixo do início. Na manhã do torneio a balança marca ~1 kg a mais por causa da recarga de carboidrato — isso é combustível dentro do músculo, não gordura. Sua gordura corporal terá caído perto de 4 kg.',
  metaOriginal: 'Você pediu 5-6 kg. Acima de 0,7% do peso por semana a massa magra estagna e a força cai (Garthe 2011) — e força cair é perder a explosão que o torneio exige. O plano entrega ~5 kg com a potência intacta. Os outros 6 kg até os 83 kg têm 13 semanas de sobra depois do torneio, a 0,4 kg/semana.',
  ajuste: 'REGRA DE AJUSTE: pese-se 3× por semana, sempre de manhã em jejum, e compare a MÉDIA de cada semana. Se em 3 semanas você perdeu menos de 0,4 kg/semana, tire 150 kcal/dia. Se perdeu mais de 0,9 kg/semana, some 200 kcal/dia — perder rápido demais custa músculo e velocidade.'
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
      'Bike ou elíptico leve — 90 s',
      'Band pull-apart — 2 × 15',
      'Rotação torácica deitado de lado — 8 cada lado',
      '1 série de aproximação leve no supino'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        nota:'A máquina convergente permite carga pesada com a coluna totalmente apoiada e o caminho da barra fechando no topo, o que o Smith não faz. Suba explosivo: a intenção de acelerar gera estímulo de potência sem custar tempo.',
        exercicios:[
          { nome:'Supino Inclinado 30° — Halteres', series:4, reps:'6-8', rir:'2',
            alt:'Máquina convergente ou Smith inclinado, se houver.',
            tip:'Banco a 30° — Henselmans aponta esse ângulo como o melhor meio-termo: pega a porção clavicular sem jogar tudo no ombro. Costas coladas no banco, sem ponte lombar. Halteres dão mais amplitude que a barra. Primeira série de aproximação.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'Peito e bíceps não competem: enquanto um trabalha, o outro descansa de verdade. O crucifixo unilateral deitado é o exercício de peito com maior alongamento sob carga — e é no alongamento que o músculo mais cresce.',
        exercicios:[
          { nome:'Crucifixo Unilateral no Cabo — deitado no banco', series:3, reps:'10-12 cada lado', rir:'1',
            alt:'Sem espaço para o banco no cross-over: faça em pé, cabo na altura do peito, um braço por vez.',
            tip:'Banco reto entre duas polias baixas, um braço por vez. O cabo mantém tensão no ponto de maior alongamento, coisa que o halter perde. Cotovelo levemente dobrado e fixo — é um arco, não um empurrão.' },
          { nome:'Rosca Scott Unilateral no Cabo', series:3, reps:'10-12 cada lado', rir:'1',
            tip:'Banco Scott na frente da polia baixa. Cabeça curta do bíceps, tensão constante no fundo. Unilateral corrige o desequilíbrio entre os lados, comum em quem joga raquete.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'60s',
        nota:'A rosca Bayesian coloca o cotovelo ATRÁS do tronco, que é a única forma de alongar a cabeça longa do bíceps sob carga. É a peça que faltava no programa antigo.',
        exercicios:[
          { nome:'Mergulho nas Paralelas — tronco inclinado', series:3, reps:'8-12', rir:'1',
            alt:'Sem graviton nem paralela: Supino Reto com Halteres, 3 × 8-10.',
            tip:'Incline o tronco à frente uns 20-30° para jogar o trabalho no peitoral em vez do tríceps. Use o graviton (máquina assistida) ou um elástico apoiado nos joelhos para regular a carga. Não desça além do confortável no ombro.' },
          { nome:'Rosca Bayesian no Cabo', series:3, reps:'10-12', rir:'1',
            alt:'Rosca no banco inclinado 45° com halteres — mesmo efeito de alongar a cabeça longa.',
            tip:'De costas para a polia baixa, dê um passo à frente até o cabo puxar o braço para trás. Cotovelo fica atrás da linha do corpo o movimento inteiro. Sem balançar o tronco.' }
        ]},
      { tipo:'final', nome:'Finalizador', descanso:'45s',
        nota:'Pegada pronada recruta braquial e braquiorradial — a parte do braço que aparece de lado e que transfere para a pegada da raquete.',
        exercicios:[
          { nome:'Rosca Inversa na Polia', series:2, reps:'12-15', rir:'0-1',
            tip:'Pegada pronada (palmas para baixo) na barra reta da polia baixa. Carga leve, punhos firmes e neutros. Pode ir até a falha.' }
        ]}
    ]
  },

  B: {
    id:'B', nome:'Ombro + Tríceps', foco:'Empurrar vertical', icone:'⚡', cor:'#22d3ee', teto:45,
    aquecimento:{ min:3, itens:[
      'Bike leve — 90 s',
      'Rotação externa no cabo a 90° de abdução — 2 × 15 leve (posição de arremesso)',
      'Band pull-apart — 2 × 15',
      '1 série de aproximação no desenvolvimento'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        exercicios:[
          { nome:'Desenvolvimento Sentado — Halteres com encosto', series:3, reps:'8-12', rir:'2', alert:true,
            alt:'Máquina de desenvolvimento, se houver — ainda melhor, porque o encosto é fixo.',
            tip:'Encosto a 80-85°, glúteo e lombar colados nele. É a única forma de carregar pesado em flexão de ombro com a coluna apoiada — em pé com barra você compensa arqueando a lombar. Não trave o cotovelo no topo.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'A polia por TRÁS do corpo mantém tensão desde o início do movimento; o halter só carrega de verdade nos últimos 30° e a polia da frente perde tensão embaixo. É a versão superior da elevação lateral que você já fazia.',
        exercicios:[
          { nome:'Elevação Lateral Unilateral no Cabo — polia baixa por trás do corpo', series:3, reps:'12-15 cada lado', rir:'1',
            tip:'O cabo passa por trás das costas. Pegada neutra, polegar à frente, sem rodar o ombro para dentro. Pare na altura do ombro. Mão livre apoiada na torre para não jogar o tronco.' },
          { nome:'Extensão Overhead no Cabo com Corda — sentado de costas para a polia', series:3, reps:'10-12', rir:'1',
            alt:'Sem polia livre: tríceps francês sentado com halter, segurando com as duas mãos.',
            tip:'A cabeça longa do tríceps só alonga com o braço ACIMA da cabeça — e é a maior das três. Maeo mostrou crescimento bem superior ao pushdown. Sentado no banco com encosto, cotovelos apontando para a frente.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'60s',
        nota:'O deltoide posterior é o freio do braço no smash. Treinar a fase excêntrica dele é prevenção direta: ombro responde por 14% das lesões no beach tennis.',
        exercicios:[
          { nome:'Crucifixo Inverso no Cabo Cruzado', series:3, reps:'12-15', rir:'1',
            alt:'Voador invertido (peck deck invertido) — praticamente equivalente.',
            tip:'Em pé entre as polias, cabos cruzados na frente do corpo, cotovelos quase estendidos. Abertura pura na altura do ombro, com 2 s de excêntrica — é essa fase que treina a desaceleração.' },
          { nome:'Tríceps Testa em Banco Inclinado 30° — Halteres', series:3, reps:'10-12', rir:'2',
            tip:'Banco inclinado deixa os braços apontados para trás, aumentando o alongamento em relação ao banco reto. Halteres permitem punho neutro, mais confortável para o cotovelo.' }
        ]},
      { tipo:'final', nome:'Finalizador', descanso:'45s',
        exercicios:[
          { nome:'Tríceps Unilateral no Cabo — pegada supinada', series:2, reps:'12-15 cada lado', rir:'0-1',
            tip:'Palma para cima, cotovelo colado ao tronco. Foca as cabeças lateral e medial e fecha o braço. Pode chegar à falha, é polia.' }
        ]}
    ]
  },

  C: {
    id:'C', nome:'Costas + Posterior', foco:'Puxar', icone:'🏹', cor:'#5eead4', teto:45,
    aquecimento:{ min:3, itens:[
      'Bike leve — 90 s',
      'Band pull-apart — 2 × 15',
      'Ponte de glúteo — 1 × 15',
      '1 série de aproximação na remada'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        nota:'A remada cavalinho com apoio de peito é a única remada que permite carga pesada com momento lombar praticamente zero — Fenwick e McGill mediram isso. Para a sua hérnia, ela é insubstituível.',
        exercicios:[
          { nome:'Remada Máquina com Apoio de Peito', series:3, reps:'8-12', rir:'2',
            alt:'Remada cavalinho (T-bar) com o peito apoiado num banco inclinado. Última opção: remada baixa sentada no cabo, tronco travado a 90°.',
            tip:'O apoio de peito é o que torna esta a única remada pesada com momento lombar praticamente zero — Fenwick e McGill mediram isso. Para a sua hérnia, é insubstituível. Peito firme no apoio, puxe pelos cotovelos, 1 s de aperto nas escápulas.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'65s',
        nota:'A puxada unilateral tem amplitude maior que a bilateral e corrige a assimetria que todo jogador de raquete desenvolve. O pullover isola o latíssimo em extensão pura de ombro, sem o bíceps limitar a carga.',
        exercicios:[
          { nome:'Puxada Unilateral no Cabo Alto — meio-ajoelhado', series:3, reps:'10-12 cada lado', rir:'2',
            alt:'Sem manopla: puxada frente normal com pegada neutra (triângulo).',
            tip:'Ajoelhado de um joelho, de frente para a polia alta. Puxe o cotovelo para baixo e para trás, deixando a escápula subir no alongamento. Tronco firme — quem gira é nada.' },
          { nome:'Pullover no Cabo Alto', series:3, reps:'12-15', rir:'1',
            alt:'Pullover com halter deitado no banco, se a polia estiver ocupada.',
            tip:'Em pé, braços quase estendidos, puxe a barra num arco até a coxa sem dobrar o cotovelo. Latíssimo puro. Incline o tronco só uns 15° e mantenha-o parado.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'45s',
        nota:'Trapézio médio, romboides, deltoide posterior e rotadores externos num movimento só — é exatamente o pacote que sustenta o smash. E o Y-raise ataca o trapézio inferior, o elo mais fraco de quem joga acima da cabeça.',
        exercicios:[
          { nome:'Remada Baixa no Cabo com Corda até o Pescoço', series:3, reps:'12-15', rir:'1',
            tip:'Sentado, puxe a corda na altura do pescoço com os cotovelos ABERTOS e altos, terminando com rotação externa. Tronco ereto — não deixe a lombar arredondar ao ir para a frente.' },
          { nome:'Y-Raise no Banco Inclinado 30° — Halteres leves', series:3, reps:'12-15', rir:'1',
            alt:'Y-raise em pé com elástico preso embaixo, se não houver banco livre.',
            tip:'De bruços no banco inclinado, braços formando um Y acima da cabeça, polegares para cima. Empurre os halteres para longe da cabeça. Carga leve — 4 a 8 kg já é muito.' }
        ]},
      { tipo:'superset', nome:'Superset C', descanso:'45s',
        nota:'Fecha a cadeia posterior no dia de puxada. O posterior de coxa é o músculo que produz o arranque e o que mais estira em mudança de direção — por isso recebe estímulo em dois dias da semana, não em um.',
        exercicios:[
          { nome:'Flexora Deitada', series:3, reps:'12-15', rir:'1',
            tip:'Complementa a flexora sentada do treino D: a sentada alonga mais o biarticular, a deitada trabalha num ângulo de quadril diferente. Amplitude completa, sem levantar o quadril do apoio. É o substituto seguro do stiff.' },
          { nome:'Panturrilha Sentada', series:3, reps:'15-20', rir:'0-1',
            alt:'Sem a máquina sentada: sente-se no leg press horizontal com o joelho bem dobrado, ou apoie um halter sobre a coxa sentado num banco.',
            tip:'Joelho dobrado isola o SÓLEO, que é o motor da corrida em areia e o que mais fadiga. Zero carga axial. Dois segundos de alongamento no fundo, 1 s de aperto em cima.' }
        ]}
    ]
  },

  D: {
    id:'D', nome:'Pernas', foco:'Agachar e empurrar', icone:'🦵', cor:'#e879f9', teto:45,
    aquecimento:{ min:3, itens:[
      'Bike leve — 90 s',
      'Ponte de glúteo — 2 × 12',
      'Monster walk com miniband — 2 × 15 passos',
      '1 série de aproximação no agachamento'
    ]},
    blocos:[
      { tipo:'forca', nome:'Força Principal', descanso:'150s',
        nota:'O belt squat carrega o quadril por um cinto, sem NADA de carga passando pela coluna. Se a sua academia tiver, é de longe o melhor agachamento possível para uma hérnia lombar. Sem ele, o hack machine com parada aos 90° é a alternativa.',
        exercicios:[
          { nome:'Hack Machine — parando a 90° de joelho', series:3, reps:'8-12', rir:'2', alert:true,
            alt:'Agachamento no Smith com os pés bem à frente. Terceira opção: leg press 45° com amplitude PARCIAL (só até 90°, jamais profundo). Se a academia tiver belt squat, ele é melhor que todos — carrega o quadril por um cinto, sem nada passando pela coluna.',
            tip:'PARE a descida no instante em que a pelve começar a rodar para trás — esse é o ponto em que a lombar passa a flexionar sob carga. No hack, mantenha as costas inteiras coladas no apoio e os pés um pouco à frente.' }
        ]},
      { tipo:'superset', nome:'Superset A', descanso:'75s',
        nota:'A flexora SENTADA gera mais hipertrofia que a deitada (Maeo 2021) porque o quadril fletido alonga o posterior biarticular. E a extensora com encosto reclinado é a única forma de treinar bem o reto femoral, que cruza o quadril.',
        exercicios:[
          { nome:'Flexora Sentada', series:4, reps:'8-12', rir:'1',
            alt:'Só tem a deitada? Faça-a UNILATERAL (uma perna por vez) — assim ainda fica diferente da flexora deitada bilateral do treino C.',
            tip:'Maeo 2021 mostrou mais hipertrofia na sentada que na deitada: o quadril fletido alonga o posterior biarticular. Encosto quase a 90°, cinto pélvico firme, 1 s de pausa no maior alongamento.' },
          { nome:'Cadeira Extensora — encosto reclinado', series:3, reps:'10-15', rir:'1',
            alt:'Encosto não reclina? Sente-se deslizando um pouco o quadril para a frente, recostando o tronco.',
            tip:'Recline o encosto ao máximo que a máquina permitir. O quadril mais aberto alonga o reto femoral e é o que faz esse exercício render. Quadril não sai do banco, descida em 3 s.' }
        ]},
      { tipo:'superset', nome:'Superset B', descanso:'50s',
        nota:'O step-up lateral treina o mesmo padrão de subir e frear que o deslocamento lateral exige, sem a instabilidade do búlgaro. A abdução em pé no cabo carrega o glúteo médio em pé, que é como ele trabalha no jogo.',
        exercicios:[
          { nome:'Step-up Lateral no Caixote — Halteres', series:3, reps:'8-10 cada lado', rir:'1',
            alt:'Sem caixote: use o step do aeróbico empilhado ou um banco baixo firme.',
            tip:'Caixote na altura do joelho, de lado para ele. Suba SEM impulso da perna de baixo e desça em 3 s. Joelho alinhado com o segundo dedo do pé. Tronco ereto.' },
          { nome:'Abdução de Quadril no Cabo — em pé', series:3, reps:'12-15 cada lado', rir:'1',
            alt:'Sem tornozeleira: cadeira abdutora, com o tronco levemente inclinado à frente.',
            tip:'Tornozeleira na polia baixa, apoie a mão na torre. Abra a perna sem inclinar o tronco para o lado — se o tronco balança, a carga está alta demais. Glúteo médio é quem freia você na mudança de direção.' }
        ]},
      { tipo:'final', nome:'Finalizador', descanso:'45s',
        exercicios:[
          { nome:'Panturrilha em Pé no Hack Machine (ou máquina em pé)', series:3, reps:'10-15', rir:'0-1',
            alt:'Panturrilha no leg press, com os pés na borda da plataforma. Evite a de barra nas costas.',
            tip:'Joelho estendido isola o gastrocnêmio — o complemento da panturrilha sentada do treino C. Dois segundos de alongamento no fundo, amplitude total.' }
        ]}
    ]
  }
};

/* ============================================================
   BLOCO DE CASA — 15 a 20 min, PISO FIRME, todo dia
   Sem areia. Três sessões que rotacionam a intensidade, para ele
   treinar diariamente sem acumular impacto.
   ============================================================ */
const HOME = {
  nome: 'Bloco de Casa',
  min: 18,
  quando: 'Todo dia — de manhã depois da bicicleta ou no fim da tarde.',
  material: 'Um elástico (miniband ou tubo com alça), um caixote ou degrau, e um espaço de 2 × 3 metros.',
  porqueNoite: 'Se for de manhã, faça DEPOIS da bicicleta e nunca na primeira hora após acordar: a rigidez de flexão do disco é cerca de 300% maior nesse período (Adams & Dolan, Spine 1987). Fim de tarde é o horário mais seguro de todos.',
  avisoPisoFirme: 'Você não vai treinar na areia, e isso muda o desenho. A areia dissipa energia e tem MENOR força de reação ao solo — era o lugar mais seguro para saltar. Em piso firme o impacto é maior, então a regra passa a ser: cortar AMPLITUDE e ALTURA, nunca a intenção. Salto baixo e rápido tem pico de força bem menor que salto alto com aterrissagem profunda. Teto de 250 contatos por semana, e NUNCA com colete, halteres ou bola acima da cabeça — Fowler mostrou que 50 saltos com 8,5 kg de colete comprimem a coluna 3,5× mais que os mesmos 50 saltos sem carga.',
  rotacao: [
    { dia:'Seg', sessao:'A', contatos:'~70', intensidade:'Alta' },
    { dia:'Ter', sessao:'B', contatos:'~40', intensidade:'Média-alta' },
    { dia:'Qua', sessao:'C', contatos:'0',   intensidade:'Baixa' },
    { dia:'Qui', sessao:'A', contatos:'~50', intensidade:'Alta (volume −25%)' },
    { dia:'Sex', sessao:'B', contatos:'~40', intensidade:'Média' },
    { dia:'Sáb', sessao:'jogo ou C', contatos:'—', intensidade:'Baixa' },
    { dia:'Dom', sessao:'C + caminhada 25 min', contatos:'0', intensidade:'Regenerativa' }
  ],
  notaRotacao: 'A regra de 48-72h entre sessões vale para ALTA intensidade. Trabalho de baixa intensidade — pogos curtos, isometria, pé e tornozelo, mecânica sem carga — é treinável todo dia. Por isso a rotação: você faz algo diariamente sem repetir o mesmo estresse. A caminhada rápida de domingo não é enfeite: Belavý mostrou que acelerações nessa faixa são justamente as que hidratam o disco.',
  sessoes: [
    {
      id:'A', nome:'Sessão A — Potência', min:18, cor:'#a78bfa', contatos:'~70 contatos',
      quando:'Segunda e quinta',
      passos:[
        { t:'0-3 min',  o:'RAMP: 90/90 respiração 6 ciclos · cat-camel 6 · bird dog 4 cada lado · ponte de glúteo 12 · monster walk 15 passos' },
        { t:'3-7 min',  o:'Pogo hops bipodais — 4 × 12. Só tornozelo, joelho quase reto, contato mínimo com o chão. É o exercício-chave da rigidez de tornozelo.' },
        { t:'7-11 min', o:'Salto vertical com contramovimento — 4 × 4, pausa de 40 s. Máxima intenção na subida, aterrissagem SILENCIOSA. Se ouvir o baque, você desceu demais.' },
        { t:'11-15 min',o:'Skater hop lateral com parada — 3 × 6 cada lado. Salte de lado, aterrisse numa perna e SEGURE 1 s antes de voltar. A parada é o exercício.' },
        { t:'15-18 min',o:'Descompressão: suspensão passiva na barra ou no batente 2 × 20 s · flexor de quadril meio-ajoelhado 45 s cada lado · pernas no sofá com 8 respirações.' }
      ]
    },
    {
      id:'B', nome:'Sessão B — Agilidade', min:18, cor:'#22d3ee', contatos:'~40 contatos reativos',
      quando:'Terça e sexta',
      passos:[
        { t:'0-3 min',  o:'RAMP igual ao da sessão A.' },
        { t:'3-7 min',  o:'Split-step + arranque de 3 m — 6 × 4. Dispare ao som de um timer aleatório no celular. Aterrisse o split com o pé INTEIRO no chão, não na ponta.' },
        { t:'7-11 min', o:'Plyo step e hip turn (Lee Taft) — 3 × 5 cada lado. O primeiro passo de uma mudança de direção: pé de fora plantado fora da base, tronco inclinado na direção nova.' },
        { t:'11-15 min',o:'Shuffle lateral 3 m ida e volta — 4 × 3. Posição baixa, pés nunca se cruzam, tornozelo travado. Empurre o chão para o lado.' },
        { t:'15-18 min',o:'Descompressão igual à da sessão A.' }
      ]
    },
    {
      id:'C', nome:'Sessão C — Pé, tornozelo e tendão', min:16, cor:'#5eead4', contatos:'zero impacto',
      quando:'Quarta, domingo e nos dias de jogo',
      passos:[
        { t:'0-3 min',  o:'RAMP reduzido: respiração 90/90 · cat-camel 6 · ponte de glúteo 12.' },
        { t:'3-6 min',  o:'Short foot — 3 × 15 com 5 s de sustentação cada. Encurte o arco do pé puxando a base do dedão em direção ao calcanhar SEM dobrar os dedos. É o exercício com mais evidência para o pé.' },
        { t:'6-9 min',  o:'Preensão dos dedos com toalha — 3 × 15 cada pé. Puxe uma toalha no chão só com os dedos. Em atletas de areia, força de preensão dos dedos previu equilíbrio dinâmico.' },
        { t:'9-12 min', o:'Isometria de panturrilha sentado, joelho a 30° — 4 × 30 s (rampa de 4 s, segura 30 s, solta 4 s). Protocolo de Keith Baar para rigidez de tendão. Seguro todo dia.' },
        { t:'12-14 min',o:'Tibial anterior — 3 × 20. Calcanhares no chão, encostado na parede, levante as pontas dos pés. É o músculo que segura o pé quando você freia e o que mais fadiga na areia.' },
        { t:'14-16 min',o:'Apoio em uma perna com olhos fechados — 2 × 30 s cada perna · eversão com elástico 2 × 15 cada lado (fibulares).' }
      ]
    }
  ],
  coluna: {
    nome:'Coluna — todo dia, 10 min',
    metodo:'Pirâmide descendente de McGill: 5 repetições → descanso de 20-30 s → 3 repetições → descanso → 1 repetição. Cada repetição é uma sustentação de 8 segundos, respirando normal. Progride-se aumentando REPETIÇÕES (6-4-2, depois 8-6-4), nunca o tempo de sustentação.',
    exercicios:[
      { nome:'Respiração 90/90', prescr:'8 ciclos · 4 s inspira, 6 s expira',
        tip:'Deitado, pernas apoiadas a 90° numa cadeira. Reposiciona as costelas e ensina o core a estabilizar com o diafragma, não prendendo o ar.' },
      { nome:'Cat-camel', prescr:'6 ciclos lentos',
        tip:'Mobilidade, não alongamento. Amplitude média, sem forçar o fim do movimento.' },
      { nome:'Curl-up de McGill', prescr:'5-3-1 · 8 s cada',
        tip:'UMA perna dobrada, mãos sob a lombar para manter a curva. Levante só cabeça e ombros poucos centímetros, como um bloco. A lombar NÃO se move — é o que separa este do abdominal comum.' },
      { nome:'Prancha Lateral', prescr:'5-3-1 · 8 s cada lado',
        tip:'Joelhos dobrados no início, pés empilhados quando ficar fácil. Pirâmide inteira de um lado antes de trocar.' },
      { nome:'Bird Dog', prescr:'5-3-1 · 8 s cada lado',
        tip:'Braço e perna opostos, punho e calcanhar empurrando paredes opostas. O quadril não roda.' },
      { nome:'Pallof Press meio-ajoelhado com elástico', prescr:'2 × 25 s cada lado',
        tip:'Elástico preso numa maçaneta na altura do peito. Empurre à frente e resista à rotação. O tronco não gira. É o exercício mais específico que existe para a sua lombar no beach tennis.' },
      { nome:'Flexor de quadril meio-ajoelhado', prescr:'40 s cada lado',
        tip:'Você passa 30 min por dia sentado na bike, com o psoas encurtado. Psoas curto puxa a pelve e sobrecarrega a lombar. Aperte o glúteo do lado de trás enquanto alonga.' }
    ]
  },
  nunca: [
    'Pliometria com colete, halteres, barra ou bola acima da cabeça — a carga externa é o que multiplica a compressão do disco, não o salto.',
    'Drop jump ou salto de caixa alta em piso firme.',
    'Qualquer salto na primeira hora depois de acordar.',
    'Passar de 250 contatos por semana.',
    'Aterrissar na ponta do pé em mudança de direção — o pé inteiro no chão, tornozelo travado.',
    'Fazer a sessão A no mesmo dia do treino de perna sem separar por várias horas. Se coincidir, casa de manhã e perna no almoço — nunca o contrário.'
  ],
  nota: 'Este bloco não é o resto do treino. É onde mora quase todo o trabalho que ataca as suas duas queixas: a dor lombar depois dos jogos e a lentidão na areia. A academia constrói o motor; aqui o motor aprende a arrancar, frear e mudar de direção.'
};


/* ---------- GUIA DE CARGA E REPETIÇÕES ---------- */
const LOADING = {
  titulo: 'Quanto peso e quantas repetições',
  tese: 'Definir não é treinar leve. Definição é músculo mantido com a gordura de cima removida — e quem remove a gordura é a dieta, não a série de 25 repetições. O papel da academia em déficit calórico é dar ao corpo um motivo para NÃO descartar o músculo, e esse motivo é carga alta. Treinar leve para "definir" apaga justamente esse sinal: você emagrece perdendo gordura e músculo junto, fica menor mas não mais definido — e mais lento, porque potência vem de força.',
  evidencia: [
    'Bickel 2011 e Spiering 2021: adultos mantiveram força e tamanho muscular por 32 semanas treinando com UM TERÇO do volume — desde que a carga relativa fosse mantida. Corte séries se faltar tempo; nunca corte peso.',
    'Roth 2023: em homens treinados sob restrição calórica, 5 séries por exercício não preservaram mais massa magra que 3. Volume não é a alavanca — intensidade é.',
    'Schoenfeld 2017: cargas leves levadas à falha igualam a hipertrofia das cargas altas, mas perdem claramente em FORÇA. E é a força que sustenta a explosão na areia.',
    'Refalo 2024: parar a 1-3 repetições da falha rende praticamente o mesmo que ir à falha. Em déficit e com hérnia, a falha em exercício livre é risco sem retorno.'
  ],
  tabela: [
    { bloco:'Composto principal (1º exercício do dia)', reps:'6-8', rir:'2', carga:'Pesada — ~80-85% do seu máximo',
      como:'A última repetição tem que sair visivelmente mais devagar que a primeira. Se você chegou na oitava e sente que faria mais três, está leve.' },
    { bloco:'Superset A (acessórios)', reps:'10-12', rir:'1-2', carga:'Moderada-pesada',
      como:'Deve queimar nas duas últimas repetições, mas sem quebrar a técnica.' },
    { bloco:'Superset B (isolados)', reps:'12-15', rir:'1', carga:'Moderada',
      como:'Foco em sentir o músculo, não em mover o peso. Amplitude completa.' },
    { bloco:'Finalizador (máquina ou cabo)', reps:'12-15', rir:'0-1', carga:'Moderada-leve',
      como:'Aqui pode ir até a falha — é máquina ou polia, coluna descarregada e risco zero.' }
  ],
  rir: 'RIR quer dizer "repetições na reserva": quantas você ainda conseguiria fazer ao parar a série. RIR 2 = parou com duas no tanque. É assim que se controla o esforço sem precisar testar o máximo — que, com hérnia, você não vai testar.',
  progressao: 'REGRA DE PROGRESSÃO: quando você completar TODAS as séries no topo da faixa de repetições mantendo o RIR indicado, suba a carga na próxima sessão — 2,5 kg em exercício de braço/ombro, 5 kg em perna e costas. Depois de subir, as repetições caem para o fundo da faixa e você reconstrói. É esse ciclo que mantém o músculo enquanto a gordura sai.',
  agilidade: 'PARA A AGILIDADE: mesma carga, mas com INTENÇÃO EXPLOSIVA na subida. Desça controlado em 2-3 segundos e suba o mais rápido que o peso permitir. O peso pode até se mover devagar — o que treina a potência é a intenção de acelerar. Custa zero minuto a mais e é o que transfere para o arranque.',
  emDeficit: 'O QUE ESPERAR EM DÉFICIT: sua força vai estagnar, e em algumas semanas cair um pouco. Isso é normal e não é problema. O sinal de alerta é diferente: queda de mais de 5% na carga do MESMO exercício em duas sessões seguidas. Aí o déficit está grande demais ou o sono está ruim — some 200 kcal por dia e revise o sono antes de mexer no treino.',
  erros: [
    'Treinar leve com 20-30 repetições "para definir". É o erro clássico e faz o contrário do que promete.',
    'Cortar peso quando bate o cansaço do déficit. Corte séries, nunca a carga.',
    'Ir à falha em exercício livre com halteres pesados. Reserve a falha para máquina e polia.',
    'Trocar de exercício toda semana. Sem repetir o movimento você não tem como saber se progrediu.',
    'Não anotar a carga. O app registra justamente para isso — sem o registro anterior você chuta, e chutar em déficit quase sempre é chutar para baixo.'
  ]
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

/* ---------- SEMANA-TIPO ---------- */
const WEEK_PLAN = [
  { dia:'Seg', idx:1, manha:'Bike Zona 2',  almoco:'A — Peito + Bíceps',  noite:'Casa A · potência',    tipo:'treino', treino:'A', casa:'A' },
  { dia:'Ter', idx:2, manha:'Bike HIIT',    almoco:'B — Ombro + Tríceps', noite:'Casa B · agilidade',   tipo:'treino', treino:'B', casa:'B' },
  { dia:'Qua', idx:3, manha:'Bike Zona 2',  almoco:'C — Costas',          noite:'Casa C · pé e tendão', tipo:'treino', treino:'C', casa:'C' },
  { dia:'Qui', idx:4, manha:'Casa A',       almoco:'—',                   noite:'—',                    tipo:'off',    treino:null, casa:'A' },
  { dia:'Sex', idx:5, manha:'Bike Zona 2',  almoco:'D — Pernas',          noite:'Casa B + refeição livre', tipo:'treino', treino:'D', casa:'B' },
  { dia:'Sáb', idx:6, manha:'—',            almoco:'—',                   noite:'Beach tennis + livre', tipo:'jogo',   treino:null, casa:null },
  { dia:'Dom', idx:0, manha:'Caminhada 25 min', almoco:'—',               noite:'Casa C · pé e tendão', tipo:'off',    treino:null, casa:'C' }
];

/* ---------- PERIODIZAÇÃO: 7 SEMANAS ---------- */
const PERIODIZATION = [
  { s:1, ini:'2026-08-10', fim:'2026-08-16', bloco:'Acumulação', foco:'Aprender os padrões novos e fixar a rotina de coluna',
    carga:'75-80% · RIR 3', volume:'8-10 séries/músculo', cardio:'3× Z2 + 1× HIIT', casa:'A/B/C · 150 contatos/sem', peso:92.8,
    nota:'Semana de calibragem: anote as cargas de tudo. Faça os 3 testes de resistência de core.' },
  { s:2, ini:'2026-08-17', fim:'2026-08-23', bloco:'Acumulação', foco:'Sobrecarga progressiva nos compostos',
    carga:'75-80% · RIR 3', volume:'8-10 séries/músculo', cardio:'3× Z2 + 1× HIIT + 1× SIT', casa:'A/B/C · 180 contatos/sem', peso:91.7,
    nota:'Suba 2,5 kg em qualquer exercício que você completou todas as reps com RIR 3.' },
  { s:3, ini:'2026-08-24', fim:'2026-08-30', bloco:'Intensificação', foco:'Mais carga, mesmo volume',
    carga:'80-85% · RIR 2', volume:'8-9 séries/músculo', cardio:'3× Z2 + 1× HIIT + 1× SIT', casa:'A/B/C · 210 contatos/sem', peso:91.1,
    nota:'Última semana com a sessão de sprint na bike. A partir de 31/08 ela vira treino de areia.' },
  { s:4, ini:'2026-08-31', fim:'2026-09-06', bloco:'Intensificação', foco:'Potência e velocidade viram prioridade',
    carga:'80-85% · RIR 2', volume:'8-9 séries/músculo', cardio:'3× Z2 + 1× HIIT', casa:'A/B/C · 240 contatos/sem', peso:90.5,
    nota:'Troque a sessão C da bike por 25 min de areia. Reteste o salto vertical e compare com a semana 1.' },
  { s:5, ini:'2026-09-07', fim:'2026-09-13', bloco:'Pico de força', foco:'Cargas mais altas do ciclo',
    carga:'85-88% · RIR 1-2', volume:'6-8 séries/músculo', cardio:'3× Z2 + 1× HIIT', casa:'A/B/C · 240 contatos/sem (pico)', peso:89.9,
    nota:'Converta a refeição livre de sexta em recarga de carboidrato (sushi, massa, arroz — gordura baixa).' },
  { s:6, ini:'2026-09-14', fim:'2026-09-20', bloco:'Taper leve', foco:'Volume −40%, MESMA carga',
    carga:'85% · RIR 2-3', volume:'2 séries por exercício', cardio:'3× Z2 + HIIT reduzido (3×3 min)', casa:'B/C · 120 contatos, só qualidade', peso:89.2,
    nota:'Corte séries, nunca peso. Zero falha, zero exercício novo. Último jogo-treino duro: domingo 20/09.' },
  { s:7, ini:'2026-09-21', fim:'2026-09-27', bloco:'TAPER + TORNEIO', foco:'Volume −60%, chegar leve e explosivo',
    carga:'85% · RIR 3-4', volume:'2 sessões de 25 min (seg e qua)', cardio:'Bike 20 min fácil', casa:'C · só mobilidade e pé', peso:90.2,
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
    id:'prebike', nome:'Pré-bike', hora:'06:00 — 06:30', icone:'🚴', alvo:0,
    nota:'Opcional e fora da conta. A bike em Zona 2 pode ser feita em jejum sem prejuízo — Schoenfeld 2014 não achou diferença na perda de gordura em 24 h. Em dia de HIIT, coma alguma coisa.',
    opcoes:[
      { label:'Só café', itens:[
        { n:'Café preto sem açúcar', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Banana', itens:[
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Whey na água (dia de HIIT)', itens:[
        { n:'Whey isolado', q:'15 g', kcal:55, p:13, c:0.5, g:0.2 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]}
    ]
  },
  {
    id:'cafe', nome:'Café da Manhã', hora:'09:30 — pós-bike', icone:'🍞', alvo:520,
    nota:'Sua primeira refeição de verdade, já depois da bicicleta. É aqui que o corpo repõe o que a bike gastou. Mire 40 g de proteína: dose alta pela manhã é o que mais protege massa magra em déficit.',
    opcoes:[
      { label:'Pão com frango', itens:[
        { n:'Pão de forma integral', q:'3 fatias (75 g)', kcal:189, p:7.2, c:37.5, g:2.7 },
        { n:'Frango desfiado', q:'120 g', kcal:196, p:37.8, c:0, g:3.8, prep:'Cozido e desfiado; tempere com páprica, alho e limão' },
        { n:'Requeijão light', q:'1 c. sopa (15 g)', kcal:25, p:1.5, c:0.8, g:1.8 },
        { n:'Tomate e alface', q:'60 g', kcal:8, p:0.7, c:1.4, g:0.1 },
        { n:'Café com leite desnatado', q:'150 ml', kcal:53, p:5.4, c:7.4, g:0.2 },
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 }
      ]},
      { label:'Pão com ovos', itens:[
        { n:'Pão de forma integral', q:'3 fatias (75 g)', kcal:189, p:7.2, c:37.5, g:2.7 },
        { n:'Ovos inteiros mexidos', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6, prep:'Frigideira antiaderente, azeite em spray' },
        { n:'Claras', q:'3 un (100 g)', kcal:57, p:13.2, c:0, g:0.1 },
        { n:'Tomate', q:'60 g', kcal:9, p:0.7, c:1.9, g:0.1 },
        { n:'Café com leite desnatado', q:'150 ml', kcal:53, p:5.4, c:7.4, g:0.2 },
        { n:'Mamão formosa', q:'120 g', kcal:54, p:1, c:13.9, g:0.1 }
      ]},
      { label:'Pão com ovo e frango', itens:[
        { n:'Pão de forma integral', q:'3 fatias (75 g)', kcal:189, p:7.2, c:37.5, g:2.7 },
        { n:'Ovo inteiro', q:'1 un (50 g)', kcal:73, p:6.6, c:0.3, g:4.8 },
        { n:'Frango desfiado', q:'90 g', kcal:147, p:28.4, c:0, g:2.9 },
        { n:'Abacate', q:'30 g', kcal:29, p:0.4, c:1.8, g:2.5 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 },
        { n:'Laranja pera', q:'150 g', kcal:56, p:1.5, c:13.4, g:0.2 }
      ]},
      { label:'Tapioca proteica', itens:[
        { n:'Goma de tapioca hidratada', q:'50 g', kcal:120, p:0.2, c:29.5, g:0.1 },
        { n:'Ovo inteiro', q:'1 un (50 g)', kcal:73, p:6.6, c:0.3, g:4.8, prep:'Misture na goma para virar crepioca' },
        { n:'Frango desfiado', q:'110 g', kcal:179, p:34.7, c:0, g:3.5 },
        { n:'Queijo cottage', q:'40 g', kcal:36, p:4.8, c:1.2, g:1.4 },
        { n:'Café com leite desnatado', q:'150 ml', kcal:53, p:5.4, c:7.4, g:0.2 },
        { n:'Mamão formosa', q:'120 g', kcal:54, p:1, c:13.9, g:0.1 }
      ]},
      { label:'Corrido (shake + pão)', itens:[
        { n:'Whey concentrado', q:'30 g', kcal:120, p:24, c:3, g:1.5, prep:'Bata com o leite e a banana' },
        { n:'Leite desnatado', q:'200 ml', kcal:70, p:7.2, c:9.8, g:0.2 },
        { n:'Banana nanica', q:'100 g', kcal:92, p:1.4, c:23.8, g:0.1 },
        { n:'Pão de forma integral', q:'2 fatias (50 g)', kcal:126, p:4.8, c:25, g:1.8 },
        { n:'Pasta de amendoim integral', q:'1 c. sopa (15 g)', kcal:95, p:3.3, c:3.6, g:7.4 }
      ]}
    ]
  },
  {
    id:'almoco', nome:'Almoço', hora:'13:00 — pós-treino', icone:'🍽️', alvo:900, estimado:true,
    nota:'É a sua maior refeição e cai logo depois da academia — o melhor momento possível. Marmita ou self-service: monte o prato pela regra abaixo. Os valores aqui são ESTIMATIVAS de restaurante, com margem de ±15%. O que mais faz o número subir sem você perceber: fritura, molho cremoso, farofa e o azeite despejado por cima.',
    regra:'REGRA DO PRATO: metade de salada e legumes · um quarto de proteína grelhada (180-200 g) · um quarto de arroz e feijão. Peça grelhado em vez de frito, molho à parte, e não repita o arroz.',
    opcoes:[
      { label:'Self-service clássico', itens:[
        { n:'Frango grelhado (peito ou sassami)', q:'200 g', kcal:318, p:64, c:0, g:5 },
        { n:'Arroz branco', q:'180 g', kcal:230, p:4.5, c:50.6, g:0.4 },
        { n:'Feijão carioca', q:'140 g', kcal:106, p:6.7, c:19, g:0.7 },
        { n:'Legumes refogados (abobrinha, cenoura, vagem)', q:'150 g', kcal:68, p:3, c:12, g:1.5 },
        { n:'Salada crua à vontade', q:'150 g', kcal:18, p:1.7, c:3.4, g:0.2 },
        { n:'Azeite na salada', q:'1 c. sopa (8 g)', kcal:72, p:0, c:0, g:8 },
        { n:'Mamão de sobremesa', q:'120 g', kcal:54, p:1, c:13.9, g:0.1 }
      ]},
      { label:'Carne vermelha magra', itens:[
        { n:'Patinho ou alcatra grelhada', q:'180 g', kcal:394, p:64.6, c:0, g:13.1, prep:'Peça sem a capa de gordura' },
        { n:'Arroz branco', q:'150 g', kcal:192, p:3.8, c:42.2, g:0.3 },
        { n:'Feijão preto', q:'130 g', kcal:100, p:5.9, c:18.2, g:0.7 },
        { n:'Salada crua com tomate e beterraba', q:'180 g', kcal:35, p:2, c:6.5, g:0.3 },
        { n:'Azeite', q:'1 c. sopa (8 g)', kcal:72, p:0, c:0, g:8 },
        { n:'Abacaxi', q:'100 g', kcal:48, p:0.9, c:12.3, g:0.1 }
      ]},
      { label:'Peixe grelhado', itens:[
        { n:'Tilápia ou merluza grelhada', q:'220 g', kcal:284, p:57.6, c:0, g:4.4 },
        { n:'Arroz integral', q:'180 g', kcal:223, p:4.7, c:46.4, g:1.8 },
        { n:'Feijão carioca', q:'130 g', kcal:99, p:6.2, c:17.7, g:0.7 },
        { n:'Purê de batata', q:'100 g', kcal:88, p:2, c:16, g:2 },
        { n:'Salada verde', q:'150 g', kcal:18, p:1.7, c:3.4, g:0.2 },
        { n:'Azeite', q:'1 c. sopa (8 g)', kcal:72, p:0, c:0, g:8 },
        { n:'Laranja', q:'150 g', kcal:56, p:1.5, c:13.4, g:0.2 }
      ]},
      { label:'Marmita caseira', itens:[
        { n:'Frango desfiado ou em cubos', q:'180 g', kcal:293, p:56.7, c:0, g:5.8 },
        { n:'Arroz integral', q:'170 g', kcal:211, p:4.4, c:43.9, g:1.7 },
        { n:'Feijão', q:'140 g', kcal:106, p:6.7, c:19, g:0.7 },
        { n:'Brócolis e cenoura no vapor', q:'180 g', kcal:52, p:3.9, c:9.3, g:0.6 },
        { n:'Batata doce', q:'120 g', kcal:92, p:0.7, c:22.1, g:0.1 },
        { n:'Azeite', q:'1 c. sopa (8 g)', kcal:72, p:0, c:0, g:8 },
        { n:'Maçã', q:'130 g', kcal:73, p:0.4, c:19.8, g:0 }
      ]},
      { label:'Massa (dia de jogo)', itens:[
        { n:'Macarrão ao molho de tomate', q:'250 g cozido', kcal:310, p:13.3, c:66.3, g:1.3 },
        { n:'Patinho moído refogado', q:'150 g', kcal:329, p:53.9, c:0, g:11, prep:'Escorra a gordura depois de refogar' },
        { n:'Molho de tomate', q:'100 g', kcal:38, p:1.3, c:7, g:0.7 },
        { n:'Salada verde grande', q:'180 g', kcal:22, p:2.1, c:4.1, g:0.3 },
        { n:'Azeite', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 },
        { n:'Melancia', q:'200 g', kcal:66, p:1.8, c:16.2, g:0 }
      ]}
    ]
  },
  {
    id:'tarde', nome:'Café da Tarde', hora:'16:30', icone:'💪', alvo:400,
    nota:'Seu combo de sempre, só com as quantidades acertadas. Terceira dose de proteína do dia — pese a granola, ela é a armadilha calórica silenciosa (100 g são 450 kcal).',
    opcoes:[
      { label:'Combo de sempre', itens:[
        { n:'Whey concentrado', q:'30 g', kcal:120, p:24, c:3, g:1.5, prep:'Misture direto no iogurte' },
        { n:'Iogurte grego zero', q:'170 g', kcal:102, p:17, c:6.8, g:0.7 },
        { n:'Granola sem açúcar', q:'30 g', kcal:135, p:3.3, c:18, g:5.1, prep:'PESE. Um punhado generoso vira 200 kcal sem você notar' },
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 }
      ]},
      { label:'Combo + fruta vermelha', itens:[
        { n:'Whey concentrado', q:'30 g', kcal:120, p:24, c:3, g:1.5 },
        { n:'Iogurte grego zero', q:'200 g', kcal:120, p:20, c:8, g:0.8 },
        { n:'Granola sem açúcar', q:'25 g', kcal:113, p:2.8, c:15, g:4.3 },
        { n:'Morangos', q:'120 g', kcal:36, p:1.1, c:8.2, g:0.4 },
        { n:'Canela', q:'a gosto', kcal:3, p:0.1, c:0.8, g:0 }
      ]},
      { label:'Pão com atum', itens:[
        { n:'Pão de forma integral', q:'3 fatias (75 g)', kcal:189, p:7.2, c:37.5, g:2.7 },
        { n:'Atum light em água, drenado', q:'120 g', kcal:120, p:27.6, c:0, g:1 },
        { n:'Queijo cottage', q:'50 g', kcal:45, p:6, c:1.5, g:1.8 },
        { n:'Alface e tomate', q:'60 g', kcal:8, p:0.7, c:1.4, g:0.1 },
        { n:'Mostarda', q:'1 c. sopa (15 g)', kcal:10, p:0.6, c:0.9, g:0.5 },
        { n:'Maçã', q:'130 g', kcal:73, p:0.4, c:19.8, g:0 }
      ]},
      { label:'Crepioca de frango', itens:[
        { n:'Ovo inteiro', q:'1 un (50 g)', kcal:73, p:6.6, c:0.3, g:4.8 },
        { n:'Clara', q:'2 un (66 g)', kcal:38, p:8.8, c:0, g:0.1 },
        { n:'Goma de tapioca', q:'30 g', kcal:72, p:0.1, c:17.7, g:0 },
        { n:'Frango desfiado', q:'100 g', kcal:163, p:31.5, c:0, g:3.2 },
        { n:'Queijo cottage', q:'40 g', kcal:36, p:4.8, c:1.2, g:1.4 },
        { n:'Café preto', q:'200 ml', kcal:3, p:0.2, c:0.5, g:0 }
      ]},
      { label:'Shake e fruta (corrido)', itens:[
        { n:'Whey isolado', q:'35 g', kcal:128, p:30.3, c:1.2, g:0.4 },
        { n:'Leite desnatado', q:'250 ml', kcal:88, p:9, c:12.3, g:0.3 },
        { n:'Aveia em flocos', q:'25 g', kcal:99, p:3.5, c:16.7, g:2.1 },
        { n:'Banana prata', q:'1 un (70 g)', kcal:69, p:0.9, c:18.2, g:0.1 }
      ]}
    ]
  },
  {
    id:'janta', nome:'Janta', hora:'19:30 — 20:30', icone:'🌙', alvo:380,
    nota:'A sua marmita fit de 350 g. A maioria delas fica entre 350 e 490 kcal e traz 25-35 g de proteína — abaixo dos 40 g que esta refeição precisa. Por isso quase toda opção aqui leva um complemento proteico simples. LEIA O RÓTULO da sua marca: os valores variam bastante.',
    opcoes:[
      { label:'Marmita fit + iogurte', itens:[
        { n:'Marmita fit (frango, arroz integral, legumes)', q:'350 g', kcal:380, p:32, c:38, g:9, prep:'Confira o rótulo — este é o perfil médio das marcas fit' },
        { n:'Iogurte grego zero de sobremesa', q:'100 g', kcal:60, p:10, c:4, g:0.4 }
      ]},
      { label:'Marmita leve + reforço', itens:[
        { n:'Marmita fit leve (350 kcal)', q:'350 g', kcal:350, p:28, c:35, g:8 },
        { n:'Claras cozidas ou omelete de claras', q:'4 un (132 g)', kcal:76, p:17.6, c:0, g:0.1 },
        { n:'Salada de folhas', q:'100 g', kcal:11, p:1.3, c:1.7, g:0.2 }
      ]},
      { label:'Marmita low carb + fruta', itens:[
        { n:'Marmita fit low carb (carne e legumes)', q:'350 g', kcal:320, p:38, c:14, g:13 },
        { n:'Mamão formosa', q:'150 g', kcal:68, p:1.2, c:17.4, g:0.2 }
      ]},
      { label:'Sem marmita — omelete', itens:[
        { n:'Ovos inteiros', q:'2 un (100 g)', kcal:146, p:13.2, c:0.6, g:9.6 },
        { n:'Claras', q:'3 un (100 g)', kcal:57, p:13.2, c:0, g:0.1 },
        { n:'Queijo cottage', q:'60 g', kcal:54, p:7.2, c:1.8, g:2.1 },
        { n:'Espinafre, cebola e tomate', q:'150 g', kcal:28, p:2.8, c:4.5, g:0.5 },
        { n:'Pão de forma integral', q:'1 fatia (25 g)', kcal:63, p:2.4, c:12.5, g:0.9 },
        { n:'Iogurte grego zero', q:'60 g', kcal:36, p:6, c:2.4, g:0.2 }
      ]},
      { label:'Sem marmita — frango e legumes', itens:[
        { n:'Frango grelhado, peito', q:'160 g', kcal:254, p:51.2, c:0, g:4 },
        { n:'Legumes no vapor (brócolis, abobrinha, chuchu)', q:'250 g', kcal:55, p:3, c:12, g:0.5 },
        { n:'Batata doce', q:'80 g', kcal:62, p:0.5, c:14.7, g:0.1 },
        { n:'Azeite', q:'1 c. chá (4 g)', kcal:36, p:0, c:0, g:4 }
      ]}
    ]
  }
];

/* ---------- REFEIÇÕES LIVRES ---------- */
const FREE_MEALS = {
  quando: 'Sexta e sábado à noite',
  teto: 1100,
  regra: 'Teto de 1.100 kcal por refeição livre. Ela SUBSTITUI a janta planejada (~500 kcal), então o excesso real é de ~600 kcal cada. Duas por semana = 1.200 kcal, que já estão orçados no balanço semanal — não há nada a compensar se você respeitar o teto.',
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
