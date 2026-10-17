# Making choices

Sometimes your app should only do something when it makes sense. `if` runs code only when a test is true:

```lua
local lives = 3

function draw()
  unidex.header("Lives")
  unidex.centered(100, "Lives left: " .. lives, "medium")
  if lives == 0 then
    unidex.centered(130, "Game over")
  end
  unidex.hints("lose one", "", "")
end

function onA()
  if lives > 0 then
    lives = lives - 1
  end
  return "partial"
end
```

Run it and press A four times. Lives stop at 0 and `Game over` shows.

- The test goes between `if` and `then`, and the code to run ends with `end`.
- Compare with `==` (equal), `~=` (not equal), `<`, `>`, `<=` and `>=`.
- Add `else` for what to do when the test is false.

A long press of B runs `onBHold`. `unidex.toast("words")` pops a short message up over the screen.

## Your turn

Press B by mistake and you've added a glass you didn't drink. Fix that:

- **A** takes one glass away, but never goes below 0
- **holding B** sets the count back to 0, with a toast that says `Reset`
- update the hints: `less` for A, `add` for B and `reset` for holding B

```starter
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

```solution
local glasses = 0
local goal = 8

function draw()
  unidex.header("Water")
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("less", "add", "reset")
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

```check
press: b b a
shows: 1
shows: less
```

```check
press: a a
shows: 0
hides: -1
```

```check
press: b b b B
shows: 0
shows: reset
```
