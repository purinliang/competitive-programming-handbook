# `switch`

> 最近修订：2026-08-17 10:08 +10:00（未审阅）

当程序只需要根据一个整数的若干离散取值选择操作时，可以使用 `switch`。它把“计算一次选择值”和“列出每个可能值”分开书写。

## case 分支

下面约定操作编号 `1`、`2`、`3` 分别表示加法、减法和乘法：

```cpp
switch (operation) {
case 1:
    cout << a + b << '\n';
    break;
case 2:
    cout << a - b << '\n';
    break;
case 3:
    cout << a * b << '\n';
    break;
}
```

`switch` 先计算圆括号中的 `operation`，再跳到值与它相等的 `case`。`case` 后必须是编译时可以确定的整数常量，不能写 `score >= 60` 这样的范围条件。

## default 分支

若没有任何 `case` 匹配，程序可以进入可选的 `default`：

```cpp
default:
cout << "unknown operator" << '\n';
break;
```

当输入保证只会出现已经列出的取值时，可以不写 `default`；需要处理其余所有值时，`default` 与 `if` 分支链最后的 `else` 类似。

## break 与贯穿

`break` 会立即结束当前 `switch`。如果省略它，程序会从匹配位置继续执行后续 `case`，这种行为称为**贯穿**（fallthrough）：

```cpp
switch (x) {
case 1:
    cout << "one or two" << '\n';
case 2:
    cout << "two" << '\n';
    break;
}
```

当 `x == 1` 时，上面的程序会输出两行。这通常是漏写 `break` 造成的错误。少数程序会有意让多个值共用同一段代码，但基础写法应在每个独立分支末尾明确写出 `break`。

多个离散值执行完全相同的操作时，可以连续列出空的 `case`：

```cpp
switch (day) {
case 6:
case 7:
    cout << "weekend" << '\n';
    break;
default:
    cout << "weekday" << '\n';
    break;
}
```

`day` 为 `6` 时会继续到 `case 7` 共用的代码，为 `7` 时则直接进入同一段。这里没有在两个非空分支之间隐藏执行过程，意图也很清楚。

## 与 if 的选择

`switch` 只能匹配离散值；[if 与 else](if-and-else.md) 可以表达范围和任意布尔条件。分数段、大小关系和多个条件的组合使用 `if` 更自然，菜单编号才可能适合 `switch`。竞赛中 `if` 的使用频率明显更高。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a;
    int b;
    int operation;
    cin >> operation >> a >> b;

    switch (operation) {
    case 1:
        cout << a + b << '\n';
        break;
    case 2:
        cout << a - b << '\n';
        break;
    case 3:
        cout << a * b << '\n';
        break;
    default:
        cout << "unknown operator" << '\n';
        break;
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3 3 5
```

输出：

```text
15
```

## 基础练习

1. 输入 `1` 到 `7`，用 `switch` 输出对应的英文星期缩写。
2. 删除一个非末尾 `case` 的 `break`，观察贯穿产生的输出。
3. 判断“成绩是否至少为 60 分”为什么不适合写成 `switch`。

## 需要记住什么

1. `switch` 根据什么值选择 `case`？
2. 没有 `case` 匹配时，哪个可选分支会执行？
3. `break` 在 `switch` 中负责什么？省略后会发生什么？
4. 范围条件为什么通常使用 `if / else if`？
5. 怎样让多个离散值清楚地共用同一段代码？
