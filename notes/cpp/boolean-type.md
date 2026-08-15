# 布尔类型

> 最近修订：2026-08-16 07:03 +10:00（未审阅）

程序经常只需要记录一个问题的答案：某个点是否访问过、一个操作是否成功、两个数是否相等、当前开关是否打开。这些问题只有“是”和“否”两种结果，没有必要用任意整数或字符表达。

C++ 使用 `bool` 专门保存这类二选一状态。它只有两个值：`true` 表示真，`false` 表示假。

## 两种取值

`true` 和 `false` 是 C++ 的布尔字面量，可以直接赋给 `bool`：

```cpp
bool visited = false;
bool operation_succeeded = true;
```

变量名应该描述“什么事情为真”。于是：

- `visited == true` 表示“已经访问”；
- `operation_succeeded == false` 表示“操作没有成功”。

这比约定 `0` 表示未访问、`1` 表示已访问更明确。读到 `bool visited` 时，我们立刻知道它只负责保存一个真假状态。

## 状态标记

假设算法开始时还没有访问点 $3$，可以把对应标记初始化为 `false`：

```cpp
bool visited = false;
```

真正访问它以后，再把状态改成 `true`：

```cpp
visited = true;
```

`bool` 只保存当前状态，不会记录状态改变过多少次，也不会记录改变发生的时间。如果需要计数，就应该另用 `int`；如果只关心“是否发生过”，`bool` 才是准确类型。

数组章节学完以后，我们会经常看到：

```cpp
bool visited[MAXN];
```

其中 `visited[u]` 专门表示编号为 `u` 的点是否已经访问。DFS、BFS、筛法和许多模拟题都会使用这种标记。

## 判断的结果

比较两个值时，答案天然只有真和假。例如判断 `a` 是否等于 `b`：

```cpp
bool same = a == b;
```

`==` 表示“是否相等”，不会修改两边的变量：

- 若 `a` 与 `b` 相等，表达式 `a == b` 得到 `true`；
- 若二者不相等，表达式得到 `false`。

其他比较也会得到 `bool`：

```cpp
bool smaller = a < b;
bool enough = score >= 60;
```

这说明 `bool` 不只是手动写入的标记，也是程序进行判断后得到的结果。各种比较符号的完整规则会在后面的 [比较运算符](comparison-operators.md) 中解释；本篇先使用最直观的 `==`。

## 输出格式

直接用 `cout` 输出 `bool` 时，`false` 显示为 `0`，`true` 显示为 `1`：

```cpp
bool first = false;
bool second = true;

cout << first << ' ' << second << '\n';
```

输出：

```text
0 1
```

使用 `boolalpha` 后，可以改为输出英文单词 `false` 和 `true`：

```cpp
cout << boolalpha;
cout << first << ' ' << second << '\n';
```

输出：

```text
false true
```

`boolalpha` 会继续影响后面的布尔输出，直到使用 `noboolalpha` 恢复 `0` 和 `1`。算法竞赛通常按照题目要求自行输出 `Yes`、`No` 或其他文字；`boolalpha` 更适合本地观察变量。

## 整数与布尔值

`bool` 属于整数类型，但它的行为很特殊。把整数转换成 `bool` 时：

- 整数 `0` 变成 `false`；
- 任何非零整数都变成 `true`。

```cpp
bool a = 0;
bool b = 1;
bool c = -7;

cout << boolalpha << a << ' ' << b << ' ' << c << '\n';
```

输出：

```text
false true true
```

因此 `bool` 不是只能保存 `0` 或 `1` 的“小号 `int`”。无论原整数是多少，它最终只保留“是否为零”这一条信息。

反过来，把 `false` 用在整数环境中得到 `0`，把 `true` 用在整数环境中得到 `1`。这种转换偶尔有用，但普通代码应优先保持布尔含义，不要用 `true + true` 代替清楚的整数 `2`。

`signed bool` 和 `unsigned bool` 都不是合法类型。`bool` 已经由语言固定为只有真假两种状态，不需要再添加符号修饰。

## 布尔输入

默认情况下，`cin >> flag` 使用整数形式读取 `bool`：输入 `0` 得到 `false`，输入 `1` 得到 `true`。

```cpp
bool flag;
cin >> flag;
cout << boolalpha << flag << '\n';
```

竞赛题很少直接要求输入一个 C++ 布尔值。题面通常会给出 `0/1`、`Yes/No`、字符或某个条件，程序再把它转换成自己的 `bool` 状态。因此最常见的来源仍然是比较表达式，而不是直接读取 `bool`。

## 完整代码

现在解决一个最小判断问题：输入两个整数，判断它们是否相等。相等输出 `true`，不相等输出 `false`。

程序需要三个步骤：

1. 读入两个 `int`；
2. 用 `a == b` 得到一个 `bool`；
3. 使用 `boolalpha` 输出真假单词。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a;
    int b;
    cin >> a >> b;

    bool same = a == b;
    cout << boolalpha << same << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
5 5
```

输出：

```text
true
```

若输入改为：

```text
5 8
```

输出变为：

```text
false
```

变量 `same` 的名称直接说明了 `true` 的含义。如果把它命名为含义模糊的 `flag`，程序虽然仍能运行，却需要额外寻找这个标记究竟代表什么。

## 条件分支中的 bool

`if` 括号中需要的正是一个真假条件：

```cpp
if (same) {
    cout << "equal\n";
}
```

当 `same` 是 `true` 时执行花括号中的语句，为 `false` 时跳过。也可以直接把产生 `bool` 的比较放进去：

```cpp
if (a == b) {
    cout << "equal\n";
}
```

这两种写法表达同一个判断。需要在后面重复使用结果时保存为变量，只使用一次时可以直接写条件。[条件分支](conditional-branches.md) 会完整解释 `if` 的执行过程。

## 常见错误

### 混淆赋值与相等判断

```cpp
bool same = a = b;
```

中间的单个 `=` 会把 `b` 赋给 `a`，再把赋值结果转换成 `bool`，它不是“判断是否相等”。比较相等必须写两个等号：

```cpp
bool same = a == b;
```

### 假设只有 1 能转换成 true

`2`、`-1` 和其他所有非零整数都会转换成 `true`。只有整数 `0` 转换成 `false`。

### 用 bool 记录数量

若要记录访问次数，变量应该是 `int visit_count`。`bool visited` 只能回答是否访问过；第二次赋值为 `true` 不会让它变成 `2`。

## 需要记住什么

1. `bool` 有哪两个值？它们分别表示什么？
2. 为什么“是否访问过”适合用 `bool`，“访问次数”却不适合？
3. 比较表达式 `a == b` 的结果是什么类型？
4. `cout` 默认怎样输出 `false` 和 `true`？`boolalpha` 会怎样改变结果？
5. 整数 `0`、`1` 和 `-7` 分别会转换成哪个布尔值？
6. 单个 `=` 与两个等号 `==` 有什么不同？
7. 为什么 `bool` 不需要也不能写成 `unsigned bool`？

`bool` 的具体存储位数、对象表示和底层编码不要求理解或记忆。真正需要掌握的是：用它表示二选一状态，并知道比较表达式会产生布尔结果。
