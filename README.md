# unidex learn

Coding courses at [learn.unidex.shop](https://learn.unidex.shop). Each lesson explains one idea with an example, then you write the code yourself and run it in the browser. The first course is C++ for beginners.

It's plain HTML, CSS and JavaScript, with no build step and nothing to install. Code is compiled and run by [Compiler Explorer](https://godbolt.org), or [Wandbox](https://wandbox.org) when that's busy ([PRIVACY.md](PRIVACY.md)).

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

## Adding a course

1. Make `courses/<id>/course.json` with a `title`, `lang`, `blurb` and the list of `lessons`.
2. Add `<id>` to `courses/index.json`.
3. For a new language, add its colouring to `LANGS` in `highlight.js` and its compiler to `LANGS` in `run.js`.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE). The fonts are under the SIL Open Font License ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
