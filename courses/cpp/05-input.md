# Input

So far your programs print the same thing every time. With `cin` they can read what someone types:

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    cin >> name >> age;
    cout << "Hi " << name << "!\n";
    cout << "Next year you'll be " << age + 1 << ".\n";
}
```

```input
Ada 11
```

```output
Hi Ada!
Next year you'll be 12.
```

`cin >>` is the opposite of `cout <<`. It takes the next thing typed and puts it in a variable. Values are split by spaces or new lines, so `Ada 11` and `Ada` then `11` on the next line both work.

On this site, what you'd type goes in the **Input** box under your code. Change it and press Run again to get a different answer.

One catch: `cin >>` reads a single word into a `string`. `Ada Lovelace` would give just `Ada`.

## Your turn

Read two whole numbers and print what they add up to. With the input `3 4`, it should print `7`.

```starter
#include <iostream>
using namespace std;

int main() {
    int a;
    int b;

    // read a and b here

    cout << 0 << "\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    int a;
    int b;

    cin >> a >> b;

    cout << a + b << "\n";
}
```

```test
input:
3 4
output:
7
```

```test
input:
10 -25
output:
-15
```
