# Working with strings

A `string` is a lot like a vector of letters. You can ask how long it is, pick out one letter, or go through them all:

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string word = "robot";

    cout << word.length() << "\n";  // how many letters
    cout << word[0] << "\n";        // the first letter
    cout << word + "s" << "\n";     // + joins strings

    for (char c : word) {
        cout << c << "-";
    }
    cout << "\n";
}
```

```output
5
r
robots
r-o-b-o-t-
```

A single letter is a `char`. It goes in **single** quotes, like `'a'`. Text in double quotes, like `"a"`, is a string, even when it's one letter long.

So to check a letter, compare it with a `char`:

```cpp
#include <iostream>
using namespace std;

int main() {
    char c = 'b';
    if (c == 'b') {
        cout << "It's a b\n";
    }
}
```

## Your turn

Read a word and print how many vowels it has. The vowels are `a`, `e`, `i`, `o` and `u`. All the words will be in lower case. With the input `banana` it should print `3`.

```starter
#include <iostream>
#include <string>
using namespace std;

int main() {
    string word;
    cin >> word;

    int vowels = 0;

    cout << vowels << "\n";
}
```

```solution
#include <iostream>
#include <string>
using namespace std;

int main() {
    string word;
    cin >> word;

    int vowels = 0;
    for (char c : word) {
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            vowels++;
        }
    }

    cout << vowels << "\n";
}
```

```test
input:
banana
output:
3
```

```test
input:
queue
output:
4
```

```test
input:
rhythm
output:
0
```
