# `constexpr`

> 最近修订：2026-08-16 09:22 +10:00（未审阅）

[常量](const.md) 中的 `const` 保证对象初始化以后不能再通过这个名称修改，
却不保证编译器在程序运行前就知道它的值。有些语言位置不仅要求值不变，还要求
这个值能在编译期计算出来，此时可以使用 `constexpr`。

`constexpr` 可以理解为“这个声明应当能够参与常量表达式”。它是比普通
`const` 更强的承诺，但两者回答的问题并不相同。

## 运行时常量仍然是 const

输入得到的数值可以在初始化后保持不变：

```cpp
int n;
cin >> n;

const int size = n;
```

`size` 是常量，后面不能再赋值；但是读取 `n` 时程序已经开始运行，编译器无法
预先知道这次输入。因此下面的声明不成立：

```cpp
constexpr int size = n; // 错误：n 不是常量表达式
```

需要区分两种要求：

- 只要求初始化后不能修改，使用 `const`；
- 还要求值能在编译期得到，使用 `constexpr`。

不要把所有 `const` 机械替换成 `constexpr`。输入、文件和其他运行时计算得到的
结果，本来就不可能成为编译期常量。

## constexpr 变量

`constexpr` 变量必须在声明时用常量表达式初始化：

```cpp
constexpr int MAXN = 200005;
constexpr int BUFFER_SIZE = MAXN + 5;
```

编译器能够在构建程序时算出两个值。`constexpr` 变量也不能在后面修改，因此它
隐含了顶层 `const`：

```cpp
BUFFER_SIZE = 300000; // 错误：constexpr 变量不能修改
```

在竞赛模板中，固定数组容量和固定模数常写成：

```cpp
constexpr int MAXN = 2e5 + 5;
constexpr int MOD = 1000000007;
```

本书仍允许使用常见的 `const int MAXN`。当代码确实依赖“编译期可用”这一性质
时，`constexpr` 能把意图写得更准确。

## 常量表达式能用在哪里

有些 C++ 语法位置要求**整型常量表达式**，不能等到运行时再取得数值。例如内置
数组的长度可以使用 `constexpr` 变量：

```cpp
constexpr int MAXN = 200005;
int value[MAXN];
```

`switch` 的 `case` 标签也必须在编译期确定：

```cpp
constexpr int QUIT = 0;

switch (operation) {
case QUIT:
    break;
}
```

非类型模板实参同样经常需要常量表达式，例如：

```cpp
constexpr int SIZE = 10;
array<int, SIZE> value;
```

这些规则不是因为 `constexpr` 会让普通运算自动变快，而是因为编译器必须在构建
程序结构时就知道相应数值。

## constexpr 函数

`constexpr` 也能修饰函数，表示函数满足在适当条件下参与常量表达式求值的要求：

```cpp
constexpr int square(int x) {
    return x * x;
}
```

当实参是常量表达式，并且结果被需要为常量表达式的上下文使用时，编译器可以在
编译期计算：

```cpp
constexpr int SIXTEEN = square(4);
```

同一个函数也可以接收运行时输入：

```cpp
int n;
cin >> n;
cout << square(n) << '\n';
```

此时 `square(n)` 是运行时计算。`constexpr` 函数不是“必须在编译期执行的函数”，
也不等于 `inline` 或普通意义上的性能优化提示；它只是允许符合条件的调用进入
常量表达式。

## 与 define 宏的区别

固定数值也能写成宏：

```cpp
#define MAXN 200005
```

但宏只在预处理阶段进行记号替换，没有普通 C++ 名称所具有的类型与作用域规则。
能够使用 C++ 常量时，更推荐写：

```cpp
constexpr int MAXN = 200005;
```

这样 `MAXN` 有明确类型，遵循作用域，也能参与编译器的类型检查。宏仍有条件编译
等不可替代的预处理用途，详情见 [#define 宏](define.md)。

## 完整代码

下面的程序同时展示编译期调用和运行时调用：

```cpp
#include <bits/stdc++.h>
using namespace std;

constexpr int BONUS = 5;

constexpr int square(int x) {
    return x * x;
}

void solve() {
    constexpr int FOUR_SQUARED = square(4);

    int n;
    cin >> n;

    cout << FOUR_SQUARED << '\n';
    cout << square(n) + BONUS << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3
```

输出：

```text
16
14
```

`FOUR_SQUARED` 必须在编译期得到；`n` 来自输入，因此 `square(n)` 在运行时计算。

## 常见错误

### 用输入初始化 constexpr

```cpp
int n;
cin >> n;
constexpr int size = n;
```

`n` 的值直到运行时才出现，不能初始化 `constexpr` 变量。若只要求读取后不再修改，
应使用 `const int size = n;`。

### 认为 constexpr 函数只能编译期调用

`constexpr` 函数也能接收普通运行时参数。能否在编译期计算取决于参数、函数执行
路径和使用结果的上下文。

### 把 constexpr 当成加速开关

它表达常量求值能力，不承诺所有调用都会提前计算。普通运行时代码是否内联或优化，
仍由编译器在语言规则允许的范围内决定。

### 用宏替代所有常量

宏没有普通变量的类型与作用域。固定的整型数值优先使用 `const` 或 `constexpr`，
只有真正需要预处理记号替换时再使用宏。

## 需要记住什么

1. `const` 与 `constexpr` 分别保证什么？
2. 为什么由输入初始化的 `const int` 不能改成 `constexpr int`？
3. `constexpr` 变量为什么也不能修改？
4. 哪些语法位置需要编译期常量表达式？
5. `constexpr` 函数是否只能在编译期执行？
6. 固定数值为什么通常优先使用 `constexpr` 而不是宏？

C++20 增加的 `consteval` 和 `constinit`、模板元编程中的常量求值技巧不属于
C++17 竞赛主线；遇到确切用途时再进入相应扩展专题。
