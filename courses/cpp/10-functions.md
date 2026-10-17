# Functions

A function is a piece of code with a name. You write it once and use it as often as you like. You've been writing one all along: `main`.

```cpp
#include <iostream>
#include <string>
using namespace std;

int square(int x) {
    return x * x;
}

void greet(string name) {
    cout << "Hello, " << name << "!\n";
}

int main() {
    cout << square(4) << "\n";
    cout << square(10) << "\n";
    greet("Ada");
}
```

```output
16
100
Hello, Ada!
```

Reading `int square(int x)` from left to right:

- `int` is the kind of value it gives back
- `square` is its name
- `(int x)` is what you hand it. Inside the function it's called `x`.

`return` hands the answer back to whoever called it. A `void` function gives nothing back, it just does something.

Functions go above `main`, so the computer has seen them before `main` uses them.

## Your turn

Finish the function `bigger` so it gives back whichever of `a` and `b` is larger. If they're the same, give back either. `main` is done for you.

```starter
#include <iostream>
using namespace std;

int bigger(int a, int b) {
    return 0;
}

int main() {
    int a;
    int b;
    cin >> a >> b;
    cout << bigger(a, b) << "\n";
}
```

```solution
#include <iostream>
using namespace std;

int bigger(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main() {
    int a;
    int b;
    cin >> a >> b;
    cout << bigger(a, b) << "\n";
}
```

```test
input:
3 9
output:
9
```

```test
input:
12 4
output:
12
```

```test
input:
5 5
output:
5
```

```test
input:
-8 -2
output:
-2
```
