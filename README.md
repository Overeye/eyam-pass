# The Eyam Pass

A personal, non-commercial prototype by Jon Rowland, made to show Eyam Museum. It is a mobile-first trail of three places from the plague year of 1665–66: Mompesson's Well, the Boundary Stone and the Riley Graves.

It is not an official museum publication. **History, fates and puzzle answers are drafts for the museum to check.** They are marked as drafts in the app. Where a detail is uncertain, the card says so. One villager card is a labelled placeholder, not a real person.

There is no account, no server and no tracking. Progress stays in this browser only. After the first visit, the trail is saved on the device so it can be opened again when the signal in the village is poor.

## Play it indoors

You do not need to walk. On the start screen or the map, tap **Can't walk the trail?** The three code words are shown there in full, each with an unlock button.

| Stop | Code word | Letter |
| --- | --- | --- |
| Mompesson's Well | `well` | A |
| Boundary Stone | `boundary` | I |
| Riley Graves | `riley` | D |

Capital letters do not matter. On a locked stop the code word is also shown large, with a button to unlock it.

**Draft word: AID**

Three letters are enough for this example. The app says that more stops, and a longer word, would be added later. A draft sense of AID, also marked as a proposal, is the help passed across the boundary. The museum can change the letters.

### Draft puzzle answers

Either version of a puzzle gives the letter. On each puzzle, **Curator: show the draft answer** reveals it.

| Stop | Kids' version | Adult version |
| --- | --- | --- |
| Mompesson's Well | The 17th century | Its link with the Eyam plague of 1666 |
| Boundary Stone | Vinegar | Stoney Middleton |
| Riley Graves | August 1666 | The transcribed dates run from 3 to 17 August 1666, while the National Trust summary says seven days. |

### A path through the prototype

1. Choose a villager, or draw one at random. The placeholder card is not in the random draw.
2. Open the map.
3. Tap **Can't walk the trail?** and unlock each stop, or type the code word on the stop itself.
4. Read the draft history. The 360 area is an empty slot.
5. Answer the kids' or the adult puzzle. Take the letter.
6. After all three letters, open the ending for that villager's draft fate and the certificate.
7. Share it, or download the PNG. Sharing uses the phone's share sheet when the browser allows a file. The download works without that.

**Start again**, on the map and the ending, clears the villager, the stops and the letters on that device.

## Host the files

There is no build step. The site is the files in this folder. Upload them as they are.

To put the trail at `https://eyam-museum.org.uk/play/`, copy the files into the server's `play` directory so that these addresses exist:

- `https://eyam-museum.org.uk/play/`
- `https://eyam-museum.org.uk/play/index.html`
- `https://eyam-museum.org.uk/play/sw.js`

Every link in the app is relative. It does not assume it lives at the root of the domain. The screens use the address hash (`#/map`, `#/stop/well`), so the host does not need to rewrite paths.

Serve the folder over **HTTPS**. A phone will not share its location with a page on plain `http`, except for `localhost`. Code words work either way. Opening the folder as a file (`file://`) will not save the trail for offline use, and it will not unlock stops by GPS.

Do not set a long cache on `sw.js`. A few minutes, or no cache, is safer, so a later copy of the trail can replace the saved one. The other files can be cached. The service worker stores them on the first visit.

`package.json` is only there so the checks below can run. It installs nothing. You do not need it on the public server. You can leave `test/` and this README unuploaded; uploading them does not change the trail.

### Run it on this computer

From this folder:

```bash
python3 -m http.server 8741
```

Then open `http://127.0.0.1:8741/`.

To try the subdirectory, copy the files into a `play` folder and serve the parent directory. Open `http://127.0.0.1:8741/play/`.

## GPS

Unlock radius: **30 metres**.

The phone must also say the reading is precise to **40 metres or better**. A vague fix will not unlock a stop, even if the dot looks close. The page then offers the code word.

Coordinates were converted from British National Grid (EPSG:27700) to WGS84 (EPSG:4326) with PROJ.

| Stop | Grid used | WGS84 | How it was chosen |
| --- | --- | --- | --- |
| Mompesson's Well | SK 22280 77192 | 53.291227, -1.667226 | Historic England list entry 1347936, listing NGR. |
| Riley Graves | SK 22855 76384 | 53.283940, -1.658658 | Historic England list entry 1109993, listing NGR. The National Trust record is a few metres away, at SK 2285 7638. |
| Boundary Stone | SK 22645 75820 | 53.278879, -1.661848 | Not one published point. See below. |

The Derbyshire Historic Environment Record (MDR6725) centres the boundary stone on **SK 2264 7580**. The same record quotes an older grid, **SK 2284 7564**, which is a different place and is not used. A Geograph photograph of the boulder is pinned at **SK 2264 7583**. Those two 10 metre squares are about 30 metres apart. The pin here is the centre of the box that covers both squares (easting 422645, northing 375820), so a person standing at either published position is inside the 30 metre radius. It is not a surveyed coordinate. The museum should move it once someone has stood at the stone with a GPS.

### Sources

Consulted 21 November 2026. The same notes are on the **Sources and coordinates** screen in the app.

- Historic England, [Mompesson's Well, list entry 1347936](https://historicengland.org.uk/listing/the-list/list-entry/1347936)
- Historic England, [Riley Graves, list entry 1109993](https://historicengland.org.uk/listing/the-list/list-entry/1109993)
- Derbyshire Historic Environment Record, [MDR6725, Plague Stone](https://her.derbyshire.gov.uk/monument/mdr6725)
- Geograph, [David Smith, the boundary stone](https://www.geograph.org.uk/photo/5560537) (location only; the photograph is not copied)
- National Trust Heritage Records, [MNA112094, Riley Graves](https://heritagerecords.nationaltrust.org.uk/HBSMR/MonRecord.aspx?uid=MNA112094)
- Wellcome Collection, [Wool, fleas, plague](https://wellcomecollection.org/stories/wool--fleas--plague)
- [Eyam village website, plague page](https://www.eyamvillage.org.uk/plague)
- [Wikipedia, William Mompesson](https://en.wikipedia.org/wiki/William_Mompesson)
- [Wikipedia, Thomas Stanley (puritan)](https://en.wikipedia.org/wiki/Thomas_Stanley_(puritan))
- [Wikipedia, Eyam](https://en.wikipedia.org/wiki/Eyam)
- Whittles and Didelot, [Proceedings of the Royal Society B, 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4874723/) (further reading only)

Published death and population figures do not agree, so the trail does not teach one. The cards also leave two disagreements in view: whether George Viccars was the tailor or the tailor's assistant, and the Riley dates (Historic England's transcription runs from 3 to 17 August 1666; the National Trust summary says seven days).

Left out on purpose: a single death toll, a mechanism for how plague spread, the nursery rhyme, genetic claims, the story that the rector's children were sent away, a named Hancock survivor, a translation of the Latin on the table tomb, and any 360 tour or site photograph.

### Villagers

| Card | In the prototype |
| --- | --- |
| Catherine Mompesson | Wife of the rector. Draft fate uses the Wellcome Collection's date, 25 August 1666. |
| William Mompesson | Rector. Draft fate: he survived; Wikipedia gives his death as 7 March 1709. |
| George Viccars | Named in the first days. Draft fate uses the Wellcome date, 7 September 1665, and states that the accounts disagree about his role. |
| Thomas Stanley | Ejected minister. Draft fate: he survived; Wikipedia gives 26 August 1670, and the day is not treated as confirmed. |
| Placeholder villager | **Not a real person.** No facts are invented. Not included in the random draw. |

Fates are shown at the end of the trail, and again on the sources screen so they can be checked without finishing the puzzles.

## Offline

The first visit, with a signal, stores the pages, script, pictures and font in a service worker (`sw.js`). Later visits open from that copy if the network fails. The line under the title says when the copy is saved.

This needs a normal web address (`https://` or `localhost`). It does not work from `file://`.

## Known limitations

- Three example stops only. The word AID is a draft fragment.
- History, fates and answers are drafts. They are not museum text.
- The pictures are drawings, not photographs. Each stop has an empty 360 slot and no panorama.
- The boundary pin is a compromise between two published grids, not a survey.
- GPS needs HTTPS, permission, and a reading precise to 40 metres or better, inside 30 metres.
- The app does not give paths, opening times or a right of access. Riley Graves are a burial ground in the care of the National Trust.
- Progress is stored only in `localStorage` on that browser. There is no account and no sync.
- The certificate is a keepsake for this prototype. Share works when the browser supports the Web Share API; download is always there.
- The page asks search engines not to index it (`noindex`), because the history is unchecked.
- Source Serif 4 is bundled for offline type. It is under the SIL Open Font License. See `assets/fonts/OFL-source-serif-4.txt`. The reserved name Source is Adobe's.

## Checks

No install is required to play. To re-run the checks that were used while building this:

```bash
node test/geo.test.mjs
```

The browser walk-through needs Chrome and `puppeteer-core`, which are not part of the site:

```bash
npm install --no-save puppeteer-core
node test/walkthrough.mjs
```
