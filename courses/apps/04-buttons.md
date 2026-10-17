# Buttons

A unidex has two buttons, A and B. When someone presses B, the unidex looks for a function called `onB` in your app and runs it:

```lua
local taps = 0

function draw()
  unidex.header("Taps")
  unidex.centered(100, "B pressed " .. taps .. " times")
  unidex.hints("", "tap", "")
end

function onB()
  taps = taps + 1
  return "partial"
end
```

Run it, then press **B** under the screen (or the B key) a few times.

- `taps = taps + 1` takes what's in `taps`, adds one, and puts it back.
- `return "partial"` tells the unidex the screen needs drawing again, so it calls your `draw`. Without it, the number changes but the screen doesn't.

`onA` does the same for the A button. Holding A is kept for leaving the app, so you can always get out.

## Your turn

Make B add one glass. Then press Run and try it on the unidex.

```starter
local glasses = 0
local goal = 8

function draw()
  unidex.header("Water")
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("", "add", "")
end
```

```solution
local glasses = 0
local goal = 8

function draw()
  unidex.header("Water")
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("", "add", "")
end

function onB()
  glasses = glasses + 1
  return "partial"
end
```

```check
press: b b
shows: 2
press: b
shows: 3
```
