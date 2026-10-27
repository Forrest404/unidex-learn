# A game is four functions

A unidex game is a folder with the same two files as an app, `main.lua` and `app.json`. What makes it a game is one line in `app.json`: `"type": "game"`. Then it shows up in **Games** on your unidex, after the four games that come with it.

A game is played in **rounds**. The unidex runs the round for you, and asks your code four things:

- `start(seed)`: a new round is starting. Get everything ready.
- `step(tapped, held)`: one moment of the game, about ten times a second. Move things along here.
- `draw()`: draw the whole screen as it is now.
- `score()`: the round is over. What's the score?

Here's the smallest game there is. Press **Run** under it:

```lua
function start(seed)
end

function step(tapped, held)
end

function draw()
  unidex.centered(90, "A game!")
  unidex.centered(115, "Hold A to leave")
end

function score()
  return 0
end
```

Nothing happens in it yet, but it's a real game: the unidex opened Games and started a round. In a round, B is the only button. Holding A leaves the round.

`start` and `step` are empty for now. That's fine, as long as they're there. `score` has to give back a whole number with `return`.

## Your turn

You're going to build a game called Hop over this course: a block that jumps over walls. Start it off: make `draw` write `Hop` in the middle of the screen, 100 pixels down. Press **Run** to see it, then **Check**.

```starter
function start(seed)
end

function step(tapped, held)
end

function draw()
end

function score()
  return 0
end
```

```solution
function start(seed)
end

function step(tapped, held)
end

function draw()
  unidex.centered(100, "Hop")
end

function score()
  return 0
end
```

```check
shows: Hop
play: 0*10
shows: Hop
playing
```
