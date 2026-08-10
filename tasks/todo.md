# IronFit — Reformulação Completa (09/08/2026)

## Contexto
- **Atleta:** Daniel Campos · 94 kg · 1,85 m · hérnias L2-L3 e L3-L4
- **Evento-alvo:** torneio de beach tennis em **sáb 26 e dom 27/09/2026** (48 dias / 7 semanas)
- **Metas:** 88-89 kg no torneio · 83 kg em 31/12/2026 · mais ágil na areia · lombar sem dor
- **Restrições:** musculação 4x/semana, **máx. 40 min** (horário de almoço); bike ergométrica 30 min pela manhã, 4x+/semana
- **Portal:** https://danielcampos18.github.io/Ironfit/ · repo `DanielCampos18/Ironfit`

## Números validados (cálculo próprio, conferido)
| Item | Valor |
|---|---|
| TMB (Mifflin-St Jeor) | 1.961 kcal |
| Base sedentária (×1,2) | 2.354 kcal |
| Bike 30 min (líquido) | +296 kcal |
| Musculação 40 min (líquido) | +296 kcal |
| Beach tennis 60 min (líquido) | +622 kcal |
| **TDEE médio semanal** | **2.823 kcal/dia** |
| Meta dia normal | 2.050 kcal |
| Meta dia c/ refeição livre (sex/sáb) | 2.300 kcal |
| Déficit semanal | ~4.900 kcal → 0,64 kg gordura/sem |
| Projeção no torneio | **88,3 kg** (−5,7 kg) |
| Ritmo necessário pós-torneio | 0,39 kg/sem até 83 kg |

## Tarefas

### 1. Pesquisa (workflow paralelo)
- [x] Demandas físicas do beach tennis + agilidade na areia
- [x] Hérnia lombar: contraindicados, seguros, McGill Big 3
- [x] Treino de 40 min para perda de gordura + retenção de massa magra
- [x] Protocolos de bicicleta ergométrica (carga vs cadência)
- [x] TDEE, macros, taxa de perda segura, refeições livres
- [x] Tabela nutricional brasileira (TACO) + opções de cardápio
- [x] Taper e preparação para o torneio
- [x] Síntese em especificação técnica única

### 2. Programa de treino
- [ ] 4 treinos: Peito+Bíceps · Ombro+Tríceps · Costas · Pernas
- [ ] Bloco de potência/agilidade no início de cada sessão
- [ ] Bloco de core/lombar no fim de cada sessão (McGill Big 3 + anti-rotação)
- [ ] Zero exercícios contraindicados para hérnia L2-L3/L3-L4
- [ ] Cada sessão calculada para caber em 40 min
- [ ] Periodização de 7 semanas com taper na semana do torneio
- [ ] Protocolo da bike: 3 sessões-modelo + distribuição semanal
- [ ] Resposta explícita: 4 dias bastam ou precisa de 5?

### 3. Dieta
- [ ] Painel de energia (TMB, TDEE, gasto por atividade)
- [ ] Macros diários com justificativa
- [ ] 4 refeições × 5 opções, com kcal/macros por item conferidos
- [ ] 2 refeições livres (sexta e sábado à noite) com teto e compensação semanal
- [ ] Suplementos e protocolo do dia do torneio

### 4. Portal (reconstrução)
- [ ] Separar em `index.html` + `assets/css` + `assets/js` (manutenível, deploy igual)
- [ ] Tema violeta/turquesa em vidro (glassmorphism) com fundo aurora animado
- [ ] Nav: Hoje · Treino · Dieta · Progresso · Ajustes
- [ ] Tela "Hoje": contagem regressiva do torneio + o que fazer hoje
- [ ] Timer de descanso e cronômetro de sessão (essencial p/ 40 min)
- [ ] Contador de calorias do dia com anel de progresso
- [ ] Gráfico de peso real vs linha de projeção
- [ ] Protocolo da bike interativo minuto a minuto
- [ ] Preservar dados existentes no localStorage (migração)

### 5. Validação (antes e depois do deploy)
- [ ] Conferir aritmética de todas as refeições e totais de macros
- [ ] Conferir que nenhum exercício contraindicado sobrou
- [ ] Conferir soma de tempo de cada treino ≤ 40 min
- [ ] Rodar servidor local e testar no navegador (console limpo, sem erro)
- [ ] Testar em viewport mobile e desktop
- [ ] Testar persistência: registrar peso, marcar séries, recarregar
- [ ] Deploy e verificar no ar (HTTP 200 + render)

## Revisão

### O que foi entregue
- `index.html` reescrito (esqueleto), `assets/css/app.css` (design "Aurora Glass"), `assets/js/data.js` (programa) e `assets/js/app.js` (lógica).
- 5 telas: Hoje · Treino · Dieta · Plano · Progresso, mais Ajustes na engrenagem do cabeçalho.
- Tema violeta/turquesa em vidro, aurora animada, nav lateral no desktop, layout de impressão.

### Erros que a validação pegou (e que teriam passado despercebidos)
1. **Déficit semanal declarado não batia com a soma dos dias.** Estava escrito `4.920 kcal → 0,64 kg/sem`; a soma real dos 7 dias dava `4.125 → 0,54 kg/sem`. Diferença de **0,8 kg no torneio**. Corrigido recalibrando as metas por tipo de dia (2.050 / 2.400 / 1.950 / 1.800) até fechar em 5.025 kcal → 0,65 kg/sem.
2. **Projeção de peso semana a semana estava otimista** em 0,3-0,6 kg por semana. Recalculada a partir do déficit real.
3. **Anel de calorias nunca preenchia**: dependia de `requestAnimationFrame`, que não dispara em aba oculta. Passou a ser escrita síncrona com animação via `transition` do CSS.
4. **Posterior de coxa com 6 séries/semana**, abaixo do alvo de 8-10 da literatura. Rebalanceado para 8 (flexora 3→4 nos dias C e D), compensado reduzindo puxada e leg press de 4→3 séries — quadríceps e dorsais seguem acima do alvo e os 4 treinos continuam em 40 min exatos.
5. **Assets sem versionamento** — o navegador serviria JS antigo com HTML novo após o deploy. Adicionado `?v=` nos links de CSS/JS.

### Verificações automatizadas executadas
- Aritmética de todas as 29 opções de refeição: soma dos itens vs. alvo, e conferência cruzada kcal vs. 4/4/9 (todas dentro de ±5%, exceto frutas onde a fibra explica a diferença).
- Coerência kcal ↔ macros nos 4 tipos de dia: divergência máxima de 2 kcal.
- Balanço semanal: gasto, ingestão, déficit e projeção reconciliados com a semana-tipo.
- Tempo de cada treino: os 4 somam exatamente 40 min.
- Auditoria de 13 padrões de exercício contraindicado para hérnia L2-L3/L3-L4: **nenhuma ocorrência**.
- Cobertura muscular e séries semanais por grupo, todos dentro dos alvos.
- Sem exercícios repetidos dentro do mesmo treino.
- Navegador: 21 combinações de tela/aba sem erro de console; registro de peso, séries, timer de descanso, troca de opção de refeição, marcação de refeição e persistência após recarregar — todos funcionando.
- Layout: sem estouro horizontal em 375px nem em 1280px; tabelas rolam no próprio contêiner; 26 links externos todos com `rel="noopener"`.

### Correção posterior: o tempo de treino estava errado (v2.1)
Daniel avisou que tem 45 min, não 40, e perguntou se dava tempo de fazer tudo. Ao calcular o tempo real (execução + descanso + montagem de aparelho) em vez de confiar nos minutos que eu tinha **digitado por bloco**, os treinos davam **53, 60, 63 e 69 min**. Não cabiam nem em 45.

Foi o mesmo erro da dieta, repetido: número derivado escrito à mão. O bloco de core, marcado como "5 min", custava 10 a 15 min reais — três séries de Pallof press de cada lado com descanso não cabem em 5 minutos.

**Solução (sugerida pelo próprio Daniel): separar academia e casa.**
- **Academia (45 min):** só força. O que precisa de carga externa progressiva.
- **Casa (15 min, à noite):** McGill Big 3 + Pallof com elástico, e o bloco de agilidade (pogo hops, skater hops, split-step, tibial, propriocepção). Só precisa de um elástico e 2 × 2 m.
- **Obrigatoriamente à noite**, nunca junto com a bike da manhã: a rigidez de flexão do disco é ~300% maior na primeira hora após acordar, e é o horário que McGill contraindica.

**Tempos agora calculados pelo app, não digitados** (`segSerie`/`segBloco` em `app.js`): A 41 · B 41 · C 40 · D 39 min, todos com 4-6 min de folga dentro dos 45. A tela do treino mostra a barra de ocupação e a margem restante.

Ajustes de exercício para fechar a conta: mesa flexora do dia D passou a bilateral (a unilateral custava 7 min a mais), panturrilha saiu do dia D e entrou no dia A como gastrocnêmio, e o dia B ganhou rotação externa de manguito. Volume semanal por grupo permaneceu nos alvos.

### v3: renovação dos exercícios, calorias revistas e fim do treino de areia
Três correções pedidas pelo Daniel.

**1. Calorias estavam baixas.** Eu tinha usado multiplicador **1,2** para o gasto fora do treino — "sedentário puro, escritório e quase não anda". Para quem trabalha e se desloca, **1,3** é mais fiel. O gasto num dia de treino subiu de 2.985 para **3.181 kcal**, e a meta de 2.050 passou para **2.200**. TDEE médio semanal: 3.002 kcal. Déficit de 4.816/semana = 0,63 kg/semana (23% do gasto). Adicionada uma **regra de ajuste** no app: pesar 3× por semana e comparar médias semanais; menos de 0,4 kg/sem → tirar 150 kcal/dia; mais de 0,9 → somar 200.

**2. Dieta remontada na rotina real dele.** Café da manhã às 09:30 pós-bike (pão + frango ou ovo), almoço de 900 kcal de marmita/restaurante, café da tarde com whey + iogurte + granola, e janta de marmita fit de 350 g. O almoço virou uma "regra do prato" com valores marcados como **estimativa de restaurante (±15%)**, já que precisão grama a grama ali é ilusória. As marmitas fit trazem 25-35 g de proteína, abaixo dos 40 g que a refeição precisa — por isso quase toda opção de janta leva um complemento proteico.

**3. Exercícios renovados.** Ele apontou repetição com o programa antigo. Pesquisa em 6 frentes (Nippard, Israetel/RP, Henselmans, Schoenfeld, Milo Wolf, Maeo, Fenwick/McGill) trocou a maioria por opções com melhor evidência, principalmente por **treino em posição alongada** e **curva de resistência**: crucifixo unilateral no cabo deitado, rosca Bayesian, mergulho em máquina assistida, extensão overhead no cabo (Maeo: crescimento bem superior ao pushdown), elevação lateral com a polia **por trás** do corpo, remada cavalinho com apoio de peito, puxada unilateral meio-ajoelhado, pullover no cabo, Y-raise, flexora **sentada** (Maeo 2021: mais hipertrofia que a deitada), extensora com encosto reclinado, belt squat, step-up lateral. Mantidos os pedidos: elevação lateral na polia e peito na polia. **6 a 7 exercícios por treino**, todos entre 41 e 45 min.

**4. Treino de areia removido.** Ele não consegue treinar em areia. Isso não é neutro: a areia tem **menor** força de reação ao solo, era o lugar mais seguro para saltar. Em piso firme a regra passa a ser cortar amplitude e altura, nunca a intenção — salto baixo e rápido tem pico de força bem menor. Teto de **250 contatos por semana** e nunca com colete ou carga externa (Fowler: 50 saltos com 8,5 kg comprimem 3,5× mais que sem).

**5. Bloco de casa virou 3 sessões rotativas** de 15-20 min, para ele treinar todo dia sem acumular impacto: A potência (~70 contatos), B agilidade e mudança de direção (~40 reativos), C pé/tornozelo/tendão (zero impacto), mais o bloco de coluna diário de 10 min. Base: Lee Taft (mudança de direção), Damian Harper (frenagem), Keith Baar (isometria de tendão), Ian Jeffreys (RAMP), JB Morin (força horizontal).

### Decisões que divergem do pedido original (e por quê)
- **Meta de peso no torneio: 89 kg (−5 kg), não 88.** Acima de 0,7% do peso por semana a massa magra estagna e a força cai (Garthe 2011) — e força cair é perder justamente a explosão que o torneio exige. Os 11 kg até 83 kg têm 13 semanas de folga depois.
- **A balança vai subir ~1 kg na semana do torneio.** É a recarga de carboidrato. A pesagem que vale é 20/09.
- **4 dias de academia bastam; o que falta são 2 sessões de areia por semana.** Musculação constrói o motor, a areia ensina o motor a funcionar naquele terreno.
- **Dia C virou "Costas + Cadeia Posterior".** Pernas 1×/semana era o furo do split. Mover posterior/glúteo/panturrilha para o dia de costas dá estímulo 2× sem custar tempo nem alterar os 4 treinos pedidos.
