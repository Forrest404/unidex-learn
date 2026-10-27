# Score, and getting harder

A game needs a score, and it's more fun when it speeds up as you get better. Both are just numbers that change in `step`:

```lua
local boxX = 0
local speed = 2
local laps = 0

function start(seed)
  boxX = 0
  speed = 2
  laps = 0
end

function step(tapped, held)
  boxX = boxX + speed
  if boxX > 200 then
    boxX = -20
    laps = laps + 1
    speed = speed + 1
  end
  if tapped then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Laps: " .. laps)
  unidex.fill(boxX, 90, 20, 20)
end

function score()
  return laps
end
```

Each time the box goes round, it counts a lap and goes a little faster. Tap B and the round ends, with the laps as the score.

Remember to set them back in `start`, or the next round starts fast.

## Your turn

Give Hop a score.

1. Add `points`, starting at 0, and `speed`, starting at 4. Set them both in `start` too.
2. Move the wall `speed` to the left instead of 4.
3. When the wall comes back round (where it's put back at 200), add 1 to `points`, and add 1 to `speed` if it's less than 10.
4. Show the points at the top right: `unidex.text(170, 20, tostring(points))`.
5. Make `score()` return `points`.

```starter
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

  -- did the player hit it?
  if wallX < x + 16 and wallX + 10 > x and y < wallH then
    return "over"
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

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is
local speed = 4      -- how far the wall moves each frame
local points = 0

function start(seed)
  y = 0
  vy = 0
  wallX = 200
  speed = 4
  points = 0
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
  wallX = wallX - speed
  if wallX < -10 then
    wallX = 200
    points = points + 1
    if speed < 10 then
      speed = speed + 1
    end
  end

  -- did the player hit it?
  if wallX < x + 16 and wallX + 10 > x and y < wallH then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.text(170, 20, tostring(points))
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return points
end
```

```check
play: 0*50
over
score: 0
```

```check
play: 0*35 1*10 0*20
shows: 1
box: 140 150 10 20
play: 0*40
over
score: 1
again
play: 0*50
over
score: 0
```
