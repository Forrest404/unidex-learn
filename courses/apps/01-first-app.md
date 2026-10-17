# Your first app

An app is a folder with two small files:

- `main.lua` is the code, written in a language called Lua.
- `app.json` is the app's name and a few details. You'll fill it in later in the course.

Here's a whole app. Press **Run** under it and it opens on the unidex beside you:

```lua
function draw()
  unidex.header("Hello")
  unidex.centered(100, "Hi there!")
end
```

`draw` is a **function**: a named list of instructions. The unidex calls your `draw` whenever it needs to show your app, with a blank screen ready.

- `unidex.header("Hello")` puts a title at the top.
- `unidex.centered(100, "Hi there!")` writes a line in the middle. The `100` is how far down the screen it goes, out of 200.

Text goes between double quotes. Everything between `function draw()` and `end` belongs to `draw`.

## Your turn

You're going to build a water tracker over this course. Start it off: give the screen the title `Water`, and show `0 glasses` in the middle. Then press **Run** to see it, and **Check** when you're happy.

```starter
function draw()
  unidex.header("Hello")
  unidex.centered(100, "Hi there!")
end
```

```solution
function draw()
  unidex.header("Water")
  unidex.centered(100, "0 glasses")
end
```

```check
shows: Water
shows: 0 glasses
```
