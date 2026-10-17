# Variables

A variable is a box with a name that holds a value. You say what kind of value goes in it, give it a name, and put something in:

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Sam";
    int age = 12;
    double height = 1.52;

    cout << name << " is " << age << " years old\n";
    cout << "and " << height << " metres tall\n";
}
```

```output
Sam is 12 years old
and 1.52 metres tall
```

The kinds you'll use most:

- `int` for whole numbers, like `12` or `-3`
- `double` for numbers with a decimal point, like `1.52`
- `string` for text, in double quotes. It needs `#include <string>` at the top.
- `bool` for `true` or `false`

You can change what's in a box later. Leave off the kind when you do:

```cpp
#include <iostream>
using namespace std;

int main() {
    int score = 0;
    score = 10;
    cout << score << "\n";
}
```

```output
10
```

Names can use letters, numbers and `_`, but can't start with a number or have spaces. `score2` and `best_score` are fine, `2score` isn't.

## Your turn

Give `robot` the value `Pip` and `year` the value `2026`, so the program prints:

```text
Pip was built in 2026
```

```starter
#include <iostream>
#include <string>
using namespace std;

int main() {
    string robot = "";
    int year = 0;

    cout << robot << " was built in " << year << "\n";
}
```

```solution
#include <iostream>
#include <string>
using namespace std;

int main() {
    string robot = "Pip";
    int year = 2026;

    cout << robot << " was built in " << year << "\n";
}
```

```test
output:
Pip was built in 2026
```
