# `while`

> 最近修订：2026-08-17 09:42 +10:00（未审阅）

当一段操作需要在某个条件持续成立时反复执行，而且重复次数不一定预先知道，可以使用 `while` 循环。每次重复执行循环体称为一次**迭代**。

## 执行过程

```cpp
while (condition) {
    statement;
}
```

每轮开始前，程序先检查 `condition`：条件为 `true` 时执行循环体，再回到开头检查；条件为 `false` 时结束循环。若条件一开始就是 `false`，循环体一次也不会执行。

## 状态、条件与更新

从 $1$ 输出到 $n$ 时，先让 `i` 表示当前整数：

```cpp
int i = 1;
while (i <= n) {
    cout << i << '\n';
    i++;
}
```

这个循环包含三个不可缺少的部分：

- `i` 保存当前状态，并在循环前初始化；
- `i <= n` 判断是否继续；
- `i++` 在处理完成后移动到下一个状态。

若遗漏 `i++`，条件会一直检查同一个 `i`，程序可能永远不能停止。这里先把
`i++` 当作“让 `i` 增加 `1`”的固定写法；[自增与自减运算符](increment-decrement-operators.md)
会在后面解释它作为表达式时的完整规则。

## 次数未知的过程

`while` 尤其适合退出时间由输入或计算过程决定的情况。例如反复读入整数，读到 `0` 时停止：

```cpp
int x;
cin >> x;

while (x != 0) {
    cout << x << '\n';
    cin >> x;
}
```

这里必须先读取第一个数，才能检查第一次条件；每轮末尾再次读取，才能为下一轮准备新状态。

## break 与 continue

`break` 立即结束当前循环。`continue` 跳过本轮剩余语句，直接进行下一次条件检查：

```cpp
while (true) {
    int x;
    cin >> x;

    if (x == 0) {
        break;
    }
    if (x < 0) {
        continue;
    }

    cout << x << '\n';
}
```

在 `while` 中，状态更新通常位于循环体。若 `continue` 把必要更新一同跳过，就可能形成死循环。写下 `continue` 时要重新检查下一轮条件依赖的状态是否已经改变。

## 完整代码

下面的程序不断读入整数，直到读到 `0`，并输出此前所有正数的和：

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

void solve() {
    ll sum = 0;

    while (true) {
        int x;
        cin >> x;

        if (x == 0) {
            break;
        }
        if (x < 0) {
            continue;
        }
        sum += x;
    }

    cout << sum << '\n';
}

int main() {
    solve();
    return 0;
}
```

## 基础练习

1. 使用 `while` 输出从 $n$ 到 $1$ 的全部整数。
2. 不断读入整数直到 `-1`，统计此前读入了多少个数。
3. 构造一个因为忘记更新状态而无法停止的循环，再修复它。

## 需要记住什么

1. `while` 在循环体之前还是之后检查条件？
2. 条件一开始为 `false` 时，循环体执行几次？
3. 状态、继续条件和更新分别解决什么问题？
4. `break` 和 `continue` 各自会跳到哪里？
5. 为什么 `while` 中的 `continue` 可能导致死循环？
