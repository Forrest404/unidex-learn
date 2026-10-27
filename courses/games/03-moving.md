# Something that moves

`step` runs about ten times a second, all through the round. Each time is called a **frame**. To make something move, change where it is a little in each frame:

```lua
local boxX = 0

function start(seed)
  boxX = 0
end

function step(tapped, held)
  boxX = boxX + 5
  if boxX > 200 then
    boxX = -20
  end
  return "moved"
end

function draw()
  unidex.fill(boxX, 90, 20, 20)
end

function score() return 0 end
```

Run it and the box slides across, then comes round again from the left.

- `return "moved"` tells the unidex something changed, so it calls `draw` to show it. Return `"still"` when nothing changed, and it saves drawing the same screen again. Returning nothing counts as `"moved"`.
- The line at the top, `local boxX = 0`, runs once, when the game loads. `start` runs at the start of every round, so it puts the box back. Without it, a second round would carry on where the first one stopped.

## Your turn

Add a wall that comes towards the player.

1. Make a name for where the wall's left edge is, `wallX`, and another for how tall it is, `wallH`, which is 20.
2. In `start`, put the wall at 200, just off the right of the screen.
3. In each `step`, move it 4 to the left. When it's gone off the left (`wallX` is less than -10), put it back at 200. Return `"moved"`.
4. In `draw`, draw it standing on the ground: 10 wide and `wallH` tall, so its top is at `GROUND - wallH`.

```starter
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

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is

function start(seed)
  wallX = 200
end

function step(tapped, held)
  wallX = wallX - 4
  if wallX < -10 then
    wallX = 200
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return 0
end
```

```check
box: 200 150 10 20
play: 0*10
box: 160 150 10 20
play: 0*50
box: 172 150 10 20
box: 30 154 16 16
playing
```

```check
play: 0*10
again
box: 200 150 10 20
```
