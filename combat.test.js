/* ============================================================================
   VOIDFALL COMBAT HELPER — TESTS FUER DEN RESOLVER
   ============================================================================

     combat.test.html per Doppelklick    — braucht nichts ausser einem Browser
     node combat.test.js                 — falls Node installiert ist

   Kein Framework, keine Abhaengigkeiten. Der Resolver ist rein, deshalb
   reicht laden und vergleichen.

   Jeder Test nennt den Paragraphen aus COMBAT-RULES.md, den er absichert.
   Der Kern ist das Worked Example aus §8 — es ist der einzige Fall, fuer den
   das Regelwerk selbst ein Ergebnis nennt. Alles andere prueft die
   Order-of-Operations-Fallen aus §9 einzeln, weil genau die still falsch
   rechnen, ohne dass irgendetwas abstuerzt.
   ========================================================================= */
"use strict";

/* Im Browser hat combat.js sein Global schon gesetzt, unter Node kommt es
   ueber require. Sonst ist die Datei identisch.                            */
const C = (typeof require !== "undefined" && typeof module !== "undefined")
  ? require("./combat.js")
  : globalThis.VoidfallCombat;

/* ---- winziges Testgeruest ------------------------------------------------ */
let passed = 0;
const failures = [];
let group = "";

function describe(name){ group = name; }
function check(label, actual, expected){
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if(a === e){ passed++; }
  else failures.push(`${group} — ${label}\n      erwartet: ${e}\n      bekommen: ${a}`);
}
function ok(label, cond){ check(label, !!cond, true); }

/* ---- Eingabe-Bausteine --------------------------------------------------- */
function fleet(o){
  return Object.assign({
    corvette:0, sentry:0, destroyer:0, dreadnought:0, carrier:0, voidborn:0,
    sectorDefenses:0, starbases:0,
    tech: {targeting:0, shields:0, torpedoes:0, dsm:0, destroyers:1, drones:0, energy:0},
    dsmEnergy:false, dsmAdjacent:0, returnTrade:false, bombard:0
  }, o);
}
function tech(o){
  return Object.assign({targeting:0, shields:0, torpedoes:0, dsm:0, destroyers:1, drones:0, energy:0}, o);
}
function run(type, inv, def){
  return C.resolve({combatType:type, inv:fleet(inv), def:fleet(def)});
}
/* Fleet Power beider Seiten nach jedem Schritt — die kompakteste Form, einen
   ganzen Kampfverlauf in einer Zeile zu pruefen. */
function trace(r){
  return r.steps.map(s => `${s.invFrom}→${s.invTo}/${s.defFrom}→${s.defTo}`);
}

/* ===========================================================================
   §8 — WORKED EXAMPLE
   Angreifer 4 Corvette FP + Basic Shields, Verteidiger (Voidborn) 1 Sector
   Defense + 3 Voidborn FP. Das Regelwerk gibt Schritt fuer Schritt vor, was
   herauskommen muss.
   ======================================================================== */
describe("§8 Worked Example");
{
  const r = run("pvv",
    {corvette:4, tech:tech({shields:1})},
    {voidborn:3, sectorDefenses:1});

  check("Ergebnis",              r.outcome,   "invader");
  check("Angreifer am Ende",     r.inv.end,   2);
  check("Verteidiger am Ende",   r.def.end,   0);
  check("Approach + 3 Salvo",    r.steps.length, 4);
  check("Verlauf", trace(r), [
    "4→3/3→3",   // Approach: Sector Defense 1 Damage, Basic Shields gibt keine Approach Absorption
    "3→3/3→2",   // Salvo 1: Initiative 3:3, gleichzeitig, Angreifer absorbiert mit Shields
    "3→2/2→1",   // Salvo 2: 3:2, Angreifer zuerst, Verteidiger rechnet auf 1 nach und feuert zurueck
    "2→2/1→0"    // Salvo 3: 2:1, Angreifer zuerst, Verteidiger faellt auf 0 und feuert nicht mehr
  ]);
}

/* ===========================================================================
   APPROACH STEP  (§3)
   ======================================================================== */
describe("§3.0 Carrier setzen vor dem Schaden ab (Trap 1)");
{
  /* 2 Carrier FP setzen 2 Corvette FP ab. Der Verteidiger teilt 4 Approach
     Damage aus (4 Sector Defenses) — die frischen Corvettes koennen sie
     schlucken, also stehen danach noch 2 von 4 FP.                          */
  const r = run("pvp",
    {carrier:2},
    {sectorDefenses:4});
  check("Start inklusive abgesetzter Corvettes", r.steps[0].invFrom, 4);
  check("nach dem Approach Step",                r.steps[0].invTo,   0);

  /* Und sie erfuellen die Corvette-Bedingung: Improved Shields absorbiert,
     obwohl der Angreifer keine eigene Corvette mitgebracht hat.             */
  const s = run("pvp",
    {carrier:1, tech:tech({shields:2})},
    {sectorDefenses:1});
  check("Improved Shields greift dank Carrier-Corvette", s.steps[0].invTo, 2);
}

describe("§3.2 Energy Cells zaehlt ausgeteilten, nicht angekommenen Schaden (Trap 2)");
{
  /* Verteidiger: 1 Sector Defense + Energy Cells = 2 Approach Damage. Der
     Angreifer absorbiert mit Improved Shields 1 davon — trotzdem hat Energy
     Cells ausgeloest, weil der erste Schaden ausgeteilt wurde.              */
  const r = run("pvp",
    {corvette:3, tech:tech({shields:2})},
    {corvette:1, sectorDefenses:1, tech:tech({energy:2})});
  check("Angreifer verliert 1 FP (2 Damage minus 1 Absorption)", r.steps[0].invTo, 2);

  /* Ohne jede eigene Schadensquelle loest Energy Cells nicht aus.           */
  const s = run("pvp",
    {corvette:3},
    {corvette:1, tech:tech({energy:2})});
  check("Energy Cells allein teilt nichts aus", s.steps[0].invTo, 3);
}

describe("§3.3 Deep Space Missiles");
{
  const basic = run("pvp",
    {corvette:3, dsmEnergy:true, tech:tech({dsm:1})},
    {corvette:3});
  check("Basic mit ausgegebener Energy: 1 Damage", basic.steps[0].defTo, 2);

  const noEnergy = run("pvp",
    {corvette:3, dsmEnergy:false, tech:tech({dsm:1})},
    {corvette:3});
  check("Basic ohne Energy: kein Damage", noEnergy.steps[0].defTo, 3);

  const imp = run("pvp",
    {corvette:3, dsmAdjacent:2, tech:tech({dsm:2})},
    {corvette:4});
  check("Improved mit 2 Nachbarn: 2 Damage", imp.steps[0].defTo, 2);

  /* Basic wirkt beim Verteidiger gar nicht, Improved schon (§3.2 Hinweis).  */
  const defBasic = run("pvp",
    {corvette:3},
    {corvette:3, dsmEnergy:true, dsmAdjacent:2, tech:tech({dsm:1})});
  check("Basic beim Verteidiger: wirkungslos", defBasic.steps[0].invTo, 3);

  const defImp = run("pvp",
    {corvette:3},
    {corvette:3, dsmAdjacent:2, tech:tech({dsm:2})});
  check("Improved beim Verteidiger: 2 Damage", defImp.steps[0].invTo, 1);
}

describe("§3.5 Approach Absorption des Angreifers");
{
  /* Dreadnoughts absorbieren im Approach Step 1 pro FP — nur beim Angreifer. */
  const r = run("pvp",
    {dreadnought:2},
    {sectorDefenses:2});
  check("2 Dreadnought FP schlucken 2 Approach Damage", r.steps[0].invTo, 2);

  const d = run("pvp",
    {corvette:2},
    {dreadnought:2, sectorDefenses:0});
  check("Verteidiger-Dreadnoughts absorbieren im Approach nicht", d.steps[0].defTo, 2);
}

describe("§3.6 Fallen House kapituliert nach dem Approach Step");
{
  const win = run("fallen", {corvette:3}, {});
  check("2 Sector Defenses, Angreifer ueberlebt", win.outcome, "invader");
  check("nur der Approach Step",                 win.steps.length, 1);
  check("verbleibende Fleet Power",              win.inv.end, 1);

  const loss = run("fallen", {corvette:2}, {});
  check("Angreifer faellt auf 0", loss.outcome, "defender");

  /* Der Verteidiger ist vollstaendig determiniert — Eingaben werden ignoriert. */
  const fixed = C.resolve({combatType:"fallen",
    inv: fleet({corvette:3}),
    def: fleet({corvette:99, sectorDefenses:99, voidborn:99})});
  check("Eingaben auf der Fallen-House-Seite zaehlen nicht", fixed.inv.end, 1);
}

/* ===========================================================================
   SALVO STEP  (§4)
   ======================================================================== */
describe("§4.1 Initiative-Pauschalen");
{
  /* Angreifer 2 Destroyer FP: 2 (pro FP) + 1 (flach) = 3 Initiative gegen
     3 Corvette FP des Verteidigers = 3. Gleichstand, also gleichzeitig.     */
  const r = run("pvp", {destroyer:2}, {corvette:3});
  const s1 = r.steps[1].lines.filter(l => l.key === "log.s.init");
  check("Angreifer-Initiative mit Destroyer-Pauschale", s1[0].p.n, 3);
  check("Verteidiger-Initiative",                      s1[1].p.n, 3);

  /* Die Destroyer-Pauschale gilt nur dem Angreifer (§4.1).                  */
  const d = run("pvp", {corvette:3}, {destroyer:2});
  const s2 = d.steps[1].lines.filter(l => l.key === "log.s.init");
  check("Verteidiger-Destroyer ohne Pauschale", s2[1].p.n, 2);

  /* Dreadnought-Pauschale gilt beiden.                                      */
  const dn = run("pvp", {corvette:3}, {dreadnought:2});
  const s3 = dn.steps[1].lines.filter(l => l.key === "log.s.init");
  check("Verteidiger-Dreadnought mit Pauschale", s3[1].p.n, 3);
}

describe("§4.1 Basic Targeting: +5, aber nur mit Corvette FP");
{
  const withC = run("pvp", {corvette:1, tech:tech({targeting:1})}, {corvette:3});
  const l1 = withC.steps[1].lines.filter(l => l.key === "log.s.init");
  check("1 Corvette + Targeting", l1[0].p.n, 6);

  const withoutC = run("pvp", {dreadnought:1, tech:tech({targeting:1})}, {corvette:3});
  const l2 = withoutC.steps[1].lines.filter(l => l.key === "log.s.init");
  check("ohne Corvette kein Bonus", l2[0].p.n, 2);   // 1 pro FP + 1 Pauschale
}

describe("§4.2 Improved Targeting schlaegt die hoehere rohe Initiative");
{
  /* Verteidiger 6 FP gegen Angreifer 2 FP — ohne Targeting feuert der
     Verteidiger zuerst, mit Improved Targeting der Angreifer.               */
  const without = run("pvp", {corvette:2}, {corvette:6});
  check("ohne Targeting gewinnt der Verteidiger", without.outcome, "defender");

  const with_ = run("pvp", {corvette:2, tech:tech({targeting:2})}, {corvette:6});
  const first = with_.steps[1].lines.find(l => l.key === "log.s.override");
  check("Override wird geloggt", first && first.p.side, "@inv");

  /* §4.2 Edge Case: ein Verteidiger, dessen einzige Fleet Power Sentries
     sind, hat 0 Initiative und feuert auch mit Improved Targeting nicht.
     Der Angreifer braucht genug Fleet Power, um den Approach Step der beiden
     Sentries zu ueberstehen — sonst gibt es gar keinen Salvo-Schritt.       */
  const sentryOnly = run("pvp",
    {corvette:5},
    {sentry:2, tech:tech({targeting:2})});
  const ov = sentryOnly.steps[1].lines.find(l => l.key === "log.s.override");
  check("kein Override fuer reine Sentry-Verteidigung", ov, undefined);
  check("Angreifer gewinnt", sentryOnly.outcome, "invader");
}

describe("§10.1 Beide Seiten Improved Targeting — Rueckfall auf rohe Initiative");
{
  const r = run("pvp",
    {corvette:2, tech:tech({targeting:2})},
    {corvette:6, tech:tech({targeting:2})});
  const both = r.steps[1].lines.find(l => l.key === "log.s.bothOverride");
  ok("Rueckfall wird geloggt", !!both);
  check("die hoehere rohe Initiative entscheidet", r.outcome, "defender");
}

describe("§4.1 Sentries geben dem Verteidiger 0 Initiative (Trap 7)");
{
  /* 3 Sentry FP teilen im Approach Step 3 Damage aus — der Angreifer muss
     das erst ueberstehen, sonst gibt es keinen Salvo-Schritt zu pruefen.   */
  const r = run("pvp", {corvette:6}, {sentry:3});
  const init = r.steps[1].lines.filter(l => l.key === "log.s.init");
  check("Verteidiger-Initiative", init[1].p.n, 0);
  check("Angreifer gewinnt", r.outcome, "invader");
  ok("Kampf terminiert", r.steps.length < C.MAX_SALVO_STEPS);
}

describe("§4.4/§4.5 Torpedoes");
{
  /* Basic: +1 Damage nur im ersten Salvo-Schritt.                           */
  const basic = run("pvp",
    {corvette:4, tech:tech({torpedoes:1})},
    {corvette:4});
  check("Salvo 1: Verteidiger verliert 2 FP", basic.steps[1].defTo, 2);
  check("Salvo 2: nur noch 1 FP",             basic.steps[2].defTo, 1);

  /* Improved: +1 in jedem Schritt.                                          */
  const imp = run("pvp",
    {corvette:4, tech:tech({torpedoes:2})},
    {corvette:4});
  check("Salvo 1", imp.steps[1].defTo, 2);
  check("Salvo 2", imp.steps[2].defTo, 0);

  /* Ohne Corvette Fleet Power kein Torpedo-Schaden — die Bedingung wird zu
     Beginn jedes Schritts geprueft (§4.8, Trap 3).                          */
  const noCorv = run("pvp",
    {dreadnought:3, tech:tech({torpedoes:2})},
    {corvette:3});
  check("Improved Torpedoes ohne Corvette", noCorv.steps[1].defTo, 2);
}

describe("§4.6 Salvo Absorption des Verteidigers, je einmal im Kampf");
{
  /* Basic Shields absorbiert genau einmal.                                  */
  const r = run("pvp",
    {corvette:4},
    {corvette:4, tech:tech({shields:1})});
  check("Salvo 1: absorbiert", r.steps[1].defTo, 4);
  check("Salvo 2: aufgebraucht", r.steps[2].defTo, 3);

  /* Ohne Corvette Fleet Power gibt es die Shields-Absorption nicht — das ist
     der Kern der Corvette-Bindung aus §4.8.                                 */
  const noCorv = run("pvp",
    {corvette:4},
    {dreadnought:4, tech:tech({shields:2})});
  const absLines = noCorv.steps[1].lines.filter(l => l.key === "log.s.abs");
  const usedShields = absLines.some(l => (l.parts||[]).some(p => p.key === "log.p.shields"));
  check("keine Shields-Absorption ohne Corvette", usedShields, false);

  /* Passen zwei Quellen verschnittfrei auf den ankommenden Schaden, deckt die
     groessere ihn allein ab und die kleinere bleibt uebrig. Hier: 2 Damage,
     Dreadnought-Block (2) und Shields (1) verfuegbar.                       */
  const fit = run("pvp",
    {corvette:6, tech:tech({torpedoes:2})},
    {corvette:2, dreadnought:2, tech:tech({shields:1})});
  const used = fit.steps[1].lines
    .filter(l => l.key === "log.s.abs")
    .reduce((a,l) => a.concat((l.parts||[]).map(p => p.key)), []);
  check("nur der Dreadnought-Block wird angebrochen", used, ["log.p.dreadAbs"]);
  const later = fit.steps[2].lines
    .filter(l => l.key === "log.s.abs")
    .reduce((a,l) => a.concat((l.parts||[]).map(p => p.key)), []);
  check("die Shields stehen im naechsten Schritt noch", later, ["log.p.shields"]);
}

describe("§4.7 Autonomous Drones: Improved teilt 2 Absorptionen auf");
{
  const r = run("pvp",
    {corvette:5, returnTrade:true, tech:tech({drones:2})},
    {corvette:5});
  /* 1 Approach Absorption plus 2 Salvo Absorptionen, verteilt auf zwei
     Schritte — der Angreifer verliert in Salvo 1 und 2 nichts.              */
  check("Salvo 1 ohne Verlust", r.steps[1].invTo, 5);
  check("Salvo 2 ohne Verlust", r.steps[2].invTo, 5);
  check("Salvo 3 mit Verlust",  r.steps[3].invTo, 4);
}

describe("§4.5/§10.4 Destroyer-Bonus wird auf den besten Schritt gelegt");
{
  const r = run("pvp",
    {destroyer:3},
    {corvette:5});
  ok("ein Salvo-Schritt wurde gewaehlt", r.choices.destroyerStep >= 1);
  const step = r.steps[r.choices.destroyerStep];
  const bonus = step.lines.some(l => (l.parts||[]).some(p => p.key === "log.p.destroyerBonus"));
  ok("der Bonus steht im gewaehlten Schritt", bonus);

  /* Ohne Destroyer Fleet Power gibt es nichts zu timen.                     */
  const none = run("pvp", {corvette:3}, {corvette:3});
  check("kein Destroyer, kein Timing", none.choices.destroyerStep, 0);
}

describe("§3.5/§4.7 Bombard: der Split wird gesucht, nicht geraten");
{
  /* 9 Materials = 3 Absorptionen. Der Verteidiger teilt im Approach Step
     3 Damage aus (3 Sector Defenses) — alle drei Einheiten gehoeren dorthin,
     sonst stirbt der Angreifer, bevor die Salvo-Schritte beginnen.          */
  const r = run("pvp",
    {corvette:3, bombard:9},
    {corvette:1, sectorDefenses:3});
  check("alle drei Einheiten in den Approach Step", r.choices.bombardApproach, 3);
  check("Angreifer unbeschadet",                    r.steps[0].invTo, 3);
  check("Angreifer gewinnt",                        r.outcome, "invader");

  /* Ohne Approach-Schaden gehoeren sie in die Salvo-Schritte.               */
  const s = run("pvp",
    {corvette:4, bombard:6},
    {corvette:4});
  check("nichts in den Approach Step", s.choices.bombardApproach, 0);
  check("beide Einheiten fuer die Salvo-Schritte", s.choices.bombardSalvo, 2);
}

/* ===========================================================================
   ERGEBNISSE  (§5)
   ======================================================================== */
describe("§5 Ergebnisarten");
{
  const tie = run("pvp", {corvette:1}, {corvette:1});
  check("beide auf 0 ist ein Unentschieden", tie.outcome, "tie");
  check("Hinweis auf Improved Combat Replicators", tie.tieBreakable, true);

  const win = run("pvp", {corvette:5}, {corvette:1});
  check("Angreifer gewinnt", win.outcome, "invader");
  check("kein Replicator-Hinweis", win.tieBreakable, false);

  const loss = run("pvp", {corvette:1}, {corvette:5});
  check("Verteidiger gewinnt", loss.outcome, "defender");

  /* §5.1 Sonderfall: ein Sektor ohne Fleet Power, aber mit Installationen.  */
  const emptySector = run("pvp", {corvette:2}, {sectorDefenses:3});
  check("Angreifer stirbt im Approach Step", emptySector.outcome, "defender");
  check("keine Salvo-Schritte",              emptySector.steps.length, 1);

  const nothing = C.resolve({combatType:"pvp", inv:fleet({}), def:fleet({})});
  check("leere Eingabe", nothing.outcome, "empty");
  check("nicht rechenbar", nothing.ok, false);

  const noType = C.resolve({combatType:null, inv:fleet({corvette:3}), def:fleet({corvette:3})});
  check("ohne Kampftyp", noType.outcome, "empty");
}

describe("Skirmish: die Voidborn sind der Angreifer");
{
  const r = run("skirmish", {voidborn:4}, {corvette:2, sectorDefenses:1});
  check("Voidborn gewinnen", r.outcome, "invader");

  /* Voidborn haben keine Technologien — was in der Eingabe steht, wird
     verworfen (§2.3).                                                       */
  const cheat = C.resolve({combatType:"skirmish",
    inv: fleet({voidborn:3, tech:tech({targeting:2, torpedoes:2})}),
    def: fleet({corvette:3})});
  const ov = cheat.steps[1].lines.find(l => l.key === "log.s.override");
  check("kein Improved Targeting fuer Voidborn", ov, undefined);
}

/* ===========================================================================
   ROBUSTHEIT
   ======================================================================== */
describe("Robustheit");
{
  /* Der Resolver darf an unvollstaendiger Eingabe nicht scheitern.          */
  const bare = C.resolve({combatType:"pvp", inv:{corvette:3}, def:{corvette:2}});
  check("fehlende Felder werden zu 0", bare.outcome, "invader");

  const junk = C.resolve({combatType:"pvp",
    inv:{corvette:-5, tech:{targeting:"x"}},
    def:{corvette:2.7}});
  check("unsinnige Werte werden abgefangen", junk.outcome, "defender");

  /* Kein Durchlauf darf in die Notbremse laufen.                            */
  let maxSteps = 0;
  for(let i = 1; i <= 14; i++){
    for(let j = 1; j <= 14; j++){
      const r = run("pvp", {corvette:i}, {corvette:j});
      maxSteps = Math.max(maxSteps, r.steps.length);
    }
  }
  ok("alle 196 Corvette-Paarungen terminieren weit vor der Notbremse",
     maxSteps < C.MAX_SALVO_STEPS);

  /* Die Eingabe wird nicht veraendert.                                      */
  const input = {combatType:"pvp", inv:fleet({corvette:4}), def:fleet({corvette:3})};
  const before = JSON.stringify(input);
  C.resolve(input);
  check("resolve() laesst die Eingabe unberuehrt", JSON.stringify(input), before);

  /* Gleiche Eingabe, gleiches Ergebnis.                                     */
  const a = run("pvp", {corvette:6, tech:tech({shields:1, torpedoes:2})}, {corvette:5, sectorDefenses:1});
  const b = run("pvp", {corvette:6, tech:tech({shields:1, torpedoes:2})}, {corvette:5, sectorDefenses:1});
  check("deterministisch", JSON.stringify(a), JSON.stringify(b));
}

describe("Log-Struktur");
{
  const r = run("pvv", {corvette:4, tech:tech({shields:1})}, {voidborn:3, sectorDefenses:1});
  const allLines = r.steps.reduce((a,s) => a.concat(s.lines), []);
  ok("jede Zeile hat einen Schluessel", allLines.every(l => typeof l.key === "string" && l.key.startsWith("log.")));
  ok("jede Zeile hat einen Pip",        allLines.every(l => ["ini","dmg","abs","res"].indexOf(l.pip) >= 0));
  ok("keine fertigen Saetze",           allLines.every(l => !/[a-z]{4}\s[a-z]{4}/.test(JSON.stringify(l.p))));
  ok("kein Markup",                     allLines.every(l => JSON.stringify(l).indexOf("<") < 0));
  ok("Fragmente sind uebersetzbar",     allLines.every(l => !l.parts || l.parts.every(p => p.key.startsWith("log.p."))));
  ok("Schrittnamen sind Schluessel",    r.steps.every(s => s.nameKey.startsWith("terms.")));
}

/* ---- Bilanz --------------------------------------------------------------
   Ausgabe geht immer auf die Konsole und, wenn eine Seite da ist,
   zusaetzlich sichtbar ins Dokument.                                       */
const report = [];
if(failures.length === 0){
  report.push(`${passed} Pruefungen, alle bestanden.`);
} else {
  report.push(`${passed} bestanden, ${failures.length} fehlgeschlagen:`, "");
  failures.forEach(f => report.push("  x " + f, ""));
}
report.forEach(l => console.log(l));

if(typeof document !== "undefined"){
  const out = document.getElementById("out");
  if(out){
    out.textContent = report.join("\n");
    out.className = failures.length === 0 ? "pass" : "fail";
  }
}
if(typeof process !== "undefined" && process.exit) process.exit(failures.length === 0 ? 0 : 1);
