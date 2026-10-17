# Printing more

You can print as many lines as you like. Each `\n` starts a new line:

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Line one\n";
    cout << "Line two\n";
    cout << "Same " << "line\n";  // << joins things together
}
```

```output
Line one
Line two
Same line
```

The bit after `//` is a **comment**. The computer skips it. Comments are notes for people reading your code, including future you.

You'll also see `endl` instead of `\n`. It does the same job:

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hi" << endl;
}
```

## Your turn

Print this little poem, exactly as it is, on three lines:

```text
Roses are red
Violets are blue
I can code now
```

Add a comment above it saying what the program does.

```starter
#include <iostream>
using namespace std;

int main() {
    cout << "Roses are red\n";
}
```

```solution
#include <iostream>
using namespace std;

int main() {
    // Prints a short poem
    cout << "Roses are red\n";
    cout << "Violets are blue\n";
    cout << "I can code now\n";
}
```

```test
output:
Roses are red
Violets are blue
I can code now
```
