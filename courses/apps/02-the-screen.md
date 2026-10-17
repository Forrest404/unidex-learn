# The screen

The unidex screen is 200 dots wide and 200 dots tall, in black and white. You place things on it by saying how far across (**x**) and how far down (**y**) they go, counting from the top left corner:

```lua
function draw()
  unidex.header("Fonts")
  unidex.text(8, 50, "small, the usual")
  unidex.text(8, 75, "bold", "bold")
  unidex.text(8, 105, "medium", "medium")
  unidex.text(8, 145, "large", "large")
  unidex.hints("A", "B", "hold B")
end
```

Run it, and look at where each line lands.

- `unidex.text(x, y, "words")` writes at a spot. The `y` is where the **bottom** of the letters sits, like writing on a line.
- Add a font name to change the size: `"small"` (the usual one), `"bold"`, `"medium"`, `"large"`, or `"tiny"`.
- `unidex.centered(y, "words")` does the same, but centred across the screen, so you don't need an x.
- `unidex.hints` fills the bar along the bottom with what A, B and holding B do. Use `""` to leave one out.

The header takes the top 24 dots and the hints the bottom 37, so your own things go between y = 24 and y = 162.

Only plain letters, numbers and punctuation work. Accents and emoji won't show.

## Your turn

Make the water tracker's screen look like an app:

- show `0` in the middle in the `large` font, at y = 100
- under it, `glasses today` at y = 125
- in the hints, say that B will `add` (we'll make it work in a later lesson)

```starter
function draw()
  unidex.header("Water")
  unidex.centered(100, "0 glasses")
end
```

```solution
function draw()
  unidex.header("Water")
  unidex.centered(100, "0", "large")
  unidex.centered(125, "glasses today")
  unidex.hints("", "add", "")
end
```

```check
shows: Water
shows: glasses today
shows: add
hides: 0 glasses
```
