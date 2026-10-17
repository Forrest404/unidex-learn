# Maths

C++ does sums with `+`, `-`, `*` (times) and `/` (divide):

```cpp
#include <iostream>
using namespace std;

int main() {
    int apples = 7;
    int friends = 2;

    cout << apples + friends << "\n";
    cout << apples * friends << "\n";
    cout << apples / friends << "\n";
    cout << apples % friends << "\n";
}
```

```output
9
14
3
1
```

Two things look odd at first:

- `7 / 2` gives `3`, not `3.5`. When both numbers are `int`, the answer is a whole number and the rest is dropped.
- `%` gives the **remainder**: what's left over after dividing. 7 apples between 2 friends is 3 each, with 1 left over.

If you want the decimal answer, use a `double`:

```cpp
#include <iostream>
using namespace std;

int main() {
    double apples = 7;
    cout << apples / 2 << "\n";
}
```

```output
3.5
```

Brackets work like in maths class: `(2 + 3) * 4` is `20`.

## Your turn

A film is `125` minutes long. Use `/` and `%` to work out the hours and the minutes left over, so the program prints:

```text
2 hours and 5 minutes
```

Then try changing `125` to `200`. It should print `3 hours and 20 minutes`.

```starter
#include <iostream>
using namespace std;

int main() {
    int total = 125;
    int hours = 0;
    int minutes = 0;

    cout << hours << " hours and " << minutes << " minutes\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    int total = 125;
    int hours = total / 60;
    int minutes = total % 60;

    cout << hours << " hours and " << minutes << " minutes\n";
}
```

```test
output:
2 hours and 5 minutes
```
