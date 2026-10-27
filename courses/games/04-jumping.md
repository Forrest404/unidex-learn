# Jumping with B

`step` is told what B is doing in each frame:

- `tapped` is `true` in the frame where B goes down, and `false` after that, even if it's still down.
- `held` is `true` in every frame while B is down.

So `tapped` is for things that happen once per press, like a jump, and `held` is for things that last, like flying higher.

```lua
local taps = 0
local down = false

function start(seed)
  taps = 0
end

function step(tapped, held)
  if tapped then
    taps = taps + 1
  end
  down = held
  return "moved"
end

function draw()
  unidex.centered(70, "Taps: " .. taps)
  if down then
    unidex.fill(80, 100, 40, 40)
  else
    unidex.rect(80, 100, 40, 40)
  end
end

function score() return taps end
```

Run it, then tap B, and hold it. The count goes up once per press, and the box is filled for as long as you hold.

## Your turn

Make the player jump. You need two new names:

- `y`: how high the player is off the ground. 0 means standing on it.
- `vy`: how fast it's going up. Less than 0 means it's coming down.

In `start`, set both to 0. Then at the start of `step`:

1. If B was tapped and the player is on the ground (`y == 0`), set `vy` to 9.
2. Add `vy` to `y`.
3. Take 2 off `vy`, or only 1 while B is held. That's gravity, and holding B makes it weaker, so a long press jumps higher.
4. If `y` is 0 or less, the player has landed: set `y` and `vy` back to 0.

Last, draw the player `y` higher: its top is at `GROUND - 16 - y`.

```starter
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

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is

function start(seed)
  y = 0
  vy = 0
  wallX = 200
end

function step(tapped, held)
  -- the jump
  if tapped and y == 0 then
    vy = 9
  end
  y = y + vy
  if held then
    vy = vy - 1
  else
    vy = vy - 2
  end
  if y <= 0 then
    y = 0
    vy = 0
  end

  -- the wall
  wallX = wallX - 4
  if wallX < -10 then
    wallX = 200
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return 0
end
```

```check
play: 1 0*3
box: 30 115-140 16 16
play: 0*20
box: 30 154 16 16
```

```check
play: 1*8
box: 30 95-120 16 16
```
