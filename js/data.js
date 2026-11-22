/**
 * Draft content for The Eyam Pass.
 * History, fates and puzzle answers are for the museum to check.
 * Nothing in this file should be read as an agreed museum text.
 */

export const STORAGE_KEY = "eyam-pass-v1";
export const CACHE_NAME = "eyam-pass-v1";

export const sources = [
  {
    id: "he-well",
    title: "Historic England list entry 1347936, Mompesson's Well",
    url: "https://historicengland.org.uk/listing/the-list/list-entry/1347936",
    used: "Grade II listing, first listed 12 July 1967. Describes a 17th-century gritstone wellhead on Edge Road: a trough, a western slab with humped ribs, and later iron railings. Says it is listed for its association with the Eyam plague of 1666. National Grid reference SK 22280 77192.",
  },
  {
    id: "he-riley",
    title: "Historic England list entry 1109993, Riley Graves and Graveyard",
    url: "https://historicengland.org.uk/listing/the-list/list-entry/1109993",
    used: "Grade II listing, first listed 12 October 1984. Describes six upright gravestones and a table tomb on Riley Lane, and transcribes the inscriptions and the verse used on the Riley card. National Grid reference SK 22855 76384. Calls the tomb a memorial to the whole Hancocke family.",
  },
  {
    id: "her-stone",
    title: "Derbyshire Historic Environment Record, MDR6725, Plague Stone",
    url: "https://her.derbyshire.gov.uk/monument/mdr6725",
    used: "Describes a stone with holes, used, on its account, for money left in vinegar during the plague of 1665–66, in return for food and clothing from Stoney Middleton. Location table centred on SK 2264 7580. The same record also quotes an older grid, SK 2284 7564, which is not the pin used here.",
  },
  {
    id: "geograph-stone",
    title: "Geograph, David Smith, photograph of the boundary stone",
    url: "https://www.geograph.org.uk/photo/5560537",
    used: "Subject location given as OSGB36 SK 2264 7583, about 30 metres north of the HER table. Used only as a published pin for the boulder. The photograph itself is not copied into this prototype.",
  },
  {
    id: "nt-riley",
    title: "National Trust Heritage Records, MNA112094, Riley Graves",
    url: "https://heritagerecords.nationaltrust.org.uk/HBSMR/MonRecord.aspx?uid=MNA112094",
    used: "Says the enclosure holds seven Hancock graves, that the table tomb is John Hancock senior's, and that the family died within seven days of each other in August 1666. Those points do not all match the Historic England transcription. The card leaves the disagreement in view. Grid SK 2285 7638.",
  },
  {
    id: "wellcome",
    title: "Wellcome Collection, “Wool, fleas, plague”",
    url: "https://wellcomecollection.org/stories/wool--fleas--plague",
    used: "A published account of the outbreak. Dates George Viccars's death to 7 September 1665 and Catherine Mompesson's death to 25 August 1666. Describes quarantine, outdoor worship, supplies at the boundary, and money left in the well or in vinegar. Used as an account, not as a record this prototype has checked.",
  },
  {
    id: "eyam-village",
    title: "Eyam village website, plague page",
    url: "https://www.eyamvillage.org.uk/plague",
    used: "A community page. Names George Viccars as assistant to the tailor Alexander Hadfield, and William Mompesson and Thomas Stanley as leaders of the quarantine. Gives one death figure, about 260 from a population of about 800. Other pages give other figures, so none is adopted here. A genetic claim and a nursery-rhyme claim on that page are not used.",
  },
  {
    id: "wiki-mompesson",
    title: "Wikipedia, William Mompesson",
    url: "https://en.wikipedia.org/wiki/William_Mompesson",
    used: "Gives his death as 7 March 1709, his arrival as rector in 1664, and Catherine as his wife. Says he and Thomas Stanley are credited with isolating the village, and that he survived. Also notes that historians have questioned how complete the quarantine was. Consulted 21 November 2026.",
  },
  {
    id: "wiki-stanley",
    title: "Wikipedia, Thomas Stanley (puritan)",
    url: "https://en.wikipedia.org/wiki/Thomas_Stanley_(puritan)",
    used: "Gives his death as 26 August 1670 at Eyam, and says he acted with William Mompesson during the outbreak. The day has not been checked against a memorial or a register for this prototype.",
  },
  {
    id: "wiki-eyam",
    title: "Wikipedia, Eyam",
    url: "https://en.wikipedia.org/wiki/Eyam",
    used: "Consulted for the spread of published figures. The article reports disagreement about population and deaths, including a church record of 273 victims. No figure from it is used as a fact in the trail. Consulted 21 November 2026.",
  },
  {
    id: "whittles",
    title: "Whittles and Didelot, Proceedings of the Royal Society B, 2016",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4874723/",
    used: "Further reading only. An epidemiological paper on the 1665–66 outbreak. It notes both the quarantine story and revisionist questions. No puzzle answer depends on it.",
  },
];

export const leftOut = [
  "Any single death toll or population figure. Published numbers do not agree, so none is taught as the answer.",
  "How the disease spread. Cloth from London is mentioned only as a published account of George Viccars, not as a proved mechanism.",
  "The nursery rhyme Ring a ring o' roses, and any genetic or chromosomal claim about survivors.",
  "The published claim that the rector's children were sent away. It sits inside a dispute about the quarantine, and it is not used in a story card.",
  "A named person said to have survived in the Hancock household. This prototype has not verified one. Elizabeth Hancocke on a stone is left as a name on a stone.",
  "A choice between the versions of George Viccars, tailor or assistant. The disagreement is stated, not settled.",
  "A translation of the Latin on the Riley table tomb.",
  "A 360 tour, photographs of the sites, access rights, paths and opening times.",
];

export const stops = [
  {
    id: "well",
    name: "Mompesson's Well",
    shortName: "Well",
    letter: "A",
    code: "well",
    image: "./assets/well.svg",
    imageAlt:
      "Placeholder drawing of a stone wellhead with a trough, a slab and railings. Not a photograph.",
    imageCaption:
      "Placeholder drawing. Not a photograph, and not a measured survey of the well.",
    where: "Edge Road, Eyam",
    catalogue: "Historic England 1347936",
    grid: { easting: 422280, northing: 377192, label: "SK 22280 77192" },
    wgs84: { lat: 53.29122706, lon: -1.66722601 },
    gridNote:
      "The pin is the grid reference in the Historic England list entry, converted from British National Grid to WGS84.",
    sourceIds: ["he-well", "wellcome"],
    paragraphs: [
      "Mompesson's Well is a wellhead on Edge Road. Historic England lists it at Grade II, list entry 1347936, first listed on 12 July 1967. The entry describes a 17th-century gritstone wellhead: a stone trough, covered on the west by a slab crossed by humped ribs, with 20th-century iron railings. It says the well is listed for its historical association with the Eyam plague of 1666.",
      "The outbreak is generally described as running through 1665 and 1666. The list entry names 1666. Both wordings are left here for the museum to judge.",
      "Published stories say this was a place where people from outside left food, and people from Eyam left payment in the water. This prototype has not checked a document written in 1665 or 1666 for that use, so it is given as a published tradition, not as a confirmed fact.",
    ],
    kids: {
      prompt: "According to this draft card, which century does Historic England give for the wellhead?",
      choices: ["The 15th century", "The 16th century", "The 17th century"],
      answer: 2,
    },
    adult: {
      prompt: "According to this draft card, which reason does the list entry give for listing the well?",
      choices: [
        "Its link with a medieval market",
        "Its link with the Eyam plague of 1666",
        "Its link with lead mining",
      ],
      answer: 1,
    },
  },
  {
    id: "stone",
    name: "Boundary Stone",
    shortName: "Boundary",
    letter: "I",
    code: "boundary",
    image: "./assets/stone.svg",
    imageAlt:
      "Placeholder drawing of a boulder with six holes on top. Not a photograph.",
    imageCaption:
      "Placeholder drawing of a boulder with six holes, following the Derbyshire record's description. Not a photograph.",
    where: "Old boundary with Stoney Middleton",
    catalogue: "Derbyshire HER MDR6725",
    grid: { easting: 422645, northing: 375820, label: "SK 22645 75820" },
    wgs84: { lat: 53.27887935, lon: -1.66184784 },
    gridNote:
      "Derived pin, not a single published grid reference. It is the centre of the box covering the HER table SK 2264 7580 and the Geograph pin SK 2264 7583, so both sit inside the 30 metre radius. Easting 422645, northing 375820. The older grid SK 2284 7564 in the same record is not used.",
    sourceIds: ["her-stone", "geograph-stone", "wellcome", "eyam-village"],
    paragraphs: [
      "This boulder stands on the old boundary between Eyam and Stoney Middleton. The Derbyshire Historic Environment Record, monument MDR6725, describes it as a plague stone of 1665–66, with circular holes. It says people from Eyam left money in the holes, in vinegar, in return for food and clothing left by people from Stoney Middleton.",
      "That record is drawn from later notes and indexes. This prototype has not seen a document written in 1666 that describes the stone. Please read the vinegar, and the exchange itself, as what the record says, not as a fact proved here.",
      "The same record gives two grid references that are not the same place. Its location table is centred on SK 2264 7580. An older note inside the record says SK 2284 7564. A Geograph photograph of the boulder is pinned at SK 2264 7583. The pin in this prototype sits between the location table and the photograph, so that both of those published positions fall inside 30 metres. It is not a surveyed coordinate. The older grid is not used.",
      "Published accounts, including the Wellcome Collection, say the Earl of Devonshire helped with supplies during the quarantine. This card does not set out the terms of that help.",
    ],
    kids: {
      prompt:
        "According to this draft card, what does the Derbyshire record say was put in the holes with the money?",
      choices: ["Vinegar", "Milk", "Ale"],
      answer: 0,
    },
    adult: {
      prompt:
        "According to this draft card, which neighbouring place does the Derbyshire record name as leaving food and clothing?",
      choices: ["Bakewell", "Stoney Middleton", "Tideswell"],
      answer: 1,
    },
  },
  {
    id: "graves",
    name: "Riley Graves",
    shortName: "Riley",
    letter: "D",
    code: "riley",
    image: "./assets/graves.svg",
    imageAlt:
      "Placeholder drawing of a walled enclosure with six upright stones and a table tomb. Not a photograph, and not a plan of the burial ground.",
    imageCaption:
      "Placeholder drawing from the list entry's description: six upright stones and a table tomb inside a wall. Not a photograph, and not a plan.",
    where: "Riley Lane, east of the village",
    catalogue: "Historic England 1109993",
    care: "This is a family burial ground, in the care of the National Trust. Please treat it quietly. This prototype does not give opening rules or a right of access. Ask the museum before a visit.",
    grid: { easting: 422855, northing: 376384, label: "SK 22855 76384" },
    wgs84: { lat: 53.28393994, lon: -1.65865813 },
    gridNote:
      "The pin is the grid reference in the Historic England list entry, converted from British National Grid to WGS84. The National Trust record gives a grid a few metres away, SK 2285 7638.",
    sourceIds: ["he-riley", "nt-riley"],
    paragraphs: [
      "Riley Graves, on Riley Lane, is a small burial ground in a walled enclosure. Historic England lists it at Grade II, list entry 1109993, first listed on 12 October 1984. The entry describes a gritstone wall enclosing six upright gravestones and a table tomb, dated 1666.",
      "The table tomb carries a Latin line and an English verse, transcribed below as the list entry gives them, including the spelling. The entry calls the tomb a memorial to the whole Hancocke family, who died of the plague. This prototype does not translate the Latin.",
      "The National Trust record of the same ground says there are seven graves, that the table tomb is John Hancock senior's, and that the family died within seven days of each other in August 1666. The dates transcribed by Historic England run from 3 to 17 August. These two public records do not agree in every detail. This card does not settle that. It does not name a surviving relative, because none has been verified here.",
      "Elizabeth Hancocke, named on a stone, is not identified any further. The spelling of each name is the list entry's transcription.",
    ],
    inscriptionsTitle: "Upright stones, as transcribed by Historic England",
    inscriptions: [
      { name: "John Hancocke, junior", detail: "Buried 3 August 1666" },
      { name: "Elizabeth Hancocke", detail: "Buried 3 August 1666" },
      { name: "Oner Hancocke", detail: "Buried 7 August 1666" },
      { name: "Alice Hancocke", detail: "Buried 9 August 1666" },
      { name: "Ann Hancocke", detail: "Buried 10 August 1666" },
      { name: "William Hancocke", detail: "Buried 17 August 1666" },
    ],
    verseLabel: "Table tomb, as transcribed",
    verse:
      "HORAM,NESCITIS, VIGILATE, ORATE. REMEMBER MAN, AS THOU GOEST BY, AS THOU ART NOW, EVEN ONCE WAS I, AS I DOE NOW, SO MUST THOU LYE. REMEMBER MAN THAN THOU MUST DIE.",
    kids: {
      prompt:
        "According to this draft card, the burial dates transcribed from these stones all fall in which month and year?",
      choices: ["July 1665", "August 1666", "August 1665"],
      answer: 1,
    },
    adult: {
      prompt: "Which of these matches what this draft card says about the dates?",
      choices: [
        "Both public records say everyone died on 3 August.",
        "The transcribed dates run from 3 to 17 August 1666, while the National Trust summary says seven days.",
        "Neither record gives any date.",
      ],
      answer: 1,
    },
  },
];

export const villagers = [
  {
    id: "catherine-mompesson",
    name: "Catherine Mompesson",
    role: "Wife of the rector",
    placeholder: false,
    sourceIds: ["wellcome", "wiki-mompesson"],
    story: [
      "Catherine Mompesson was married to William Mompesson, rector of Eyam. Published accounts place her in the village during the outbreak of 1665–66.",
    ],
    fate: "Catherine Mompesson died on 25 August 1666, according to an account published by the Wellcome Collection. She was the rector's wife. Draft, for the museum to check.",
    certificateFate:
      "Died on 25 August 1666, according to the Wellcome Collection. Draft, for the museum to check.",
  },
  {
    id: "william-mompesson",
    name: "William Mompesson",
    role: "Rector of Eyam",
    placeholder: false,
    sourceIds: ["wiki-mompesson", "eyam-village", "wellcome"],
    story: [
      "William Mompesson came to Eyam as rector in 1664, in the published accounts. With Thomas Stanley, the ejected Puritan minister, he is credited with persuading the village to keep to its own boundary, so the outbreak would not be carried to neighbouring places.",
      "Historians still debate how complete that closure was. Draft, for the museum to check.",
    ],
    fate: "William Mompesson survived the outbreak. His wife Catherine died in it. Wikipedia, citing a biographical dictionary, gives his own death as 7 March 1709. Draft, for the museum to check.",
    certificateFate:
      "Survived the outbreak. Wikipedia gives his death as 7 March 1709. Draft, for the museum to check.",
  },
  {
    id: "george-viccars",
    name: "George Viccars",
    role: "Named in the first days of the outbreak",
    placeholder: false,
    sourceIds: ["wellcome", "eyam-village"],
    story: [
      "Several published accounts name George Viccars among the first people linked with the outbreak in Eyam. They do not agree on who he was. Some call him the village tailor. Others, including the Eyam village website and the Wellcome Collection, call him a tailor's assistant. One account names the tailor as Alexander Hadfield.",
      "This prototype does not choose between those versions. Draft, for the museum to check.",
    ],
    fate: "George Viccars died in the outbreak. The Wellcome Collection dates his death to 7 September 1665, and links it to a parcel of cloth from London. Published accounts do not agree on whether he was the tailor or the tailor's assistant. Draft, for the museum to check.",
    certificateFate:
      "Died in the outbreak. The Wellcome Collection dates his death to 7 September 1665. Draft, for the museum to check.",
  },
  {
    id: "thomas-stanley",
    name: "Thomas Stanley",
    role: "Ejected minister",
    placeholder: false,
    sourceIds: ["wiki-stanley", "wiki-mompesson", "eyam-village"],
    story: [
      "Thomas Stanley had been rector of Eyam. He was ejected after the Act of Uniformity and, in the published accounts, served the village alongside William Mompesson when plague arrived. The two men are credited together with the decision to keep the village closed.",
    ],
    fate: "Thomas Stanley survived the outbreak. Wikipedia gives his death as 26 August 1670, at Eyam. This prototype has not checked a memorial or a register, so the day is not treated as confirmed. Draft, for the museum to check.",
    certificateFate:
      "Survived the outbreak. Wikipedia gives his death as 26 August 1670. The day is not confirmed here. Draft, for the museum to check.",
  },
  {
    id: "placeholder",
    name: "Placeholder villager",
    role: "Not a historical person",
    placeholder: true,
    sourceIds: [],
    story: [
      "This card is not a real resident of Eyam. No name, date, family or fate has been invented for it. It shows where a checked story will go once the museum has agreed the facts.",
      "Choosing it still lets you walk the three stops, collect the letters, and open the ending.",
    ],
    fate: "There is no fate to tell. This was a placeholder card, not a person who lived in Eyam.",
    certificateFate: "Not a historical person. No fate is given.",
  },
];

export function draftWord() {
  return stops.map((stop) => stop.letter).join("");
}

export function getStop(id) {
  return stops.find((stop) => stop.id === id) || null;
}

export function getVillager(id) {
  return villagers.find((villager) => villager.id === id) || null;
}

export function sourceById(id) {
  return sources.find((source) => source.id === id) || null;
}
