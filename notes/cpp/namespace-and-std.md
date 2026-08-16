# 命名空间与 `std`

> 最近修订：2026-08-16 12:31 +10:00（未审阅）

两个不同的库或代码模块完全可能都想使用 `value`、`Node` 或 `sort` 这样的名字。如果所有名字都必须放在同一层，它们会互相冲突，也无法从代码中看出一个名字属于哪个模块。

**命名空间**（namespace）为名字增加一层分组。不同命名空间中可以同时存在拼写相同的名字，调用者则明确写出自己需要哪一组。

## 声明命名空间

使用 `namespace` 声明一个命名空间：

```cpp
namespace first {
int value = 10;
}

namespace second {
int value = 20;
}
```

`first` 和 `second` 中各有一个 `value`，但它们是两个不同的名字，不会重复定义。

命名空间也可以包含函数和类型：

```cpp
namespace arithmetic {
int add(int a, int b) {
    return a + b;
}

struct Result {
    int value;
};
} // namespace arithmetic
```

命名空间不是对象，不使用点运算符访问。它为名称建立作用域，因此使用作用域解析运算符 `::`。

## 限定名称

在命名空间外使用其中的名字时，将命名空间与具体名字用 `::` 连接：

```cpp
printf("%d\n", first::value);
printf("%d\n", second::value);
printf("%d\n", arithmetic::add(2, 3));
```

`first::value` 和 `second::value` 都是**限定名称**，它们明确指定查找范围，所以即使末尾都叫 `value` 也不会混淆。

`::` 不只用于命名空间；类、枚举和全局作用域等也会使用它解析名称。本篇只需要识别 `namespace_name::name` 这种形式。

## std 命名空间

[#include](include.md) 让标准头提供的声明参与编译。C++ 标准库的绝大多数
名字位于 `std` 命名空间中，因此完整限定名称写作：

```cpp
std::scanf std::printf std::cin std::cout std::string std::vector std::sort
```

`std` 是 standard 的约定缩写。例如，只包含标准头并始终使用限定名称时，可以写：

```cpp
#include <iostream>

int main() {
    std::cout << "Hello World!" << '\n';
    return 0;
}
```

这份代码没有将 `cout` 放进全局命名空间；`std::cout` 只是明确要求在 `std` 中查找 `cout`。

## using 声明

如果当前作用域会频繁使用某一个名称，可以单独将它引入当前作用域：

```cpp
using std::cin;
using std::cout;
```

之后可以直接使用这两个名字：

```cpp
int x;
cin >> x;
cout << x << '\n';
```

这是 `using` **声明**：它只引入明确列出的名字，没有让 `std` 中的其他名字都可以省略限定。

`using` 声明的有效范围由它所在的作用域决定。放在函数内时，它只影响该函数中后续可见的代码。

## using namespace 指令

也可以让名字查找考虑某个命名空间中的所有名字：

```cpp
using namespace std;
```

这是 `using namespace` **指令**。它不会复制或移动标准库对象，而是改变后续未限定名称的查找。因此可以直接写：

```cpp
cout << "Hello World!" << '\n';
vector<int> a;
sort(a.begin(), a.end());
```

与单个 `using std::cout;` 不同，`using namespace std;` 会让 `std` 中的大量名字成为未限定查找的候选。这会缩短竞赛代码，也会增加与自己名称冲突或产生歧义的可能性。

## 名字冲突

如果同时使两个含有同名对象的命名空间参与未限定查找，直接写名字可能产生歧义：

```cpp
namespace first {
int value = 10;
}

namespace second {
int value = 20;
}

using namespace first;
using namespace second;

printf("%d\n", value); // 错误：无法确定使用哪个 value
```

最直接的解决方法是恢复限定名称：

```cpp
printf("%d\n", first::value);
printf("%d\n", second::value);
```

使用 `using namespace std;` 后出现编译期名称歧义时，也可以在该位置写回 `std::name` 或为自己的变量选择更准确的名字。不要通过猜测编译器会优先选哪一个来忽略歧义。

## 竞赛与工程代码

在很短、独立、单文件的竞赛程序中，缩短高频标准库名字通常比名字冲突的风险更重要。本仓库因此固定使用：

```cpp
#include <bits/stdc++.h>
using namespace std;
```

这是面向竞赛环境的代码风格，不是 C++ 语言的必要固定格式。

在多个团队共同维护、包含许多源文件和头文件的工程中，广泛的 `using namespace std;` 会影响更大范围的名字查找。特别是不应把它写进会被其他文件包含的公共头，否则所有包含者都会被动承受该指令带来的候选名字。这类代码更常保留 `std::` 或只在局部使用单个 `using` 声明。

两种选择服务于不同代码规模。不需要因为工程项目的规范而把竞赛模板中每个名字改成 `std::`，也不应把竞赛单文件习惯无条件复制到公共库头。

## 完整代码

下面的程序在两个命名空间中定义同名函数 `calculate`，然后使用限定名称分别调用它们。标准库名称则按本仓库竞赛风格省略 `std::`。

```cpp
#include <bits/stdc++.h>
using namespace std;

namespace sum {
int calculate(int a, int b) {
    return a + b;
}
} // namespace sum

namespace product {
int calculate(int a, int b) {
    return a * b;
}
} // namespace product

void solve() {
    int a;
    int b;
    scanf("%d%d", &a, &b);

    printf("%d\n", sum::calculate(a, b));
    printf("%d\n", product::calculate(a, b));
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3 5
```

输出：

```text
8
15
```

`sum::calculate` 与 `product::calculate` 拼写相同但限定范围不同，所以它们是可以同时存在的两个函数。

## 基础练习

1. 声明命名空间 `minimum` 和 `maximum`，分别在其中定义 `calculate(int a, int b)`，使用限定名称输出两个函数的结果。
2. 不写 `using namespace std;`，使用 `std::scanf` 和 `std::printf` 改写完整代码。
3. 只写 `using std::printf;`，让 `printf` 可以省略 `std::`，但保留 `std::scanf`。
4. 在两个都包含 `value` 的命名空间后使用两条 `using namespace`，阅读未限定 `value` 的歧义报错，然后使用 `::` 修复。

## 需要记住什么

1. 命名空间解决了什么名称组织问题？
2. `first::value` 中的 `::` 表示什么？它与结构体对象使用的 `.` 有什么不同？
3. 为什么标准库名字常写为 `std::vector`、`std::sort` 或 `std::cout`？
4. `using std::cout;` 与 `using namespace std;` 对后续名字查找的影响有什么不同？
5. 同时引入两个包含同名对象的命名空间时，为什么未限定名称可能产生歧义？如何消除？
6. 本仓库的竞赛代码是否使用 `using namespace std;`？这是语言强制规则还是按代码规模做出的风格选择？

命名空间别名、嵌套命名空间、匿名命名空间、参数相关查找和向 `std` 中添加声明的特殊规则都不是本篇的基础学习目标，不要求理解或记忆。
