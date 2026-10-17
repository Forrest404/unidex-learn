# Hello, world

A program is a list of instructions for the computer. Here's one of the smallest C++ programs you can write:

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!\n";
}
```

Press **Run** under it to see what it does.

Line by line:

- `#include <iostream>` lets your program print things.
- `using namespace std;` saves you typing `std::` in front of `cout`.
- `int main() { }` is where the program starts. The computer runs the lines between `{` and `}`, top to bottom.
- `cout << "Hello, world!\n";` prints the text between the quotes. The `\n` at the end starts a new line.

Each instruction ends with a semicolon `;`. Leave one out and the program won't build. Everyone forgets one now and then, and when you do, the error tells you which line to look at.

## Your turn

Change the program so it prints `I'm learning C++!` instead. Run it, and when you're happy, press **Check**.

```starter
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    cout << "I'm learning C++!\n";
}
```

```test
output:
I'm learning C++!
```
