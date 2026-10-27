# unidex learn

Coding courses at [learn.unidex.shop](https://learn.unidex.shop). Each lesson explains one idea with an example, then you write the code yourself and run it in the browser. There are three courses:

- **Make your own unidex app.** Build an app in Lua from nothing, running it on a virtual unidex in the page, then put it on your own unidex.
- **Make your own unidex game.** Build a one-button game the same way, and play it in Games.
- **C++ for beginners.**

It's plain HTML, CSS and JavaScript, with no build step and nothing to install.

- **Apps and games** run on the unidex firmware compiled for the browser, loaded from [tools.unidex.shop/emu/](https://tools.unidex.shop/emu/versions.json) by `device.js`: the `latest` build, or the one a course names with `"emu"` in its `course.json`. `vendor/` holds the tools site's emulator, store and USB code. Keep it in step with [site/](https://github.com/Forrest404/unidex/tree/main/site). `unidex-emu.js` adds games to it: they open from Games instead of Apps.
- **C++** is compiled and run by [Compiler Explorer](https://godbolt.org), or [Wandbox](https://wandbox.org) when that's busy ([PRIVACY.md](PRIVACY.md)).

## Run it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Tests

You need Node 22 or newer, Chrome, and the internet, since runs go to the real compilers.

```sh
node --test --test-concurrency=1 --test-timeout=180000 'tests/*.test.mjs'
```

- `tests/lessons.test.mjs` checks every lesson. The solution must pass its tests, the starter must build but not pass, and every example must run and print what it says. Use `LESSON=05 node --test tests/lessons.test.mjs` to check just one.
- `tests/pages.test.mjs` drives the pages in headless Chrome. Set `CHROME` if Chrome isn't in the usual Mac place, and `SHOTS=some/folder` to save screenshots.
- `tests/apps.test.mjs` and `tests/app-lessons.test.mjs` run the app and game courses on the virtual unidex (`COURSE=games` for one course). Game lessons are skipped there while the emulator build the course uses doesn't have games (API 4).
- `tests/game-lessons.test.mjs` plays every game lesson on a model of the Games app (`tests/game-model.lua`), without a browser. It needs Lua 5.4 or newer (`LUA=/path/to/lua` if it isn't `lua5.4` or `lua`).

The same tests run on every push before the site is published (`.github/workflows/pages.yml`).

## Writing a lesson

A lesson is a Markdown file in `courses/<course>/`, listed in that course's `course.json`. Besides headings, text, lists, `code` and links, it uses these blocks:

| Block | What it's for |
| --- | --- |
| ` ```cpp ` | An example. It's shown with a Run button. |
| ` ```input ` | Straight after an example: what the example reads. |
| ` ```output ` | Straight after an example: what it prints. The tests check that it really does. |
| ` ```text ` | Shown as it is. |
| ` ```starter ` | The code the editor starts with. |
| ` ```solution ` | One right answer, shown when asked for. |
| ` ```test ` | An `input:` line (optional) and an `output:` line, each followed by the text. Check runs the learner's code with each test. |

Every lesson needs a `## Your turn` section, a starter, a solution and at least one test. `courses/cpp/05-input.md` uses all of them.

App lessons (a course with `"runner": "unidex"`) use ` ```lua ` examples, ` ```starter app.json ` and ` ```solution app.json ` blocks when a lesson changes `app.json` (otherwise the course's `appJson` is used), and ` ```check ` blocks in place of tests. Each check starts the app afresh on the virtual unidex, then follows its steps, one per line:

| Step | What it does |
| --- | --- |
| `press: b b B` | Presses buttons. A capital letter means hold. |
| `reopen` | Leaves the app and opens it again, to test saving. |
| `shows: text` / `hides: text` | Checks what the screen shows. `{day}`, `{month}` and `{year}` are today's. |
| `fills: 3` / `rects: 5` | How many boxes were drawn with `unidex.fill` or `unidex.rect`. |
| `has: icon` | `app.json` has that field. |

Check reads the screen through a one-line helper put in front of `main.lua` (`check.js`), so line numbers stay right. `tests/app-lessons.test.mjs` checks every app lesson (`LESSON=05` for one).

### Game lessons

A course whose `appJson` has `"type": "game"` makes games. Run and Check install the game and open it from Games, the way a person would (`unidex-emu.js`): Home, Games, A until it's highlighted, then B starts a round. Its examples run as games too. Games need firmware with API level 4, so `courses/games/course.json` has `"emu": "next"` until that's released.

Check starts each round with a seed (`X SEED`) and plays it one frame at a time (`X MANUAL`, `X PLAY`), so a check plays the same round every time. Besides the steps above (`shows:`, `hides:`, `fills:` and `rects:` look at the last frame drawn), a game's checks have:

| Step | What it does |
| --- | --- |
| `play: 0*30 1*5 0` | Plays frames: one for each `0` (B up) or `1` (B down). `*n` repeats the group before it. |
| `seed: 3` | The seed for the rounds that follow. On the first line, it's the first round's (otherwise 1). |
| `again` | Starts a new round, from the game-over screen or by leaving the round. |
| `over` / `playing` | The round has ended (`step` returned `"over"`) / is still going. |
| `score: 2` | The round has ended, and `score()` gave 2. |
| `box: 30 100-140 16 16` | A box drawn with `unidex.fill` or `unidex.rect` at this x, y, width and height. Each can be a number, a range like `100-140`, or `*` for any. |
| `remember`, `same` / `changed` | Keeps what the screen shows, then checks that it's the same now (or not). Every drawing call counts, with where it was. |

When a round ends during a `play:`, nothing more is drawn, so the screen is the last frame before the end.

## Adding a course

1. Make `courses/<id>/course.json` with a `title`, `lang`, `blurb` and the list of `lessons`. A unidex course also has `"runner": "unidex"`, the `appJson` to start from, and optionally the emulator build in `emu`.
2. Add `<id>` to `courses/index.json`.
3. For a new language, add its colouring to `LANGS` in `highlight.js` and its compiler to `LANGS` in `run.js`.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE). The fonts are under the SIL Open Font License ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
