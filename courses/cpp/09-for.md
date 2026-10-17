# Loops with for

Counting loops are so common that C++ has a shorter way to write them. This prints the numbers 1 to 5 and their squares:

```cpp
#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << i << " squared is " << i * i << "\n";
    }
}
```

```output
1 squared is 1
2 squared is 4
3 squared is 9
4 squared is 16
5 squared is 25
```

The brackets after `for` hold three parts, split by `;`:

1. `int i = 1` runs once, before the loop starts
2. `i <= 5` is checked before each time round. The loop stops when it's false.
3. `i++` runs after each time round

It does the same as a `while` loop, with the counting all in one place. Calling the counter `i` is a habit almost everyone has.

## Your turn

Read a number and print its times table, from 1 to 10. With the input `7` it starts like this:

```text
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
```

and carries on to `7 x 10 = 70`.

```starter
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    cout << n << " x 1 = " << n * 1 << "\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << "\n";
    }
}
```

```test
input:
7
output:
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
```

```test
input:
2
output:
2 x 1 = 2
2 x 2 = 4
2 x 3 = 6
2 x 4 = 8
2 x 5 = 10
2 x 6 = 12
2 x 7 = 14
2 x 8 = 16
2 x 9 = 18
2 x 10 = 20
```
