# do while

> 最近修订：2026-08-16 08:31 +10:00（未审阅）

普通 `while` 先检查条件，循环体可能一次也不执行。少数过程必须先做一次操作，才能知道是否继续；`do while` 用“先执行、后检查”的顺序直接表达这种过程。

## 执行过程

```cpp
do {
    statement;
} while (condition);
```

程序先执行一次循环体，再检查 `condition`。条件为 `true` 时开始下一轮，为 `false` 时结束。因此，无论条件是什么，循环体都至少执行一次。

注意最后的 `while (condition)` 后有分号。它是整条 `do while` 语句的一部分。

`break` 仍然立即结束循环。`continue` 会跳过本轮剩余语句，然后先检查末尾的 `condition`，不会绕过条件直接回到循环体开头。

## 至少读取一次

例如持续读入整数，直到读到 `0`：

```cpp
int x;
do {
    cin >> x;
} while (x != 0);
```

程序必须先读到第一个数，才能知道它是不是 `0`。这里 `do while` 与问题顺序一致。

同一过程也能使用 [while](while.md) 的无限循环和 `break` 表达，而且竞赛代码通常更常采用后者：

```cpp
while (true) {
    int x;
    cin >> x;
    if (x == 0) {
        break;
    }
}
```

## 使用范围

`do while` 是完整的 C++ 循环语句，但竞赛中的使用频率远低于 `for` 和 `while`。学习目标是能读懂它、知道循环体至少执行一次，并能在问题天然要求“先做一次再判断”时使用；不必为了使用它改写原本清楚的循环。

## 完整代码

下面的程序至少读入一个整数，并统计读到 `0` 以前的正数数量：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int positive_count = 0;
    int x;

    do {
        cin >> x;
        if (x > 0) {
            positive_count++;
        }
    } while (x != 0);

    cout << positive_count << '\n';
}

int main() {
    solve();
    return 0;
}
```

## 基础练习

1. 写一个条件从开始就为 `false` 的 `do while`，确认循环体仍执行一次。
2. 把完整代码改写成 `while (true)` 与 `break` 的形式。
3. 找出 `do { cin >> x; } while (x != 0)` 末尾不能省略的标点。

## 需要记住什么

1. `do while` 在什么时候检查条件？
2. 它的循环体至少执行几次？
3. 语句末尾为什么还有一个分号？
4. `continue` 在 `do while` 中会跳到哪个位置？
5. 为什么竞赛中通常优先使用 `for` 或 `while`？
