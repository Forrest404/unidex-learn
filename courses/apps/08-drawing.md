# Drawing

Besides text, you can draw boxes and lines:

```lua
function draw()
  unidex.header("Boxes")
  for i = 1, 5 do
    unidex.rect(i * 30, 60, 20, 20)
  end
  unidex.fill(30, 100, 140, 20)
  unidex.line(30, 140, 170, 140)
end
```

- `unidex.rect(x, y, width, height)` draws the outline of a box. `x` and `y` are its top left corner.
- `unidex.fill(x, y, width, height)` draws a solid box.
- `unidex.line(x1, y1, x2, y2)` draws a line from one point to another.

The `for` line is a **loop**: it runs the code inside it once for each number from 1 to 5, with `i` set to that number. So the first box is at x = 30, the next at 60, and so on.

## Your turn

Draw a bar under the count with one box for each glass in your goal: solid for the glasses you've had, an outline for the rest. Put it in its own function, `drawBar`, and call it from `draw`.

Some numbers that fit:

- `local size = math.floor(184 / goal)` gives each box an equal share of the width. `math.floor` drops the part after the decimal point.
- box number `i` starts at x = `8 + (i - 1) * size`
- make each box `size - 4` wide and `16` tall, at y = `136`

```starter
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local goal = 8

local function save()
  unidex.data.write("glasses", tostring(glasses))
end

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

function draw()
  unidex.header("Water")
  unidex.centered(52, message())
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("less", "add", "reset")
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  glasses = glasses + 1
  save()
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
    save()
  end
  return "partial"
end

function onBHold()
  glasses = 0
  save()
  unidex.toast("Reset")
  return "partial"
end
```

```solution
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local goal = 8

local function save()
  unidex.data.write("glasses", tostring(glasses))
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
  unidex.header("Water")
  unidex.centered(52, message())
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  drawBar()
  unidex.hints("less", "add", "reset")
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  glasses = glasses + 1
  save()
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
    save()
  end
  return "partial"
end

function onBHold()
  glasses = 0
  save()
  unidex.toast("Reset")
  return "partial"
end
```

```check
fills: 0
rects: 8
press: b b b
fills: 3
rects: 5
```

```check
press: b b b b b b b b b b
fills: 8
rects: 0
```
