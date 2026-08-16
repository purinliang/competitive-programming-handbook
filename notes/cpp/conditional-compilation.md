# 条件编译

> 最近修订：2026-08-16 16:10 +10:00（未审阅）

同一份源代码有时需要支持不同的构建方式：本地调试时输出中间状态，提交评测时
去掉调试代码；某段接口只在特定平台存在；一个头文件在同一翻译单元中只能展开
一次。它们的共同点是：**在编译 C++ 代码以前，先决定哪些代码参与本次编译**。

条件编译是预处理的一部分。它根据宏和预处理整数条件保留一个分支，排除其他
分支。它不是运行时的 `if`，也不是 `#define` 的另一种写法。

## 根据宏是否存在选择代码

`#ifdef` 判断一个宏是否已经定义：

```cpp
#ifdef LOCAL
cerr << "debug\n";
#endif
```

如果预处理器已经知道宏 `LOCAL`，中间的代码就会进入后续编译；否则整段代码被
排除。这里不关心 `LOCAL` 被替换成什么，只关心这个宏是否存在。

`#ifndef` 判断宏是否尚未定义：

```cpp
#ifndef ONLINE_JUDGE
cerr << "local test\n";
#endif
```

每个 `#ifdef`、`#ifndef` 或 `#if` 最后都必须由 `#endif` 结束。缩进不能代替
`#endif`，花括号也不能结束预处理条件区域。

## 根据整数条件选择代码

`#if` 会先展开条件中的宏，再把结果作为预处理整数表达式判断。结果非零时保留
该分支，结果为零时排除该分支：

```cpp
#define LOG_LEVEL 2

#if LOG_LEVEL >= 2
cerr << "detailed log\n";
#endif
```

如果条件中出现了没有定义成宏的普通标识符，它在这类表达式中按 `0` 处理。这条
规则容易把拼错的宏名悄悄变成假条件，因此重要的构建开关更适合用 `defined` 明确
检查。

`defined` 有两种等价写法：

```cpp
#if defined(LOCAL)
#endif

#if defined LOCAL
#endif
```

因此，`#ifdef LOCAL` 可以理解为 `#if defined(LOCAL)` 的简写，`#ifndef LOCAL`
可以理解为 `#if !defined(LOCAL)` 的简写。需要组合多个条件时，`defined` 更方便：

```cpp
#if defined(LOCAL) && !defined(ONLINE_JUDGE)
cerr << "local debug\n";
#endif
```

## 多个互斥分支

条件编译也能像普通条件分支一样继续判断：

```cpp
#if LOG_LEVEL >= 2
cerr << "detailed log\n";
#elif LOG_LEVEL == 1
cerr << "brief log\n";
#else
// 不输出日志
#endif
```

预处理器从上到下判断，只保留第一个成立的分支；如果前面的条件都不成立，就保留
`#else` 分支。`#elif` 和 `#else` 只能出现在尚未结束的条件区域中。

条件区域可以嵌套，但每一层都需要自己的 `#endif`。嵌套太深时很难看出一个结束
指令对应哪一层，应该优先简化构建条件。

## 从编译命令定义宏

宏不一定写在源文件中。GNU C++ 的 `-D` 选项可以在构建时定义宏：

```text
g++ -std=c++17 -DLOCAL main.cpp
```

这相当于让本次预处理从一开始就知道 `LOCAL` 已定义，但不会在源文件中永久加入
一行 `#define LOCAL`。也可以为宏提供替换值：

```text
g++ -std=c++17 -DLOG_LEVEL=2 main.cpp
```

`-D` 是 GNU 编译器的命令行接口，不是 C++17 源代码语法。其他工具可能使用不同
的配置方式。

## 条件编译与普通 if

两者最根本的区别是选择发生的阶段：

| 写法 | 选择时间 | 能否读取本次输入 | 未选择分支是否进入本次编译 |
| --- | --- | --- | --- |
| `#if` | 预处理时 | 不能 | 不进入 |
| `if` | 程序运行时 | 能 | 仍然进入 |

例如，下面的 `x` 是运行时读入的变量，不能用于 `#if`：

```cpp
int x;
cin >> x;

if (x > 0) {
    cout << "positive\n";
}
```

被条件编译排除的 C++ 代码不会完成当前构建的普通语法和类型检查。因此“当前配置
能够编译”不能证明其他配置也能编译；长期保留的每一种宏组合都需要实际构建。

## include guard

传统头文件使用条件编译避免内容在同一翻译单元中重复展开：

```cpp
#ifndef POINT_H
#define POINT_H

struct Point {
    int x;
    int y;
};

#endif
```

第一次遇到这个头时，`POINT_H` 尚未定义，正文得以保留并立即定义标志。以后在同一
翻译单元中再次遇到它，`#ifndef POINT_H` 不再成立，整个正文被排除。这种结构称为
include guard。

许多编译器也支持 `#pragma once`，但它不是 C++17 标准规定的预处理指令。本仓库
的竞赛模板是独立 `.cpp` 文件，不需要自行维护 include guard。

## 预定义宏

实现可以预先提供宏。标准宏 `__cplusplus` 表示本次构建使用的 C++ 语言标准版本：

```cpp
#if __cplusplus >= 201703L
// 使用 C++17 或更新标准编译
#endif
```

编译器、操作系统和评测平台还可能提供自己的宏。它们的含义由相应环境规定，使用
以前应查阅平台文档，不要只根据名称猜测。

## 完整代码

下面的程序始终输出正确答案；只有使用 `-DLOCAL` 构建时，调试信息才会进入程序：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a;
    int b;
    cin >> a >> b;

#ifdef LOCAL
    cerr << "a = " << a << ", b = " << b << '\n';
#endif

    cout << a + b << '\n';
}

int main() {
    solve();
    return 0;
}
```

普通构建：

```text
g++ -std=c++17 main.cpp
```

本地调试构建：

```text
g++ -std=c++17 -DLOCAL main.cpp
```

输入：

```text
3 5
```

两种构建的标准输出都是：

```text
8
```

调试构建还会向标准错误流输出 `a` 和 `b` 的值，不会污染提交答案使用的标准输出。

## 常见错误

### 把 `#ifdef NAME` 理解成判断 NAME 的值

`#ifdef` 只判断宏是否存在。即使写了 `#define NAME 0`，`#ifdef NAME` 仍然成立；
需要判断替换值时使用 `#if NAME`。

### 把条件编译当成运行时分支

预处理器不能读取 `cin` 得到的值，也不能根据一次程序运行中的状态改变分支。

### 拼错 `#if` 中的宏名

未定义标识符会按 `0` 处理，拼写错误可能不会直接报错。使用 `defined(...)` 并让
每种重要配置都参与构建更可靠。

### 只测试一个宏组合

被排除的代码没有进入本次编译。开启和关闭构建开关时都应至少编译一次。

### 忘记或错配 `#endif`

嵌套条件的结束位置由预处理指令决定，与 C++ 花括号无关。保持条件区域短小，并
让缩进反映嵌套层级。

## 需要记住什么

1. 条件编译在程序运行以前还是运行时选择代码？
2. `#ifdef NAME` 与 `#if NAME` 分别判断什么？
3. `#ifdef NAME` 可以改写成怎样的 `defined` 表达式？
4. `#elif`、`#else` 和 `#endif` 分别承担什么作用？
5. GNU C++ 的 `-DLOCAL` 对本次构建做了什么？
6. 为什么被排除的代码不能算作已经通过编译？
7. include guard 为什么能阻止一个头重复展开？
8. 条件编译为什么不能替代读取输入后的普通 `if`？
