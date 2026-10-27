# Drawing the scene

The screen is 200 pixels wide and 200 tall. `x` counts across from the left, and `y` counts down from the top, so (0, 0) is the top left corner.

Games are mostly boxes. `unidex.fill(x, y, w, h)` draws a filled box: its top left corner at `x`, `y`, `w` wide and `h` tall. `unidex.rect` draws the same box as an outline.

```lua
function start(seed) end
function step(tapped, held) end
function score() return 0 end

function draw()
  unidex.text(8, 20, "Boxes")
  unidex.fill(0, 150, 200, 4)
  unidex.fill(90, 110, 40, 40)
  unidex.rect(20, 50, 50, 30)
end
```

A function with nothing much to do can go on one line, like the first three here.

- `unidex.fill(0, 150, 200, 4)` is a strip right across the screen, 4 pixels tall.
- `unidex.fill(90, 110, 40, 40)` is a square sitting on it: its top is at 110, and 110 + 40 is 150.
- `unidex.text(8, 20, "Boxes")` writes from `x` 8. The 20 is where the bottom of the letters goes.

## Your turn

Hop's title is in the top left now, and there are two names to help: `GROUND`, how far down the ground is, and `x`, where the player's left edge is. Draw the scene:

1. The ground: a box right across the screen at `GROUND`, 200 wide and 2 tall.
2. The player: a 16 by 16 box at `x`, standing on the ground. Its top is 16 above the ground, so use `GROUND - 16` for its `y`.

```starter
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge

function start(seed)
end

function step(tapped, held)
end

function draw()
  unidex.text(8, 20, "Hop")
  -- the ground, then the player
end

function score()
  return 0
end
```

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge

function start(seed)
end

function step(tapped, held)
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16, 16, 16)
end

function score()
  return 0
end
```

```check
shows: Hop
box: 0 170 200 2
box: 30 154 16 16
fills: 2
```
