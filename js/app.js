import { drawCertificate } from "./certificate.js";
import {
  CACHE_NAME,
  STORAGE_KEY,
  draftWord,
  getStop,
  getVillager,
  leftOut,
  sourceById,
  sources,
  stops,
  villagers,
} from "./data.js";
import { MAX_ACCURACY_M, RADIUS_M, assessGps, distanceMetres, formatMetres } from "./geo.js";

const main = document.querySelector("#main");
const live = document.querySelector("#live");
const offlineStatus = document.querySelector("#offline-status");

let state = loadState();
let saveWarning = "";
let ui = blankUi("");
let lastRouteKey = "";
let certificateBlob = null;
let drawToken = 0;
let offlineSaved = false;
let offlineFailed = false;
let offlineUnsupported = false;

function blankUi(key) {
  return {
    key,
    puzzle: "kids",
    choice: "",
    reveal: false,
    confirmReset: false,
    code: "",
    codeValue: "",
    gps: "",
    puzzleMsg: "",
    shareMsg: "",
  };
}

function loadState() {
  const fresh = () => ({ villagerId: null, unlocked: {}, solved: {}, completedAt: null });
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const data = JSON.parse(raw);
    const next = fresh();
    if (getVillager(data.villagerId)) next.villagerId = data.villagerId;
    for (const stop of stops) {
      if (data.unlocked && data.unlocked[stop.id]) next.unlocked[stop.id] = true;
      if (data.solved && (data.solved[stop.id] === "kids" || data.solved[stop.id] === "adult")) {
        next.solved[stop.id] = data.solved[stop.id];
      }
    }
    if (typeof data.completedAt === "string") next.completedAt = data.completedAt;
    return next;
  } catch (error) {
    return fresh();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveWarning = "";
  } catch (error) {
    saveWarning =
      "Progress could not be saved in this browser. You can still play, but it may be forgotten if you close the page.";
  }
}

function h(tag, props, ...children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "value" && (tag === "input" || tag === "textarea")) node.value = value;
      else if (key === "disabled" || key === "checked" || key === "open") node[key] = Boolean(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  appendChildren(node, children);
  return node;
}

function appendChildren(node, children) {
  for (const child of children) {
    if (Array.isArray(child)) appendChildren(node, child);
    else if (child == null || child === false) continue;
    else node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
}

function svgEl(tag, attrs, ...children) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  for (const child of children) node.append(child);
  return node;
}

function announce(text) {
  live.textContent = "";
  window.setTimeout(() => {
    live.textContent = text;
  }, 30);
}

function parseRoute() {
  const raw = (location.hash || "#/start").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  return { name: parts[0] || "start", id: parts[1] || null };
}

function villager() {
  return getVillager(state.villagerId);
}

function allSolved() {
  return stops.every((stop) => state.solved[stop.id]);
}

function solvedCount() {
  return stops.filter((stop) => state.solved[stop.id]).length;
}

function stopStatus(stop) {
  if (state.solved[stop.id]) return `Letter ${stop.letter} collected`;
  if (state.unlocked[stop.id]) return "Unlocked";
  return "Locked";
}

function normaliseCode(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z]/g, "");
}

function findStopByCode(value) {
  const code = normaliseCode(value);
  if (!code) return null;
  return stops.find((stop) => stop.code === code) || null;
}

function chooseVillager(id) {
  state.villagerId = id;
  state.completedAt = null;
  saveState();
  location.hash = "#/intro";
}

function drawRandom() {
  const pool = villagers.filter((person) => !person.placeholder);
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  chooseVillager(pool[buffer[0] % pool.length].id);
}

function resetTrail() {
  state = { villagerId: null, unlocked: {}, solved: {}, completedAt: null };
  saveState();
  location.hash = "#/start";
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch (error) {
    return String(iso).slice(0, 10);
  }
}

function backLink(href, label) {
  return h("a", { class: "back", href }, label);
}

function badges(person) {
  return h(
    "span",
    { class: "badges" },
    person && person.placeholder ? h("span", { class: "badge placeholder" }, "Placeholder") : null,
    h("span", { class: "badge" }, "Draft"),
  );
}

function letterRow() {
  return h(
    "ol",
    { class: "letter-row" },
    stops.map((stop) => {
      const got = Boolean(state.solved[stop.id]);
      return h(
        "li",
        { class: got ? "got" : "waiting" },
        h("span", { class: "tile", "aria-hidden": "true" }, got ? stop.letter : "·"),
        h("span", { class: "tile-caption" }, stop.shortName),
        h(
          "span",
          { class: "sr-only" },
          got
            ? `Letter ${stop.letter} from ${stop.name}`
            : `Letter from ${stop.name} not yet collected`,
        ),
      );
    }),
  );
}

function saveNote() {
  return saveWarning ? h("p", { class: "note", role: "status" }, saveWarning) : null;
}

function resetBox() {
  if (!ui.confirmReset) {
    return h(
      "button",
      {
        type: "button",
        class: "button quiet",
        onclick: () => {
          ui.confirmReset = true;
          render();
        },
      },
      "Start again",
    );
  }
  return h(
    "div",
    { class: "confirm" },
    h(
      "p",
      {},
      "This clears the villager, the unlocked stops and the letters on this device.",
    ),
    h(
      "button",
      { type: "button", class: "button primary", onclick: resetTrail },
      "Clear this device",
    ),
    h(
      "button",
      {
        type: "button",
        class: "button secondary",
        onclick: () => {
          ui.confirmReset = false;
          render();
        },
      },
      "Keep going",
    ),
  );
}

function coverMark() {
  return svgEl(
    "svg",
    { class: "mark", viewBox: "0 0 64 64", "aria-hidden": "true" },
    svgEl("path", {
      d: "M10 48 V28 Q32 6 54 28 V48",
      fill: "none",
      stroke: "#1c3d32",
      "stroke-width": "3",
      "stroke-linecap": "round",
    }),
    svgEl("path", {
      d: "M10 48 H54",
      fill: "none",
      stroke: "#1c3d32",
      "stroke-width": "3",
      "stroke-linecap": "round",
    }),
  );
}

function viewStart() {
  const person = villager();
  const finished = person && allSolved();
  return h(
    "div",
    {},
    coverMark(),
    h("p", { class: "kicker" }, "For Eyam Museum · draft prototype"),
    h("h1", {}, "The Eyam Pass"),
    h(
      "p",
      { class: "lede" },
      "A short trail of three places on the edge of the village, in the plague year of 1665–66.",
    ),
    h(
      "p",
      {},
      "The village is remembered for staying behind a boundary so the sickness would not be carried to its neighbours. Historians do not agree on every part of that story, including how complete the closure was, or how many people died.",
    ),
    h(
      "p",
      {},
      "The three example stops are Mompesson's Well, the Boundary Stone and the Riley Graves. A full trail would add more. Nothing here has been checked by the museum.",
    ),
    h(
      "p",
      {},
      `A stop unlocks within about ${RADIUS_M} metres, or with a code word if you cannot do the walk.`,
    ),
    saveNote(),
    finished
      ? h(
          "div",
          { class: "actions" },
          h("a", { class: "button primary", href: "#/end" }, "Read the ending"),
          h("a", { class: "button secondary", href: "#/map" }, "Back to the map"),
          h("a", { class: "button secondary", href: "#/codes" }, "Can't walk the trail?"),
        )
      : h(
          "div",
          { class: "actions" },
          person ? h("a", { class: "button primary", href: "#/map" }, `Continue as ${person.name}`) : null,
          h("a", { class: person ? "button secondary" : "button primary", href: "#/choose" }, "Choose a villager"),
          h(
            "button",
            { type: "button", class: "button secondary", onclick: drawRandom },
            "Draw one at random",
          ),
          h("a", { class: "button secondary", href: "#/codes" }, "Can't walk the trail?"),
        ),
  );
}

function viewChoose() {
  return h(
    "div",
    {},
    backLink("#/start", "Back to the start"),
    h("h1", {}, "Choose a villager"),
    h(
      "p",
      {},
      "Each person is named from published accounts of Eyam in 1665–66, except the placeholder card, which is not a real resident. The stories stay short. The fate is kept for the end.",
    ),
    solvedCount()
      ? h("p", { class: "note" }, "Stops already unlocked on this device will be kept if you change villager.")
      : null,
    villagers.map((person) =>
      h(
        "button",
        {
          type: "button",
          class: person.placeholder ? "person placeholder" : "person",
          onclick: () => chooseVillager(person.id),
        },
        badges(person),
        h("span", { class: "person-name" }, person.name),
        h("span", { class: "person-role" }, person.role),
        person.placeholder
          ? h("span", { class: "person-role" }, "Not included in the random draw.")
          : null,
      ),
    ),
  );
}

function viewIntro() {
  const person = villager();
  if (!person) {
    return h(
      "div",
      {},
      h("h1", {}, "Choose a villager first"),
      h("a", { class: "button primary", href: "#/choose" }, "Choose a villager"),
    );
  }
  return h(
    "div",
    {},
    backLink("#/choose", "Choose someone else"),
    badges(person),
    h("h1", {}, person.name),
    h("p", { class: "kicker" }, person.role),
    person.story.map((paragraph) => h("p", {}, paragraph)),
    person.placeholder
      ? h(
          "p",
          {},
          "There is no fate, because this is not a real person. The ending still opens, so the certificate can be seen.",
        )
      : h(
          "p",
          {},
          "Their fate is written at the end of the trail, once the three stops are done. It is a draft for the museum to check.",
        ),
    h("a", { class: "button primary", href: "#/map" }, "Go to the map"),
  );
}

function mapGraphic() {
  const eastings = stops.map((stop) => stop.grid.easting);
  const northings = stops.map((stop) => stop.grid.northing);
  const minE = Math.min(...eastings);
  const maxE = Math.max(...eastings);
  const minN = Math.min(...northings);
  const maxN = Math.max(...northings);
  const vbW = 320;
  const vbH = 440;
  const padX = 72;
  const padY = 54;
  const point = (stop) => ({
    x: padX + ((stop.grid.easting - minE) / (maxE - minE)) * (vbW - padX * 2),
    y: padY + ((maxN - stop.grid.northing) / (maxN - minN)) * (vbH - padY * 2),
  });
  const labels = {
    well: { dx: 26, dy: -6, anchor: "start", text: "Well" },
    stone: { dx: 0, dy: -34, anchor: "middle", text: "Stone" },
    graves: { dx: -26, dy: 5, anchor: "end", text: "Riley" },
  };
  const svg = svgEl("svg", {
    class: "map-svg",
    viewBox: `0 0 ${vbW} ${vbH}`,
    role: "img",
    "aria-label": "Schematic map of the three stops. North is up. Not to scale.",
  });
  svg.append(
    svgEl("path", {
      d: "M20 90 C70 70 110 120 170 100 C230 80 250 60 300 78",
      fill: "none",
      stroke: "#b7c7bc",
      "stroke-width": "2",
    }),
    svgEl("path", {
      d: "M16 180 C90 160 140 200 210 176 C270 156 290 190 310 170",
      fill: "none",
      stroke: "#b7c7bc",
      "stroke-width": "2",
    }),
    svgEl("text", { x: "292", y: "28", "text-anchor": "middle", "font-size": "13", fill: "#1c3d32" }, "N"),
    svgEl("path", {
      d: "M292 34 V58",
      stroke: "#1c3d32",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
    }),
  );
  const pins = [];
  for (const stop of stops) {
    const at = point(stop);
    const label = labels[stop.id];
    svg.append(
      svgEl(
        "text",
        {
          x: String(at.x + label.dx),
          y: String(at.y + label.dy),
          "text-anchor": label.anchor,
          "font-size": "13",
          fill: "#241c16",
        },
        label.text,
      ),
    );
    const solved = Boolean(state.solved[stop.id]);
    const unlocked = Boolean(state.unlocked[stop.id]);
    const pinClass = solved ? "map-pin solved" : unlocked ? "map-pin" : "map-pin locked";
    pins.push(
      h(
        "a",
        {
          class: pinClass,
          href: `#/stop/${stop.id}`,
          style: `left:${(at.x / vbW) * 100}%;top:${(at.y / vbH) * 100}%`,
          "aria-label": `${stop.name}, ${stopStatus(stop)}`,
        },
        solved ? stop.letter : unlocked ? "•" : "–",
      ),
    );
  }
  return h("div", { class: "map-frame" }, svg, pins);
}

function viewMap() {
  const person = villager();
  return h(
    "div",
    {},
    backLink("#/start", "Back to the start"),
    h("h1", {}, "The three stops"),
    person
      ? h(
          "p",
          {},
          "Walking with ",
          h("strong", {}, person.name),
          ". ",
          h("a", { href: "#/choose" }, "Change villager"),
          ".",
        )
      : h(
          "p",
          { class: "note" },
          "No villager chosen yet. You can still open a stop. ",
          h("a", { href: "#/choose" }, "Choose a villager"),
          " before the ending.",
        ),
    h(
      "p",
      {},
      `North is up. The map is not to scale, and it is not a walking route. Each stop unlocks within about ${RADIUS_M} metres, or with a code word.`,
    ),
    h("a", { class: "button secondary", href: "#/codes" }, "Can't walk the trail?"),
    h(
      "p",
      {},
      "Check with the museum before a visit. This prototype does not give paths, opening times or a right of access.",
    ),
    mapGraphic(),
    h("p", {}, `${solvedCount()} of 3 letters`),
    letterRow(),
    h("h2", {}, "Stops, in any order"),
    h("p", {}, "This list is not a route. The letters sit in word order, which is not the same as north to south."),
    stops.map((stop) =>
      h(
        "a",
        {
          class: state.unlocked[stop.id] ? "stop-row" : "stop-row locked",
          href: `#/stop/${stop.id}`,
        },
        h("span", { class: "stop-name" }, stop.name),
        h("span", { class: "stop-meta" }, `${stop.where} · ${stop.grid.label}`),
        h("span", { class: "stop-status" }, stopStatus(stop)),
      ),
    ),
    allSolved()
      ? person
        ? h("a", { class: "button primary", href: "#/end" }, "Read the ending")
        : h("a", { class: "button primary", href: "#/choose" }, "Choose a villager to open the ending")
      : null,
    h("a", { class: "button secondary", href: "#/codes" }, "Can't walk the trail?"),
    h(
      "p",
      { class: "note" },
      "Only three example stops are in this prototype. A full trail would add more stops, and a longer word.",
    ),
    saveNote(),
    resetBox(),
  );
}

function unlockStop(stop) {
  state.unlocked[stop.id] = true;
  saveState();
  ui.code = `${stop.name} is unlocked on this device.`;
  ui.codeValue = "";
  announce(ui.code);
  render();
}

function onCodeSubmit(event, expectedId) {
  event.preventDefault();
  const raw = String(new FormData(event.currentTarget).get("code") || "");
  ui.codeValue = raw;
  const found = findStopByCode(raw);
  if (!found) {
    ui.code = raw.trim()
      ? "That code word is not one of the three in this prototype."
      : "Type a code word.";
    announce(ui.code);
    render();
    return;
  }
  if (expectedId && found.id !== expectedId) {
    ui.code = `That is the code word for ${found.name}, not for this stop.`;
    announce(ui.code);
    render();
    return;
  }
  unlockStop(found);
}

function viewCodes() {
  return h(
    "div",
    {},
    backLink("#/map", "Back to the map"),
    h("h1", {}, "Can't walk the trail?"),
    h(
      "p",
      {},
      "Use a code word if you cannot do the walk, or if you are at the museum, at home, or on a screen indoors. The three words for this prototype are shown here in full. Capital letters do not matter.",
    ),
    stops.map((stop) =>
      h(
        "section",
        { class: "code-card" },
        h("h2", {}, stop.name),
        h("p", {}, "Code word"),
        h("p", { class: "code-word" }, stop.code),
        state.unlocked[stop.id]
          ? h("a", { class: "button secondary", href: `#/stop/${stop.id}` }, `Open ${stop.name}`)
          : h(
              "button",
              { type: "button", class: "button primary", onclick: () => unlockStop(stop) },
              `Unlock ${stop.name}`,
            ),
      ),
    ),
    h("h2", {}, "Or type a word"),
    codeForm(null),
    ui.code ? h("p", { class: "message", role: "status" }, ui.code) : null,
    h("a", { class: "button secondary", href: "#/map" }, "Go to the map"),
  );
}

function codeForm(expectedId) {
  return h(
    "form",
    { onsubmit: (event) => onCodeSubmit(event, expectedId) },
    h("label", { class: "field", for: expectedId ? `code-${expectedId}` : "code-any" }, "Code word"),
    h("input", {
      id: expectedId ? `code-${expectedId}` : "code-any",
      name: "code",
      type: "text",
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
      value: ui.codeValue || "",
      enterkeyhint: "go",
    }),
    h("div", { class: "actions" }, h("button", { type: "submit", class: "button secondary" }, "Use this code word")),
  );
}

function gpsMessage(stop, position) {
  const accuracy = position.coords.accuracy;
  const distance = distanceMetres(
    position.coords.latitude,
    position.coords.longitude,
    stop.wgs84.lat,
    stop.wgs84.lon,
  );
  const result = assessGps(distance, accuracy);
  const distanceText =
    distance > RADIUS_M && distance < RADIUS_M + 1 ? "just over 30 metres" : formatMetres(distance);
  const accuracyText = formatMetres(accuracy);
  if (result.unlock) {
    state.unlocked[stop.id] = true;
    saveState();
    return `You are ${distanceText} from this stop, and the reading is precise to ${accuracyText}. The stop is unlocked.`;
  }
  if (result.reason === "vague") {
    return `The phone puts you ${distanceText} away, but the reading is only precise to ${accuracyText}. That is too vague to confirm ${RADIUS_M} metres. Try again outdoors, or use the code word.`;
  }
  if (result.reason === "outside") {
    return `You are ${distanceText} from this stop. It unlocks at about ${RADIUS_M} metres. The reading is precise to ${accuracyText}.`;
  }
  return "This reading could not be used. Try again, or use the code word.";
}

function checkGps(stop) {
  if (!("geolocation" in navigator) || !window.isSecureContext) {
    ui.gps =
      "This page is not on a secure connection, so a phone will not share its location. Use the code word. Hosting the trail at an https address fixes this.";
    announce(ui.gps);
    render();
    return;
  }
  ui.gps = "Checking where you are…";
  announce(ui.gps);
  render();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      ui.gps = gpsMessage(stop, position);
      announce(ui.gps);
      render();
    },
    (error) => {
      if (error.code === 1) {
        ui.gps = "Location is blocked. You can allow it in the browser settings, or use the code word.";
      } else if (error.code === 3) {
        ui.gps = "The location request timed out. Try again outdoors, or use the code word.";
      } else {
        ui.gps = "This device could not find where you are. Use the code word.";
      }
      announce(ui.gps);
      render();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
}

function lockedStop(stop) {
  return h(
    "div",
    {},
    backLink("#/map", "Back to the map"),
    h("h1", {}, stop.name),
    h("p", { class: "kicker" }, "Locked"),
    h("p", {}, `${stop.where}. ${stop.catalogue}.`),
    h(
      "p",
      {},
      `Walk to within about ${RADIUS_M} metres, or use the code word. A reading vaguer than ${MAX_ACCURACY_M} metres will not unlock the stop.`,
    ),
    h(
      "button",
      { type: "button", class: "button primary", onclick: () => checkGps(stop) },
      "Check if I am here",
    ),
    ui.gps ? h("p", { class: "message", role: "status" }, ui.gps) : null,
    h("h2", {}, "Code word for this stop"),
    h("p", { class: "code-word" }, stop.code),
    h(
      "button",
      {
        type: "button",
        class: "button primary",
        onclick: () => unlockStop(stop),
      },
      "Unlock with this code word",
    ),
    h("h2", {}, "Or type it"),
    codeForm(stop.id),
    ui.code ? h("p", { class: "message", role: "status" }, ui.code) : null,
    h("a", { href: "#/codes" }, "See all three code words"),
  );
}

function puzzleBlock(stop) {
  const puzzle = stop[ui.puzzle];
  const solved = Boolean(state.solved[stop.id]);
  return h(
    "section",
    {},
    h("h2", {}, "Puzzle ", h("span", { class: "badge" }, "Draft answer")),
    h("p", {}, "The draft answer is written in the card above. It has not been checked by the museum."),
    solved
      ? h(
          "p",
          { class: "note" },
          `Letter collected with the ${
            state.solved[stop.id] === "kids" ? "kids'" : "adult"
          } version. You can still read the other one.`,
        )
      : null,
    h(
      "div",
      { class: "segment", role: "group", "aria-label": "Puzzle version" },
      h(
        "button",
        {
          type: "button",
          "aria-pressed": ui.puzzle === "kids" ? "true" : "false",
          onclick: () => {
            ui.puzzle = "kids";
            ui.reveal = false;
            ui.choice = "";
            ui.puzzleMsg = "";
            render();
          },
        },
        "Kids' version",
      ),
      h(
        "button",
        {
          type: "button",
          "aria-pressed": ui.puzzle === "adult" ? "true" : "false",
          onclick: () => {
            ui.puzzle = "adult";
            ui.reveal = false;
            ui.choice = "";
            ui.puzzleMsg = "";
            render();
          },
        },
        "Adult version",
      ),
    ),
    h(
      "form",
      {
        onsubmit: (event) => {
          event.preventDefault();
          const selected = event.currentTarget.querySelector('input[name="puzzle"]:checked');
          if (!selected) {
            ui.puzzleMsg = "Choose one of the answers first.";
            announce(ui.puzzleMsg);
            render();
            return;
          }
          ui.choice = selected.value;
          const index = Number(selected.value);
          if (index === puzzle.answer) {
            if (!state.solved[stop.id]) {
              state.solved[stop.id] = ui.puzzle;
              saveState();
            }
            ui.puzzleMsg = `That matches the draft answer: ${puzzle.choices[puzzle.answer]}.`;
            announce(ui.puzzleMsg);
            render();
            return;
          }
          ui.puzzleMsg = "That is not the draft answer. The card above has what you need.";
          announce(ui.puzzleMsg);
          render();
        },
      },
      h("fieldset", {}, h("legend", {}, puzzle.prompt), puzzle.choices.map((choice, index) =>
        h(
          "label",
          { class: ui.reveal && index === puzzle.answer ? "choice is-draft-answer" : "choice" },
          h("input", {
            type: "radio",
            name: "puzzle",
            value: String(index),
            checked: ui.choice === String(index),
          }),
          h(
            "span",
            {},
            choice,
            ui.reveal && index === puzzle.answer
              ? h("span", { class: "badge" }, " Draft answer")
              : null,
          ),
        ),
      )),
      h("div", { class: "actions" }, h("button", { type: "submit", class: "button primary" }, "Check answer")),
      h(
        "button",
        {
          type: "button",
          class: "button quiet",
          onclick: () => {
            ui.reveal = true;
            ui.choice = String(puzzle.answer);
            ui.puzzleMsg = `Draft answer, for the museum to check: ${puzzle.choices[puzzle.answer]}.`;
            announce(ui.puzzleMsg);
            render();
          },
        },
        "Curator: show the draft answer",
      ),
    ),
    ui.puzzleMsg ? h("p", { class: "message", role: "status" }, ui.puzzleMsg) : null,
  );
}

function openStop(stop) {
  const solved = Boolean(state.solved[stop.id]);
  const person = villager();
  return h(
    "div",
    {},
    backLink("#/map", "Back to the map"),
    badges(null),
    h("h1", {}, stop.name),
    h("p", { class: "kicker" }, `${stop.where} · ${stop.catalogue}`),
    stop.care ? h("p", { class: "care" }, stop.care) : null,
    h(
      "figure",
      {},
      h("img", { src: stop.image, alt: stop.imageAlt, width: "640", height: "400" }),
      h("figcaption", {}, stop.imageCaption),
    ),
    h("h2", {}, "History ", h("span", { class: "badge" }, "Draft")),
    stop.paragraphs.map((paragraph) => h("p", {}, paragraph)),
    stop.inscriptions
      ? h(
          "section",
          {},
          h("h3", {}, stop.inscriptionsTitle),
          h(
            "ul",
            { class: "names" },
            stop.inscriptions.map((item) =>
              h("li", {}, h("strong", {}, item.name), h("span", {}, ` — ${item.detail}`)),
            ),
          ),
        )
      : null,
    stop.verse
      ? h("section", {}, h("h3", {}, stop.verseLabel), h("blockquote", { class: "verse" }, stop.verse))
      : null,
    h("p", {}, stop.gridNote),
    h("h2", {}, "360 view"),
    h(
      "div",
      { class: "panorama-empty" },
      h(
        "p",
        {},
        h("strong", {}, "Empty slot. "),
        "A 360 photograph of this place can be embedded here later. This prototype does not include a panorama, and it does not pretend to.",
      ),
    ),
    puzzleBlock(stop),
    solved
      ? h(
          "section",
          { class: "letter-panel" },
          h("p", { class: "badge" }, "Draft letter"),
          h("p", { class: "big-letter" }, stop.letter),
          h(
            "p",
            {},
            `This stop gives the letter ${stop.letter}. The three letters spell a word at the end.`,
          ),
          allSolved()
            ? person
              ? h("a", { class: "button primary", href: "#/end" }, "Read the ending")
              : h("a", { class: "button primary", href: "#/choose" }, "Choose a villager to open the ending")
            : h("a", { class: "button secondary", href: "#/map" }, "Back to the map"),
        )
      : null,
  );
}

function viewStop(id) {
  const stop = getStop(id);
  if (!stop) {
    return h(
      "div",
      {},
      h("h1", {}, "That stop is not in this prototype"),
      h("a", { class: "button primary", href: "#/map" }, "Back to the map"),
    );
  }
  if (!state.unlocked[stop.id]) return lockedStop(stop);
  return openStop(stop);
}

function viewEnd() {
  const person = villager();
  if (!allSolved()) {
    return h(
      "div",
      {},
      h("h1", {}, "The ending is not open yet"),
      h("p", {}, "It opens when all three letters have been collected."),
      h("a", { class: "button primary", href: "#/map" }, "Back to the map"),
    );
  }
  if (!person) {
    return h(
      "div",
      {},
      h("h1", {}, "Choose a villager"),
      h("p", {}, "The letters are collected. Choose whose story the ending should tell."),
      h("a", { class: "button primary", href: "#/choose" }, "Choose a villager"),
    );
  }
  if (!state.completedAt) {
    state.completedAt = new Date().toISOString();
    saveState();
  }
  const word = draftWord();
  const dateLabel = formatDate(state.completedAt);
  const shareText = `The Eyam Pass, a draft trail. I walked with the story of ${person.name}. The draft word was ${word}. History in this prototype has not been checked by the museum.`;
  const canvas = h("canvas", {
    class: "certificate-canvas",
    "aria-hidden": "true",
  });
  const pending = h("p", { id: "cert-pending" }, "Preparing the certificate image…");
  const shareNote = h("p", { id: "share-note", role: "status" }, ui.shareMsg || "");
  const downloadButton = h(
    "button",
    {
      type: "button",
      class: "button secondary",
      id: "download-certificate",
      disabled: true,
      onclick: () => downloadCertificate(),
    },
    "Download the image",
  );
  const shareButton = h(
    "button",
    {
      type: "button",
      class: "button primary",
      id: "share-certificate",
      disabled: true,
      onclick: () => shareCertificate(shareText),
    },
    "Share the certificate",
  );

  queueCertificate(canvas, pending, downloadButton, shareButton, {
    villagerName: person.name,
    fate: person.certificateFate,
    word,
    letters: stops.map((stop) => ({ letter: stop.letter, name: stop.shortName })),
    dateLabel,
  });

  return h(
    "div",
    {},
    backLink("#/map", "Back to the map"),
    h("p", { class: "kicker" }, "Three stops complete"),
    h("h1", {}, "The ending"),
    badges(person),
    h("p", {}, "You have been to the three stops in this draft trail."),
    h("h2", {}, "Fate ", h("span", { class: "badge" }, "Draft")),
    h("p", {}, person.fate),
    h("h2", {}, "The draft word"),
    letterRow(),
    h("p", { class: "word", "aria-label": `Draft word ${word.split("").join(" ")}` }, word),
    h(
      "p",
      {},
      `The letters are ${stops
        .map((stop) => `${stop.letter} from ${stop.name}`)
        .join(", ")}. In this draft they spell ${word}. A draft sense of that word is aid: help passed across the boundary, and the choice to keep the sickness from other villages. This wording is a proposal, not museum text.`,
    ),
    h(
      "p",
      {},
      "Only three stops are in this prototype. A full trail would add more letters, and a longer word.",
    ),
    h("h2", {}, "Certificate of survival"),
    h(
      "p",
      {},
      "The certificate uses that title for the village's choice to keep the sickness inside its own boundary. It states this person's fate separately, and it does not claim that every person survived.",
    ),
    h(
      "figure",
      {},
      canvas,
      h(
        "figcaption",
        { class: "sr-only" },
        `Certificate of survival for ${person.name}. ${person.certificateFate} Draft word ${word}. Completed on ${dateLabel}.`,
      ),
    ),
    pending,
    h(
      "div",
      { class: "actions" },
      "share" in navigator ? shareButton : null,
      downloadButton,
    ),
    shareNote,
    h(
      "p",
      {},
      "Sharing uses the phone's share sheet, where the browser allows it. Downloading saves a PNG in any browser.",
    ),
    resetBox(),
  );
}

function queueCertificate(canvas, pending, downloadButton, shareButton, model) {
  const token = ++drawToken;
  certificateBlob = null;
  drawCertificate(canvas, model)
    .then(
      () =>
        new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        }),
    )
    .then((blob) => {
      if (token !== drawToken) return;
      certificateBlob = blob;
      pending.textContent = blob ? "" : "The image could not be prepared. The wording above is the certificate text.";
      downloadButton.disabled = !blob;
      shareButton.disabled = !blob;
    })
    .catch(() => {
      if (token !== drawToken) return;
      pending.textContent = "The image could not be prepared. The wording above is the certificate text.";
    });
}

function downloadCertificate() {
  if (!certificateBlob) return;
  const link = h("a", {
    href: URL.createObjectURL(certificateBlob),
    download: "eyam-pass-certificate.png",
  });
  document.body.append(link);
  link.click();
  link.remove();
}

async function shareCertificate(text) {
  if (!certificateBlob) return;
  const file = new File([certificateBlob], "eyam-pass-certificate.png", { type: "image/png" });
  const note = document.querySelector("#share-note");
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "The Eyam Pass",
        text,
        files: [file],
      });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: "The Eyam Pass", text, url: location.href });
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
  }
  if (note) note.textContent = "Sharing did not complete. Download the image instead.";
  announce("Sharing did not complete. Download the image instead.");
}

function viewSources() {
  const word = draftWord();
  return h(
    "div",
    {},
    backLink("#/map", "Back to the map"),
    h("h1", {}, "Sources and coordinates"),
    h(
      "p",
      {},
      "These are the public sources used for this draft, as consulted on 21 November 2026. They do not all agree. The museum's own reading should replace them. Nothing on this page has been checked by the museum.",
    ),
    h("h2", {}, "Unlock rule"),
    h(
      "p",
      {},
      `A stop unlocks when the phone's reported point is within ${RADIUS_M} metres and the stated accuracy is ${MAX_ACCURACY_M} metres or better. Grid references were converted from British National Grid (EPSG:27700) to WGS84 (EPSG:4326).`,
    ),
    h(
      "ul",
      { class: "plain-list" },
      stops.map((stop) =>
        h(
          "li",
          {},
          h("strong", {}, stop.name),
          ` — ${stop.grid.label}, ${stop.wgs84.lat.toFixed(6)}, ${stop.wgs84.lon.toFixed(6)}. ${stop.gridNote}`,
        ),
      ),
    ),
    h("h2", {}, "Sources"),
    sources.map((source) =>
      h(
        "article",
        { class: "source-block" },
        h("h3", {}, source.title),
        h(
          "p",
          { class: "source-url" },
          h("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.url),
        ),
        h("p", {}, source.used),
      ),
    ),
    h("h2", {}, "Left out on purpose"),
    h(
      "ul",
      { class: "plain-list" },
      leftOut.map((item) => h("li", {}, item)),
    ),
    h("h2", {}, "Draft letters and the word"),
    h(
      "p",
      {},
      `In this prototype the letters spell ${word}. ${stops
        .map((stop) => `${stop.name}: ${stop.letter}, code word ${stop.code}`)
        .join(". ")}.`,
    ),
    h("h2", {}, "Draft puzzle answers"),
    stops.map((stop) =>
      h(
        "article",
        { class: "source-block" },
        h("h3", {}, stop.name),
        h("p", {}, `Kids' version: ${stop.kids.choices[stop.kids.answer]}`),
        h("p", {}, `Adult version: ${stop.adult.choices[stop.adult.answer]}`),
      ),
    ),
    h("h2", {}, "Draft fates"),
    h("p", {}, "These are also shown at the end of the trail."),
    villagers.map((person) =>
      h(
        "article",
        { class: "source-block" },
        h("h3", {}, person.name, person.placeholder ? " (placeholder)" : ""),
        h("p", {}, person.fate),
      ),
    ),
  );
}

function viewUnknown() {
  return h(
    "div",
    {},
    h("h1", {}, "That page is not in this prototype"),
    h("a", { class: "button primary", href: "#/start" }, "Back to the start"),
  );
}

function render() {
  const route = parseRoute();
  const key = `${route.name}/${route.id || ""}`;
  if (ui.key !== key) ui = blankUi(key);

  let view;
  let title = "The Eyam Pass";
  if (route.name === "start") {
    view = viewStart();
    title = "The Eyam Pass";
  } else if (route.name === "choose") {
    view = viewChoose();
    title = "Choose a villager · The Eyam Pass";
  } else if (route.name === "intro") {
    view = viewIntro();
    title = "Your villager · The Eyam Pass";
  } else if (route.name === "map") {
    view = viewMap();
    title = "Map · The Eyam Pass";
  } else if (route.name === "codes") {
    view = viewCodes();
    title = "Code words · The Eyam Pass";
  } else if (route.name === "stop") {
    view = viewStop(route.id);
    const stop = getStop(route.id);
    title = stop ? `${stop.name} · The Eyam Pass` : "The Eyam Pass";
  } else if (route.name === "end") {
    view = viewEnd();
    title = "Ending · The Eyam Pass";
  } else if (route.name === "sources") {
    view = viewSources();
    title = "Sources · The Eyam Pass";
  } else {
    view = viewUnknown();
  }

  document.title = title;
  main.replaceChildren(view);
  if (lastRouteKey !== key) {
    lastRouteKey = key;
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

function renderOfflineStatus() {
  if (offlineUnsupported) {
    offlineStatus.textContent =
      "This browser cannot save the trail for offline use. It still works while you have a signal.";
    return;
  }
  if (offlineFailed) {
    offlineStatus.textContent =
      "The trail could not be saved for offline use. It still works while you have a signal.";
    return;
  }
  if (!navigator.onLine && offlineSaved) {
    offlineStatus.textContent = "You are offline. This trail is saved on this device.";
    return;
  }
  if (!navigator.onLine) {
    offlineStatus.textContent = "You are offline, and this trail has not been saved yet.";
    return;
  }
  if (offlineSaved) {
    offlineStatus.textContent = "Saved on this device, for when the signal drops.";
    return;
  }
  offlineStatus.textContent = "Saving this trail onto this device…";
}

async function setupOffline() {
  window.addEventListener("online", renderOfflineStatus);
  window.addEventListener("offline", renderOfflineStatus);
  if (!("serviceWorker" in navigator)) {
    offlineUnsupported = true;
    renderOfflineStatus();
    return;
  }
  if (!window.isSecureContext) {
    offlineFailed = true;
    offlineStatus.textContent =
      "Offline saving needs a secure page (https, or localhost). Opening the file directly will not save it.";
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    const watch = (worker) => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") {
          offlineSaved = true;
          renderOfflineStatus();
        }
      });
    };
    watch(registration.installing);
    watch(registration.waiting);
    watch(registration.active);
    await navigator.serviceWorker.ready;
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    if (keys.length >= 8) offlineSaved = true;
    renderOfflineStatus();
  } catch (error) {
    offlineFailed = true;
    renderOfflineStatus();
  }
}

window.addEventListener("hashchange", render);
render();
setupOffline();
