# Time

`unidex.time()` tells you the date and time, as a table with names instead of numbers:

```lua
function draw()
  local t = unidex.time()
  unidex.header("Clock")
  unidex.centered(100, t.hour .. ":" .. string.format("%02d", t.min), "large")
  unidex.centered(130, t.day .. "/" .. t.month .. "/" .. t.year)
end

function tick()
  return "partial"
end
```

- `t.hour`, `t.min` and `t.sec` are the time; `t.day`, `t.month` and `t.year` the date.
- `string.format("%02d", t.min)` writes a number with at least two digits, so five past ten shows as `10:05`, not `10:5`.
- `t.valid` is `false` until the unidex has been told the time (the tools site's Sync does that). Don't trust the date until then.
- `tick` is called now and then while your app is open, about once a second here. Return `"partial"` from it when the screen needs redrawing.

On a real unidex, `tick` runs less while it's asleep. That's fine for this app: it also checks the date every time it opens.

## Your turn

Make it a tracker for **today**:

- show today's date in the header, on the right: `unidex.header("Water", t.day .. "/" .. t.month)`
- save the date along with the count, as text like `2026-10-17` (a `today` function that builds it is handy)
- when the app opens or ticks and the saved date isn't today, set the count back to 0. Only do it when `t.valid` is true.

You can't move the date forward to test it here, so read your code through once more.

```starter
local GOALS = {6, 8, 10}
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local pick = tonumber(unidex.data.read("goal") or "") or 2
local goal = GOALS[pick]
local screen = "main"

local function save()
  unidex.data.write("glasses", tostring(glasses))
  unidex.data.write("goal", tostring(pick))
end

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

local function drawBar()
  local size = math.floor(184 / goal)
  for i = 1, goal do
    local x = 8 + (i - 1) * size
    if i <= glasses then
      unidex.fill(x, 136, size - 4, 16)
    else
      unidex.rect(x, 136, size - 4, 16)
    end
  end
end

function draw()
  if screen == "options" then
    unidex.header("Options")
    unidex.centered(80, "Goal: " .. goal, "medium")
    unidex.centered(115, "A changes the goal.")
    unidex.centered(135, "B starts the day again.")
    unidex.hints("goal", "reset", "")
  else
    unidex.header("Water")
    unidex.centered(52, message())
    unidex.centered(100, tostring(glasses), "large")
    unidex.centered(125, "of " .. goal .. " glasses today")
    drawBar()
    unidex.hints("less", "add", "options")
  end
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  if screen == "options" then
    glasses = 0
    screen = "main"
    unidex.toast("Reset")
  else
    glasses = glasses + 1
  end
  save()
  return "partial"
end

function onA()
  if screen == "options" then
    pick = pick % #GOALS + 1
    goal = GOALS[pick]
  elseif glasses > 0 then
    glasses = glasses - 1
  end
  save()
  return "partial"
end

function onBHold()
  screen = "options"
  return "partial"
end

-- Holding A leaves the app, unless you're on the options screen: then it goes back to the count
function onBack()
  if screen == "options" then
    screen = "main"
    return "partial"
  end
  return "exit"
end
```

```solution
local GOALS = {6, 8, 10}
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local pick = tonumber(unidex.data.read("goal") or "") or 2
local goal = GOALS[pick]
local screen = "main"

-- Today, as text like "2026-10-17"
local function today()
  local t = unidex.time()
  return t.year .. "-" .. t.month .. "-" .. t.day
end

local function save()
  unidex.data.write("glasses", tostring(glasses))
  unidex.data.write("goal", tostring(pick))
  unidex.data.write("day", today())
end

-- A new day starts the count again
local function newDay()
  if unidex.time().valid and unidex.data.read("day") ~= today() then
    glasses = 0
    save()
    return true
  end
  return false
end
newDay()

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

local function drawBar()
  local size = math.floor(184 / goal)
  for i = 1, goal do
    local x = 8 + (i - 1) * size
    if i <= glasses then
      unidex.fill(x, 136, size - 4, 16)
    else
      unidex.rect(x, 136, size - 4, 16)
    end
  end
end

function draw()
  if screen == "options" then
    unidex.header("Options")
    unidex.centered(80, "Goal: " .. goal, "medium")
    unidex.centered(115, "A changes the goal.")
    unidex.centered(135, "B starts the day again.")
    unidex.hints("goal", "reset", "")
  else
    local t = unidex.time()
    unidex.header("Water", t.day .. "/" .. t.month)
    unidex.centered(52, message())
    unidex.centered(100, tostring(glasses), "large")
    unidex.centered(125, "of " .. goal .. " glasses today")
    drawBar()
    unidex.hints("less", "add", "options")
  end
end

function tick()
  if newDay() then
    return "partial"
  end
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  if screen == "options" then
    glasses = 0
    screen = "main"
    unidex.toast("Reset")
  else
    glasses = glasses + 1
  end
  save()
  return "partial"
end

function onA()
  if screen == "options" then
    pick = pick % #GOALS + 1
    goal = GOALS[pick]
  elseif glasses > 0 then
    glasses = glasses - 1
  end
  save()
  return "partial"
end

function onBHold()
  screen = "options"
  return "partial"
end

-- Holding A leaves the app, unless you're on the options screen: then it goes back to the count
function onBack()
  if screen == "options" then
    screen = "main"
    return "partial"
  end
  return "exit"
end
```

```check
shows: {day}/{month}
press: b b
reopen
shows: 2
shows: {day}/{month}
```
