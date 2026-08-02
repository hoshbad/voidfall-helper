/* ============================================================================
   VOIDFALL COMBAT HELPER — RESOLVER
   ============================================================================

   Die gesamte Kampfarithmetik. Diese Datei ist absichtlich rein:

     kein DOM, kein localStorage, kein fetch, keine Texte, keine Farben.

   Rein heisst, dass jeder Aufruf von resolve() bei gleicher Eingabe das
   gleiche Ergebnis liefert und nichts ausserhalb dieser Datei anfasst. Nur
   deshalb laesst sich der Resolver ohne Browser testen (siehe combat.test.js)
   und nur deshalb kann index.html das Aussehen aendern, ohne hier etwas zu
   riskieren.

   TEXTE. Der Resolver gibt Log-Zeilen als {pip, key, p, parts} zurueck, also
   Schluessel und rohe Zahlen — keine fertigen Saetze, kein Markup. Uebersetzt
   und fett gesetzt wird in index.html. Wenn hier "1 Damage" stuende, waere die
   Datei nicht mehr sprachneutral und die deutsche Fassung haette ein Loch.

   EINBINDUNG. Klassisches <script src="combat.js"></script> vor dem Inline-
   Block. Kein ES-Modul: ueber file:// blockiert die Same-Origin-Policy den
   Modul-Import, und die App soll per Doppelklick laufen.

   QUELLE. Alle Paragraphenverweise gehen auf
   Private/Input – Rules/COMBAT-RULES.md, das seinerseits auf Rulebook v3.00.0,
   Glossary und Errata 1.0 zurueckverweist.

   ---------------------------------------------------------------------------
   DOKUMENTIERTE AUSLEGUNGEN
   Die Regeln lassen fuenf Punkte offen (COMBAT-RULES.md §10). Hier steht,
   wofuer sich diese Implementierung entschieden hat:

   1. Beide Seiten Improved Targeting. Die Overrides heben sich auf, danach
      entscheidet die rohe Initiative; bei Gleichstand simultan.        §10.1
   2. Patt. Haben beide Seiten Fleet Power, aber keine Initiative, endet der
      Kampf als outcome "stalemate" statt in einer Endlosschleife. Zusaetzlich
      bricht MAX_SALVO_STEPS notfalls ab.                               §10.2
   3. Bombard-Split, Destroyer-Timing. Nicht geraten, sondern gesucht: der
      Resolver rechnet alle Kombinationen durch und nimmt die fuer den
      Angreifer beste.                                            §10.3, §10.4
   4. Escape Pods, Combat Replicators, Salvage Scanner sind nicht modelliert.
      Keine davon aendert die Arithmetik im Kampfsektor — zurueckgezogene
      Fleet Power ist auch dann weg, wenn sie im Heimatsektor landet. Bei
      einem Unentschieden meldet das Ergebnis tieBreakable, damit die UI auf
      Improved Combat Replicators hinweisen kann.                 §10.5, §5.3
   5. Rueckzugswahl. "Recall 1 Fleet Power of your choice" ist eine echte
      Spielerentscheidung, die die Regeln nicht festlegen. chooseRecall()
      bewertet greedy, welcher Verlust am wenigsten kostet. Das ist eine
      Heuristik, kein Optimum — sie steckt bewusst in genau einer Funktion,
      damit sie austauschbar bleibt.
   ========================================================================= */
(function(global){
"use strict";

const VERSION = "1.0.0";

/* Notbremse. Ein Kampf endet normalerweise nach wenigen Schritten, weil jede
   Seite pro Schritt Fleet Power verliert. Greift diese Grenze, ist etwas
   faul — dann lieber ein sichtbares Ergebnis als ein haengender Browser. */
const MAX_SALVO_STEPS = 100;

/* Fleet-Typen in fester Reihenfolge. voidborn steht mit drin, weil es sich im
   Kampf wie Corvette verhaelt (§2.3) und deshalb dieselben Wege geht.      */
const FLEET_TYPES = ["corvette","sentry","destroyer","dreadnought","carrier","voidborn"];

/* Technologiestufen: 0 keine, 1 Basic, 2 Improved. destroyers kennt keine 0,
   energy nur 0 und 2 — das erzwingt die UI, hier wird es nur gelesen.      */
const NONE = 0, BASIC = 1, IMPROVED = 2;

/* ===========================================================================
   1 — EINGABE NORMALISIEREN
   Der Resolver traut der Eingabe nicht. Fehlende Felder werden 0, negative
   Werte werden 0, und was fuer eine Seite regelwidrig ist, wird geloescht
   statt spaeter im Kampf abgefragt. Danach ist jede Seite vollstaendig.
   ======================================================================== */
function int(v){
  return (typeof v === "number" && isFinite(v)) ? Math.max(0, Math.floor(v)) : 0;
}

function normSide(raw, role, isVoidborn){
  raw = raw || {};
  const rawTech = raw.tech || {};
  const s = {
    role: role,                       // "inv" | "def"
    isVoidborn: !!isVoidborn,
    fp: {},
    sectorDefenses: 0,
    starbases: 0,
    tech: {
      targeting: int(rawTech.targeting), shields:  int(rawTech.shields),
      torpedoes: int(rawTech.torpedoes), dsm:      int(rawTech.dsm),
      destroyers:int(rawTech.destroyers),drones:   int(rawTech.drones),
      energy:    int(rawTech.energy)
    },
    dsmEnergy:   !!raw.dsmEnergy,
    dsmAdjacent: Math.min(2, int(raw.dsmAdjacent)),
    returnTrade: !!raw.returnTrade,
    bombardUnits: 0
  };
  FLEET_TYPES.forEach(k => { s.fp[k] = int(raw[k]); });

  /* Installationen gehoeren dem Verteidiger. Sector Defenses und Starbases
     teilen je 1 Approach Damage aus (§2.4); beim Angreifer haetten sie im
     Kampf keine Wirkung, deshalb fallen sie hier weg statt spaeter.        */
  if(role === "def"){
    s.sectorDefenses = int(raw.sectorDefenses);
    s.starbases      = int(raw.starbases);
  }

  /* Bombard und Autonomous Drones setzen beide voraus, dass man invadiert
     (§3.5, §7.3). Beim Verteidiger existieren sie schlicht nicht.          */
  if(role === "inv"){
    s.bombardUnits = Math.floor(int(raw.bombard) / 3);   // je 3 Materials 1 Absorption
  } else {
    s.returnTrade = false;
  }

  /* Voidborn haben keine Technologien und keine Flottentypen ausser ihren
     eigenen Fleets (§2.3). Sector Defenses koennen trotzdem im Sektor
     stehen, die gehoeren dem Sektor und nicht der Flotte.                  */
  if(s.isVoidborn){
    FLEET_TYPES.forEach(k => { if(k !== "voidborn") s.fp[k] = 0; });
    Object.keys(s.tech).forEach(k => { s.tech[k] = NONE; });
    s.dsmEnergy = false; s.dsmAdjacent = 0;
    s.returnTrade = false; s.bombardUnits = 0;
    s.starbases = 0;
  } else {
    s.fp.voidborn = 0;
  }
  return s;
}

/* Der Kampftyp legt fest, wer Voidborn ist. Bei "fallen" ist der Verteidiger
   vollstaendig determiniert: zwei aufgedruckte Sector Defenses, keine Fleet
   Power, keine Technologien (§3.6).                                        */
function normInput(input){
  input = input || {};
  const type = input.combatType;
  const invVoid = type === "skirmish";
  const defVoid = type === "pvv";

  const inv = normSide(input.inv, "inv", invVoid);
  let def;
  if(type === "fallen"){
    def = normSide({sectorDefenses:2}, "def", false);
  } else {
    def = normSide(input.def, "def", defVoid);
  }
  return {combatType: type, inv: inv, def: def};
}

/* ===========================================================================
   2 — ABLESEN AM LAUFENDEN BRETT
   Ein "board" ist nur {fp:{...}} und veraendert sich waehrend des Kampfes.
   Die Seite (side) daneben ist statisch: Rolle, Technologien, Installationen.
   Getrennt, weil jede Regel entweder das eine oder das andere befragt.
   ======================================================================== */
function boardOf(side){
  const fp = {};
  FLEET_TYPES.forEach(k => { fp[k] = side.fp[k]; });
  return {fp: fp};
}
function totalFp(board){
  return FLEET_TYPES.reduce((a,k) => a + board.fp[k], 0);
}

/* Fragment fuer das Log: ein uebersetzbarer Baustein mit einer Zahl. Der
   Renderer haengt sie mit " · " aneinander. */
function part(key, n){ return {key: "log.p." + key, p: {n: n}}; }
function line(pip, key, p, parts){
  return {pip: pip, key: "log." + key, p: p || {}, parts: (parts && parts.length) ? parts : null};
}

/* ---- Initiative (§4.1) ---------------------------------------------------
   1 pro Fleet Power, ausser Sentries beim Verteidiger: die geben 0 (§4.1,
   Checklist 7). Dazu zwei Pauschalen und Basic Targeting.                 */
function initiative(side, board){
  const f = board.fp, inv = side.role === "inv";
  const parts = [];
  let n = 0;
  if(f.corvette)    { n += f.corvette;    parts.push(part("corvette",    f.corvette)); }
  if(f.voidborn)    { n += f.voidborn;    parts.push(part("voidborn",    f.voidborn)); }
  if(f.destroyer)   { n += f.destroyer;   parts.push(part("destroyer",   f.destroyer)); }
  if(f.dreadnought) { n += f.dreadnought; parts.push(part("dreadnought", f.dreadnought)); }
  if(f.carrier)     { n += f.carrier;     parts.push(part("carrier",     f.carrier)); }
  if(f.sentry){
    /* Sentries stehen auch mit 0 im Log — sonst wundert man sich, warum die
       Zahl nicht aufgeht. */
    if(inv){ n += f.sentry; parts.push(part("sentry", f.sentry)); }
    else   {                parts.push(part("sentryDef", f.sentry)); }
  }
  if(f.dreadnought)        { n += 1; parts.push(part("dreadFlat", 1)); }
  if(f.destroyer && inv)   { n += 1; parts.push(part("destFlat",  1)); }
  if(side.tech.targeting === BASIC && f.corvette > 0){
    n += 5; parts.push(part("targeting", 5));
  }
  return {total: n, parts: parts};
}

/* Improved Targeting greift nur, solange die Seite noch Fleet Power hat, die
   ueberhaupt Initiative liefert (§4.2). Ein Verteidiger mit ausschliesslich
   Sentries erfuellt das nicht — seine Sentries geben 0.                    */
function hasInitiativeSource(side, board){
  const f = board.fp;
  let n = f.corvette + f.voidborn + f.destroyer + f.dreadnought + f.carrier;
  if(side.role === "inv") n += f.sentry;
  return n > 0;
}
function targetingOverride(side, board){
  return side.tech.targeting === IMPROVED && hasInitiativeSource(side, board);
}

/* ===========================================================================
   3 — RUECKZUG  (Heuristik, siehe Kopf)
   Schaden heisst: der Besitzer zieht 1 Fleet Power seiner Wahl ab (§1.3).
   Welche, sagen die Regeln nicht. Bewertet wird jeder moegliche Abzug, gewaehlt
   der, nach dem die Seite am staerksten dasteht. Gewichte: Initiative zaehlt
   einfach, eine noch offene Absorption vierfach (sie rettet spaeter direkt
   1 FP), zusaetzlicher Salvo-Schaden dreifach.
   ======================================================================== */
function positionValue(side, board, ctx){
  const f = board.fp;
  let v = initiative(side, board).total;

  let abs = 0;
  if(side.tech.shields > NONE && f.corvette > 0 && !ctx.usedShields) abs += 1;
  if(side.role === "def"){
    if(!ctx.usedDread)   abs += f.dreadnought;
    if(!ctx.usedCarrier) abs += f.carrier;
  }
  /* Mehr als drei offene Absorptionen sind praktisch nie einloesbar — pro
     Salvo-Schritt kommt selten mehr als 1 Schaden an. Der Deckel verhindert,
     dass eine grosse Dreadnought-Flotte die Bewertung dominiert.           */
  v += 4 * Math.min(abs, 3);

  let dmg = 0;
  if(side.tech.torpedoes === IMPROVED && f.corvette > 0) dmg += 1;
  if(side.role === "inv" && !ctx.usedDestroyerBonus)     dmg += f.destroyer;
  v += 3 * dmg;

  return v;
}

/* Reihenfolge fuer den Gleichstand: was am ehesten entbehrlich ist, zuerst. */
const RECALL_TIEBREAK = ["sentry","voidborn","corvette","carrier","destroyer","dreadnought"];

function chooseRecall(side, board, ctx){
  let best = null, bestV = -Infinity;
  RECALL_TIEBREAK.forEach(type => {
    if(board.fp[type] <= 0) return;
    board.fp[type] -= 1;
    const v = positionValue(side, board, ctx);
    board.fp[type] += 1;
    if(v > bestV){ bestV = v; best = type; }
  });
  return best;
}

/* Zieht n Fleet Power ab und meldet zurueck, welche Typen es getroffen hat —
   das braucht das Log, damit man den Verlust nachvollziehen kann.          */
function applyRecall(side, board, ctx, n){
  const hit = {};
  for(let i = 0; i < n; i++){
    const type = chooseRecall(side, board, ctx);
    if(!type) break;                      // keine Fleet Power mehr uebrig
    board.fp[type] -= 1;
    hit[type] = (hit[type] || 0) + 1;
  }
  return FLEET_TYPES.filter(k => hit[k]).map(k => part(k, hit[k]));
}

/* ===========================================================================
   4 — APPROACH STEP  (§3)
   ======================================================================== */

/* Approach Damage des Angreifers (§3.3). Energy Cells fehlt hier bewusst:
   die Technologie wirkt nur beim Verteidiger (§7.3).                       */
function approachDamageInv(side, board){
  const parts = [];
  let n = 0;
  if(side.tech.destroyers === IMPROVED && board.fp.destroyer > 0){
    n += 1; parts.push(part("impDest", 1));           // flach, nicht pro FP
  }
  if(side.tech.dsm === BASIC && side.dsmEnergy){
    n += 1; parts.push(part("dsmBasic", 1));          // kostet 1 Energy
  }
  if(side.tech.dsm === IMPROVED && side.dsmAdjacent > 0){
    const d = Math.min(2, side.dsmAdjacent);
    n += d; parts.push(part("dsmImproved", d));
  }
  return {total: n, parts: parts};
}

/* Approach Damage des Verteidigers (§3.2). Basic Deep Space Missiles wirkt
   hier nicht — der Verteidiger braucht Improved (§3.2, Hinweis).           */
function approachDamageDef(side, board){
  const parts = [];
  let n = 0;
  if(side.sectorDefenses > 0){ n += side.sectorDefenses; parts.push(part("sd",       side.sectorDefenses)); }
  if(side.starbases > 0)     { n += side.starbases;      parts.push(part("starbase", side.starbases)); }
  if(board.fp.sentry > 0)    { n += board.fp.sentry;     parts.push(part("sentry",   board.fp.sentry)); }
  if(side.tech.dsm === IMPROVED && side.dsmAdjacent > 0){
    const d = Math.min(2, side.dsmAdjacent);
    n += d; parts.push(part("dsmImproved", d));
  }
  /* Energy Cells haengt an ausgeteiltem, nicht an angekommenem Schaden — ob
     absorbiert wird, entscheidet sich erst danach (§3.2, Trap 2).          */
  if(side.tech.energy > NONE && n >= 1){
    n += 1; parts.push(part("energy", 1));
  }
  return {total: n, parts: parts};
}

/* Approach Absorption (§3.4, §3.5). Der Verteidiger hat nur Improved Shields;
   Dreadnoughts, Drones und Bombard gehoeren dem Angreifer.                 */
function approachAbsorption(side, board, ctx){
  const parts = [];
  let n = 0;
  if(side.tech.shields === IMPROVED && board.fp.corvette > 0){
    n += 1; parts.push(part("shields", 1));
  }
  if(side.role === "inv"){
    if(board.fp.dreadnought > 0){
      n += board.fp.dreadnought; parts.push(part("dreadAbs", board.fp.dreadnought));
    }
    if(side.tech.drones > NONE && side.returnTrade){
      n += 1; parts.push(part("drones", 1));
    }
    if(ctx.bombardApproach > 0){
      n += ctx.bombardApproach; parts.push(part("bombard", ctx.bombardApproach));
    }
  }
  return {total: n, parts: parts};
}

/* 3.0 — Carrier setzen ihre Corvettes ab, bevor irgendein Schaden faellt. Die
   frischen Corvettes zaehlen sofort mit: sie koennen im selben Schritt
   sterben, erfuellen aber auch die "mindestens 1 Corvette FP"-Bedingungen
   (Trap 1). Der Resolver setzt sie immer ab, im Kampf hat das keinen Nachteil.

   Das passiert vor jeder Zaehlung, deshalb ist die Startsumme des Angreifers
   die nach dem Absetzen — sonst stuende im Log eine Flotte von 2, die 4 Fleet
   Power verliert.                                                          */
function deployCarriers(inv, invBoard){
  if(invBoard.fp.carrier <= 0) return null;
  const n = invBoard.fp.carrier;
  invBoard.fp.corvette += n;
  return line("ini", "a.carrier", {side: "@inv", n: n});
}

function runApproach(inv, def, invBoard, defBoard, ctxInv, ctxDef, deployLine){
  const lines = [];
  if(deployLine) lines.push(deployLine);
  const invFrom = totalFp(invBoard), defFrom = totalFp(defBoard);

  /* 3.1 — beide Seiten teilen gleichzeitig aus, also beide Summen aus dem
     Brett vor jedem Abzug.                                                 */
  const dmgInv = approachDamageInv(inv, invBoard);
  const dmgDef = approachDamageDef(def, defBoard);
  const absInv = approachAbsorption(inv, invBoard, ctxInv);
  const absDef = approachAbsorption(def, defBoard, ctxDef);

  [["@inv", dmgInv], ["@def", dmgDef]].forEach(([who, d]) => {
    if(d.total > 0) lines.push(line("dmg", "a.deal", {side: who, n: d.total}, d.parts));
    else            lines.push(line("dmg", "a.none", {side: who}));
  });

  const netToDef = Math.max(0, dmgInv.total - absDef.total);
  const netToInv = Math.max(0, dmgDef.total - absInv.total);

  [["@inv", absInv, dmgDef.total, netToInv], ["@def", absDef, dmgInv.total, netToDef]]
    .forEach(([who, a, incoming, net]) => {
      if(incoming <= 0) return;
      if(a.total > 0) lines.push(line("abs", "a.abs", {side: who, n: Math.min(a.total, incoming), have: a.total, net: net}, a.parts));
      else            lines.push(line("abs", "a.absNone", {side: who, n: incoming}));
    });

  /* Abzuege erst jetzt, nachdem beide Summen stehen — sonst waere der
     Schlagabtausch nicht mehr gleichzeitig.                                */
  const hitInv = netToInv > 0 ? applyRecall(inv, invBoard, ctxInv, netToInv) : [];
  const hitDef = netToDef > 0 ? applyRecall(def, defBoard, ctxDef, netToDef) : [];

  const invTo = totalFp(invBoard), defTo = totalFp(defBoard);
  if(netToInv > 0) lines.push(line("res", "a.recall", {side:"@inv", n:netToInv, from:invFrom, to:invTo}, hitInv));
  if(netToDef > 0) lines.push(line("res", "a.recall", {side:"@def", n:netToDef, from:defFrom, to:defTo}, hitDef));
  if(netToInv === 0 && netToDef === 0) lines.push(line("res", "a.unscathed"));

  return {
    nameKey: "terms.approachStep", nameParams: {},
    invFrom: invFrom, invTo: invTo, defFrom: defFrom, defTo: defTo,
    lines: lines
  };
}

/* ===========================================================================
   5 — SALVO STEP  (§4)
   ======================================================================== */

/* Zusaetzlicher Salvo-Schaden (§4.4, §4.5). Alles wird zu Beginn des Schritts
   geprueft: Torpedoes verlangen Corvette Fleet Power in genau diesem Moment
   (§4.8), und der Destroyer-Bonus zaehlt die Destroyer, die jetzt da sind. */
function extraSalvoDamage(side, board, step, ctx){
  const parts = [];
  let n = 0;
  const t = side.tech.torpedoes;
  if(board.fp.corvette > 0){
    if(t === IMPROVED || (t === BASIC && step === 1)){
      n += 1; parts.push(part("torpedoes", 1));
    }
  }
  if(side.role === "inv" && !ctx.usedDestroyerBonus &&
     ctx.destroyerStep === step && board.fp.destroyer > 0){
    n += board.fp.destroyer;
    parts.push(part("destroyerBonus", board.fp.destroyer));
    ctx.usedDestroyerBonus = true;       // einmal im ganzen Kampf (§4.5)
  }
  return {total: n, parts: parts};
}

/* Salvo Absorption (§4.6, §4.7). Jede Quelle einmal im ganzen Kampf, und was
   in einem Schritt eingesetzt wird, ist in den folgenden weg (§1.3).

   Improved Autonomous Drones und Bombard sind teilbar: sie liefern mehrere
   Einheiten zu je 1, die in verschiedenen Schritten liegen duerfen. Alle
   anderen Quellen sind ein Block, der auf einmal aktiviert wird — mehr als
   der ankommende Schaden verfaellt.                                        */
function salvoPools(side, board, ctx){
  const pools = [];
  if(side.tech.shields > NONE && board.fp.corvette > 0 && !ctx.usedShields){
    pools.push({name:"shields", size:1, use: () => { ctx.usedShields = true; }});
  }
  if(side.role === "def"){
    if(!ctx.usedDread && board.fp.dreadnought > 0){
      pools.push({name:"dreadAbs", size: board.fp.dreadnought, use: () => { ctx.usedDread = true; }});
    }
    if(!ctx.usedCarrier && board.fp.carrier > 0){
      pools.push({name:"carrierAbs", size: board.fp.carrier, use: () => { ctx.usedCarrier = true; }});
    }
  } else {
    for(let i = 0; i < ctx.droneSalvoLeft; i++){
      pools.push({name:"drones", size:1, use: () => { ctx.droneSalvoLeft -= 1; }});
    }
    for(let i = 0; i < ctx.bombardSalvoLeft; i++){
      pools.push({name:"bombard", size:1, use: () => { ctx.bombardSalvoLeft -= 1; }});
    }
  }
  return pools;
}

/* Greedy: zuerst die Quelle mit dem geringsten Verschnitt, bei Gleichstand die
   groessere. Die zweite Haelfte ist wichtiger als sie aussieht — passen ein
   Dreadnought-Block (2) und Shields (1) beide verschnittfrei auf 2 ankommende
   Schaden, dann deckt der Block sie allein ab und die Shields bleiben fuer
   einen spaeteren Schritt uebrig. Andersherum waere der Block nach 1
   absorbiertem Schaden verbraucht (§1.3).

   Absorbiert wird immer, solange etwas ankommt — eine gerettete Fleet Power
   ist mehr wert als eine aufgehobene Absorption.                           */
function absorbSalvo(side, board, ctx, incoming){
  let left = incoming;
  const used = [];
  while(left > 0){
    const pools = salvoPools(side, board, ctx);
    if(!pools.length) break;
    pools.sort((a,b) => {
      const wa = Math.max(0, a.size - Math.min(a.size, left));
      const wb = Math.max(0, b.size - Math.min(b.size, left));
      return wa - wb || b.size - a.size;
    });
    const p = pools[0];
    const got = Math.min(p.size, left);
    p.use();
    left -= got;
    used.push(part(p.name, got));
  }
  return {absorbed: incoming - left, net: left, parts: used};
}

/* Ein Schadenspaket zustellen: absorbieren, Rest abziehen, Log schreiben. */
function deliver(fromKey, target, targetBoard, ctxTarget, amount, dmgParts, lines){
  const who = target.role === "inv" ? "@inv" : "@def";
  lines.push(line("dmg", "s.deal", {side: fromKey, n: amount}, dmgParts));
  const a = absorbSalvo(target, targetBoard, ctxTarget, amount);
  if(a.absorbed > 0) lines.push(line("abs", "s.abs", {side: who, n: a.absorbed, net: a.net}, a.parts));
  if(a.net > 0){
    const from = totalFp(targetBoard);
    const hit  = applyRecall(target, targetBoard, ctxTarget, a.net);
    lines.push(line("res", "s.recall", {side: who, n: a.net, from: from, to: totalFp(targetBoard)}, hit));
  }
  return a.net;
}

function runSalvo(inv, def, invBoard, defBoard, ctxInv, ctxDef, step){
  const lines = [];
  const invFrom = totalFp(invBoard), defFrom = totalFp(defBoard);

  const iInv = initiative(inv, invBoard);
  const iDef = initiative(def, defBoard);
  lines.push(line("ini", "s.init", {side:"@inv", n: iInv.total}, iInv.parts));
  lines.push(line("ini", "s.init", {side:"@def", n: iDef.total}, iDef.parts));

  const ovInv = targetingOverride(inv, invBoard);
  const ovDef = targetingOverride(def, defBoard);

  let order;
  if(ovInv && ovDef){
    /* §10.1 — beide Overrides heben sich auf, danach zaehlt die rohe Zahl. */
    lines.push(line("ini", "s.bothOverride"));
    order = iInv.total > iDef.total ? "inv" : iDef.total > iInv.total ? "def" : "simul";
  } else if(ovInv){
    lines.push(line("ini", "s.override", {side:"@inv"})); order = "inv";
  } else if(ovDef){
    lines.push(line("ini", "s.override", {side:"@def"})); order = "def";
  } else {
    order = iInv.total > iDef.total ? "inv" : iDef.total > iInv.total ? "def" : "simul";
  }

  /* Zusatzschaden steht zu Beginn des Schritts fest, auch fuer die Seite, die
     erst zurueckfeuert (§4.8).                                             */
  const exInv = extraSalvoDamage(inv, invBoard, step, ctxInv);
  const exDef = extraSalvoDamage(def, defBoard, step, ctxDef);

  let stalemate = false;

  if(order === "simul"){
    if(iInv.total < 1 && iDef.total < 1){
      /* §10.2 — beide haben Fleet Power, keiner kann etwas ausrichten.     */
      lines.push(line("res", "s.stalemate"));
      stalemate = true;
    } else {
      lines.push(line("ini", "s.simul", {a: iInv.total, b: iDef.total}));
      const toDef = iInv.total >= 1 ? 1 + exInv.total : 0;
      const toInv = iDef.total >= 1 ? 1 + exDef.total : 0;
      /* Gleichzeitig heisst: erst beide Pakete schnueren, dann zustellen.  */
      if(toDef > 0) deliver("@inv", def, defBoard, ctxDef, toDef, exInv.parts, lines);
      if(toInv > 0) deliver("@def", inv, invBoard, ctxInv, toInv, exDef.parts, lines);
    }
  } else {
    const high = order === "inv"
      ? {key:"@inv", side:inv, board:invBoard, ctx:ctxInv, ini:iInv, ex:exInv}
      : {key:"@def", side:def, board:defBoard, ctx:ctxDef, ini:iDef, ex:exDef};
    const low = order === "inv"
      ? {key:"@def", side:def, board:defBoard, ctx:ctxDef, ini:iDef, ex:exDef}
      : {key:"@inv", side:inv, board:invBoard, ctx:ctxInv, ini:iInv, ex:exInv};

    lines.push(line("ini", "s.first", {side: high.key, a: high.ini.total, b: low.ini.total}));

    if(high.ini.total >= 1){
      deliver(high.key, low.side, low.board, low.ctx, 1 + high.ex.total, high.ex.parts, lines);
    }

    /* §4.3 — die unterlegene Seite rechnet ihre Initiative nach dem erlittenen
       Schaden neu und feuert nur zurueck, wenn noch mindestens 1 uebrig ist. */
    const reInit = initiative(low.side, low.board);
    lines.push(line("ini", "s.recalc", {side: low.key, n: reInit.total}, reInit.parts));
    if(reInit.total >= 1){
      deliver(low.key, high.side, high.board, high.ctx, 1 + low.ex.total, low.ex.parts, lines);
    } else {
      lines.push(line("dmg", "s.noReply", {side: low.key}));
    }
  }

  const invTo = totalFp(invBoard), defTo = totalFp(defBoard);
  lines.push(line("res", "s.res", {inv:"@inv", i:invTo, def:"@def", d:defTo}));

  return {
    step: {
      nameKey: "terms.salvoStep", nameParams: {n: step},
      invFrom: invFrom, invTo: invTo, defFrom: defFrom, defTo: defTo,
      lines: lines
    },
    stalemate: stalemate
  };
}

/* ===========================================================================
   6 — EIN DURCHLAUF
   simulate() rechnet den Kampf fuer eine feste Wahl der Angreifer-Optionen.
   resolve() darunter ruft ihn mehrfach auf und nimmt das beste Ergebnis.
   ======================================================================== */
function newCtx(side, choices){
  const c = {
    usedShields: false, usedDread: false, usedCarrier: false,
    usedDestroyerBonus: false,
    destroyerStep: 0, bombardApproach: 0, bombardSalvoLeft: 0, droneSalvoLeft: 0
  };
  if(side.role === "inv"){
    c.destroyerStep    = choices.destroyerStep;
    c.bombardApproach  = Math.min(side.bombardUnits, choices.bombardApproach);
    c.bombardSalvoLeft = side.bombardUnits - c.bombardApproach;
    if(side.tech.drones > NONE && side.returnTrade){
      c.droneSalvoLeft = side.tech.drones === IMPROVED ? 2 : 1;   // Improved teilbar (§4.7)
    }
  }
  return c;
}

function simulate(norm, choices){
  const inv = norm.inv, def = norm.def;
  const invBoard = boardOf(inv), defBoard = boardOf(def);
  const ctxInv = newCtx(inv, choices), ctxDef = newCtx(def, choices);

  /* Erst absetzen, dann zaehlen — siehe deployCarriers().                  */
  const deployLine = deployCarriers(inv, invBoard);
  const invStart = totalFp(invBoard), defStart = totalFp(defBoard);
  const steps = [];

  steps.push(runApproach(inv, def, invBoard, defBoard, ctxInv, ctxDef, deployLine));

  let outcome = null;

  /* §3.6 — das Fallen House kapituliert, sobald der Angreifer den Approach
     Step ueberlebt. Keine Salvo-Schritte.                                  */
  if(norm.combatType === "fallen"){
    outcome = totalFp(invBoard) > 0 ? "invader" : "defender";
    if(outcome === "invader") steps[0].lines.push(line("res", "a.capitulate"));
  }

  let step = 0;
  while(outcome === null){
    if(totalFp(invBoard) === 0 || totalFp(defBoard) === 0) break;
    step++;
    if(step > MAX_SALVO_STEPS){ outcome = "stalemate"; break; }
    const r = runSalvo(inv, def, invBoard, defBoard, ctxInv, ctxDef, step);
    steps.push(r.step);
    if(r.stalemate){ outcome = "stalemate"; break; }
  }

  const invEnd = totalFp(invBoard), defEnd = totalFp(defBoard);
  if(outcome === null){
    if(invEnd > 0 && defEnd === 0)      outcome = "invader";
    else if(defEnd > 0 && invEnd === 0) outcome = "defender";
    else if(invEnd === 0 && defEnd === 0){
      /* §5.1 Sonderfall: stand im Sektor von vornherein keine Fleet Power,
         sondern nur Sector Defenses oder Starbases, ist ein ausgeloeschter
         Angreifer kein Unentschieden, sondern ein Sieg des Verteidigers.  */
      outcome = defStart === 0 ? "defender" : "tie";
    }
    else outcome = "stalemate";
  }

  return {
    outcome: outcome,
    inv: {start: invStart, end: invEnd},
    def: {start: defStart, end: defEnd},
    steps: steps,
    choices: {
      bombardApproach: ctxInv.bombardApproach,
      bombardSalvo:    inv.bombardUnits - ctxInv.bombardApproach,
      destroyerStep:   ctxInv.usedDestroyerBonus ? choices.destroyerStep : 0
    },
    /* §5.3 — Improved Combat Replicators dreht ein Unentschieden in einen
       Sieg. Nicht modelliert, aber die UI soll darauf hinweisen duerfen.  */
    tieBreakable: outcome === "tie"
  };
}

/* ===========================================================================
   7 — DIE BESTE WAHL SUCHEN
   Bombard-Split und Destroyer-Timing sind Entscheidungen des Angreifers, die
   die UI bewusst nicht abfragt. Der Suchraum ist winzig — hoechstens vier
   Splits mal die Zahl der Salvo-Schritte —, also wird er ausgerechnet statt
   geraten (§10.3, §10.4).

   Bewertet wird aus Sicht des Angreifers: Sieg vor Unentschieden vor Patt vor
   Niederlage, danach moeglichst viel eigene Fleet Power, danach moeglichst
   wenig gegnerische.
   ======================================================================== */
const OUTCOME_RANK = {invader: 3, tie: 2, stalemate: 1, defender: 0};

function score(r){
  return OUTCOME_RANK[r.outcome] * 10000 + r.inv.end * 100 - r.def.end;
}

function resolve(input){
  const norm = normInput(input);

  if(!norm.combatType){
    return {ok: false, outcome: "empty", reason: "noType"};
  }
  const invStart = FLEET_TYPES.reduce((a,k) => a + norm.inv.fp[k], 0);
  const defStart = FLEET_TYPES.reduce((a,k) => a + norm.def.fp[k], 0);
  const defGuns  = norm.def.sectorDefenses + norm.def.starbases;
  if(invStart === 0 && defStart === 0 && defGuns === 0){
    return {ok: false, outcome: "empty", reason: "noFleets"};
  }

  /* Erst ein Referenzlauf ohne Sonderwahl — er sagt, wie viele Salvo-Schritte
     ueberhaupt zur Debatte stehen.                                          */
  const base = simulate(norm, {bombardApproach: 0, destroyerStep: 0});
  const maxStep = Math.max(1, base.steps.length - 1);   // ohne den Approach Step

  const splits = [];
  for(let a = 0; a <= norm.inv.bombardUnits; a++) splits.push(a);

  const dSteps = [0];
  if(norm.inv.fp.destroyer > 0){
    for(let s = 1; s <= maxStep; s++) dSteps.push(s);
  }

  let best = base, bestScore = score(base);
  splits.forEach(a => {
    dSteps.forEach(s => {
      if(a === 0 && s === 0) return;                    // ist schon base
      const r = simulate(norm, {bombardApproach: a, destroyerStep: s});
      const v = score(r);
      if(v > bestScore){ bestScore = v; best = r; }
    });
  });

  best.ok = true;
  best.version = VERSION;
  return best;
}

/* ===========================================================================
   8 — EXPORT
   Genau ein Global fuer den Browser, dazu ein CommonJS-Zweig, damit
   combat.test.js die Datei mit node laden kann. Kein ES-Modul (siehe Kopf).
   ======================================================================== */
const API = {VERSION: VERSION, resolve: resolve, MAX_SALVO_STEPS: MAX_SALVO_STEPS};

global.VoidfallCombat = API;
if(typeof module !== "undefined" && module.exports) module.exports = API;

})(typeof globalThis !== "undefined" ? globalThis : this);
