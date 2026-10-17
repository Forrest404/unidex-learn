# Project: number cruncher

This one has no new ideas. It uses what you already know: variables, input, maths, choices, loops and a vector.

Here's the job. The input is a count, then that many whole numbers:

```text
4
2 4 5 9
```

Your program prints the total, the average and the biggest number:

```text
Total: 20
Average: 5
Biggest: 9
```

Some things to think about before you start:

- The average can have a decimal point. `7 / 2` is `3`, but you want `3.5`. Which kind of variable fixes that?
- What should "biggest" start as? Try your program with only negative numbers, like `-1 -5 -3`. Is the answer still right?
- Break it into steps. Get the numbers read in and printed back first, then add one thing at a time and press Run as you go.

## Your turn

The reading part is done for you. Add the rest.

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

    cout << "Total: " << "\n";
    cout << "Average: " << "\n";
    cout << "Biggest: " << "\n";
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

    int total = 0;
    int biggest = numbers[0];
    for (int n : numbers) {
        total += n;
        if (n > biggest) {
            biggest = n;
        }
    }
    double average = total;  // a double, so it keeps the decimal point
    average = average / count;

    cout << "Total: " << total << "\n";
    cout << "Average: " << average << "\n";
    cout << "Biggest: " << biggest << "\n";
}
```

```test
input:
4
2 4 5 9
output:
Total: 20
Average: 5
Biggest: 9
```

```test
input:
2
3 4
output:
Total: 7
Average: 3.5
Biggest: 4
```

```test
input:
3
-1 -5 -3
output:
Total: -9
Average: -3
Biggest: -1
```

## What next?

That's the course done. You can now write programs that read input, do sums, make choices, repeat things and keep lists. Bigger programs use the same pieces, just more of them.

To keep going, open the [Playground](play.html) and make something small of your own, like a quiz or a shopping list. You'll learn more from that than from another lesson.
