# More choices

When there are more than two ways to go, chain them with `else if`. The computer checks each test in turn and runs the first one that's true:

```cpp
#include <iostream>
using namespace std;

int main() {
    int temp;
    cin >> temp;

    if (temp < 10) {
        cout << "Coat on.\n";
    } else if (temp < 20) {
        cout << "A jumper will do.\n";
    } else {
        cout << "T-shirt weather!\n";
    }
}
```

```input
14
```

```output
A jumper will do.
```

You can join tests together too:

- `&&` means **and**: both must be true. `age >= 13 && age <= 19` is a teenager.
- `||` means **or**: at least one must be true. `day == 6 || day == 7` is the weekend.

## Your turn

Read a test score and print a grade:

- `90` or more: `A`
- `70` to `89`: `B`
- `50` to `69`: `C`
- below `50`: `Try again`

Scores only go from 0 to 100. If the number is below 0 or above 100, print `Not a score` instead.

```starter
#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;

    if (score >= 90) {
        cout << "A\n";
    }
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;

    if (score < 0 || score > 100) {
        cout << "Not a score\n";
    } else if (score >= 90) {
        cout << "A\n";
    } else if (score >= 70) {
        cout << "B\n";
    } else if (score >= 50) {
        cout << "C\n";
    } else {
        cout << "Try again\n";
    }
}
```

```test
input:
95
output:
A
```

```test
input:
70
output:
B
```

```test
input:
69
output:
C
```

```test
input:
12
output:
Try again
```

```test
input:
101
output:
Not a score
```

```test
input:
-5
output:
Not a score
```
