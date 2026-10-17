# unidex learn

Coding courses at [learn.unidex.shop](https://learn.unidex.shop). Each lesson explains one idea with an example, then you write the code yourself and run it in the browser. There are two courses:

- **Make your own unidex app.** Build an app in Lua from nothing, running it on a virtual unidex in the page, then put it on your own unidex.
- **C++ for beginners.**

It's plain HTML, CSS and JavaScript, with no build step and nothing to install.

- **Apps** run on the unidex firmware compiled for the browser, loaded from [tools.unidex.shop/emu/](https://tools.unidex.shop/emu/versions.json) by `device.js`. `vendor/` holds the tools site's emulator, store and USB code. Keep it in step with [site/](https://github.com/Forrest404/unidex/tree/main/site).
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

## Adding a course

1. Make `courses/<id>/course.json` with a `title`, `lang`, `blurb` and the list of `lessons`.
2. Add `<id>` to `courses/index.json`.
3. For a new language, add its colouring to `LANGS` in `highlight.js` and its compiler to `LANGS` in `run.js`.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE). The fonts are under the SIL Open Font License ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
