# Loops with while

A loop runs the same code again and again. `while` keeps going as long as its test is true:

```cpp
#include <iostream>
using namespace std;

int main() {
    int count = 3;

    while (count > 0) {
        cout << count << "\n";
        count = count - 1;
    }
    cout << "Go!\n";
}
```

```output
3
2
1
Go!
```

Each time round, it prints `count` and takes one off. When `count` gets to `0` the test is false, so the loop stops and the program carries on below it.

If nothing inside the loop ever makes the test false, it runs forever. Try deleting the `count = count - 1;` line and running it. After a few seconds the page stops it for you.

Some shortcuts you'll see a lot:

- `count--` takes one off, the same as `count = count - 1`
- `count++` adds one
- `total += 5` adds 5 to `total`

## Your turn

Read a number and count down from it to 1, one number per line. Then print `Liftoff!`. With the input `3`:

```text
3
2
1
Liftoff!
```

```starter
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    cout << "Liftoff!\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    while (n > 0) {
        cout << n << "\n";
        n--;
    }
    cout << "Liftoff!\n";
}
```

```test
input:
3
output:
3
2
1
Liftoff!
```

```test
input:
1
output:
1
Liftoff!
```

```test
input:
6
output:
6
5
4
3
2
1
Liftoff!
```
