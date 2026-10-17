# Lists with vector

A `vector` holds a list of values of the same kind, one after another:

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {7, 3, 9};

    scores.push_back(5);          // add one to the end
    cout << scores.size() << "\n";  // how many there are
    cout << scores[0] << "\n";      // the first one
    cout << scores[3] << "\n";      // the fourth one

    for (int s : scores) {
        cout << s << " ";
    }
    cout << "\n";
}
```

```output
4
7
5
7 3 9 5
```

- `vector<int>` is a list of `int`s. A list of words would be `vector<string>`.
- `scores[0]` is the first item. Counting starts at **0**, so the last of 4 items is `scores[3]`.
- `for (int s : scores)` goes through the list, putting each item in `s` in turn.

Asking for an item that isn't there, like `scores[10]` here, is a mistake C++ won't always catch. Your program might print rubbish or crash.

## Your turn

The input is a count, then that many numbers. Read them all into a vector, then print them in reverse order on one line, with a space after each. With this input:

```text
4
1 2 3 4
```

it should print `4 3 2 1`.

Hint: a `for` loop can count down too, with `i--` instead of `i++`. The last item is at `count - 1`.

```starter
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int count;
    cin >> count;

    vector<int> numbers;
    for (int i = 0; i < count; i++) {
        int n;
        cin >> n;
        numbers.push_back(n);
    }

    // print them backwards here
}
```

```solution
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int count;
    cin >> count;

    vector<int> numbers;
    for (int i = 0; i < count; i++) {
        int n;
        cin >> n;
        numbers.push_back(n);
    }

    for (int i = count - 1; i >= 0; i--) {
        cout << numbers[i] << " ";
    }
    cout << "\n";
}
```

```test
input:
4
1 2 3 4
output:
4 3 2 1
```

```test
input:
1
42
output:
42
```

```test
input:
5
10 -3 0 8 8
output:
8 8 0 -3 10
```
