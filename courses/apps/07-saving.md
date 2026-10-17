# Saving

Here's something about the unidex you need to know: to save battery, it sleeps, and when it sleeps it forgets every variable. When it wakes, your app starts again from the top. Hold A to leave your app, open it again, and your glasses are back at 0.

So anything worth keeping goes in a small file, saved in your app's own folder:

```lua
local visits = tonumber(unidex.data.read("visits") or "") or 0
visits = visits + 1
unidex.data.write("visits", tostring(visits))

function draw()
  unidex.header("Visits")
  unidex.centered(100, "Opened " .. visits .. " times", "medium")
end
```

Run it, hold A to leave, then press Run again. The number keeps going up.

- `unidex.data.write("visits", "3")` saves text under a name.
- `unidex.data.read("visits")` gives it back, or `nil` (nothing) if it was never saved.
- Files hold text, so turn numbers into text with `tostring` and back with `tonumber`.
- `or` picks the next thing when the first is `nil`. That's how the first run starts at 0.

Your app runs from the top every time it opens, so reading at the top is enough. Save whenever the value changes.

## Your turn

Make the count survive sleep:

- start `glasses` from the saved value, or 0 the first time
- write a `local function save()` that saves `glasses`
- call `save()` everywhere `glasses` changes

```starter
local glasses = 0
local goal = 8

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
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
  end
  return "partial"
end

function onBHold()
  glasses = 0
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

```check
press: b b b
reopen
shows: 3
press: a
reopen
shows: 2
press: B
reopen
shows: 0
```
