# 修饰符：const

> 状态：定稿

程序中的有些数值一旦确定就不应再被修改，例如预留数组容量、取模使用的模数和固定方向数组。如果只靠注释说“请勿修改”，后续代码仍然可以误赋值，编译器也无法帮助发现。

`const` 将对象或某种访问方式标记为只读。当代码试图通过该名称或该访问方式修改对象时，编译器会拒绝程序。

## const 对象

在类型前写 `const`，声明一个初始化后不能再赋值的对象：

```cpp
const int MOD = 1000000007;
```

`MOD` 的类型是 `const int`。它必须在声明时得到初值，因为后面不能再通过 `MOD` 向这个对象赋值：

```cpp
const int MOD;    // 错误：没有初始化
MOD = 1000000007; // 错误：不能等到下一行再赋值
MOD = 998244353;  // 错误：不能修改 const 对象
```

本书习惯将全局固定常量写成大写名称：

```cpp
const int MAXN = 2e5 + 5;
const int MOD = 1000000007;
```

`const int` 也可以写成 `int const`，两者表示相同类型。本书在普通对象上统一使用更直观的 `const int`。

## 常量数组

`const` 修饰数组元素类型时，数组中的每个元素都只读：

```cpp
const int DIRECTION_COUNT = 4;
const int dr[DIRECTION_COUNT] = {1, 0, -1, 0};
const int dc[DIRECTION_COUNT] = {0, 1, 0, -1};
```

可以正常读取 `dr[i]` 和 `dc[i]`，但不能修改元素：

```cpp
int next_row = row + dr[i];
dr[i] = 2; // 错误
```

这种写法直接表明方向数组是固定规则，不是算法运行时需要维护的状态。

## 只读不等于编译期已知

`const` 的核心含义是“初始化后不再通过该对象名修改”，并不保证初值一定在编译时就能计算。

使用字面量初始化的 `MAXN` 在编译时已知，可以用作 C++ 数组容量：

```cpp
const int MAXN = 2e5 + 5;
int a[MAXN];
```

但下面的 `size` 来自运行时输入：

```cpp
int n;
scanf("%d", &n);

const int size = n;
```

`size` 初始化之后不能再改，但编译器在编译程序时不知道它的值。因此在标准 C++17 中，它不能用来声明内置数组 `int a[size];`。

判断时分开两个问题：

1. 这个对象初始化后是否允许修改？
2. 它的值是否能在编译时得到？

对象是 `const` 只直接回答第一个问题。编译期常量表达式的完整规则不是本篇的记忆目标；当前只需要会使用由固定整数表达式初始化的 `const int MAXN`。

## 指向 const 对象的指针

学过 [内存与别名：指针](pointers.md) 后，可以让指针提供只读访问：

```cpp
int x = 10;
const int* p = &x;
```

`p` 的类型是“指向 `const int` 的指针”。不能通过 `p` 修改它指向的整数：

```cpp
*p = 20; // 错误
```

这不代表原对象 `x` 自身已经变成 `const`。`x` 原本是可修改的 `int`，仍然可以通过 `x` 直接赋值：

```cpp
x = 20;
printf("%d\n", *p); // 20
```

这里只有“通过 `p` 访问”这条途径是只读的。如果指针指向的原对象本来就是 `const int`，则它必须使用 `const int*` 接收：

```cpp
const int MOD = 1000000007;
const int* p = &MOD;
```

`p` 自身仍然可以改为指向另一个整数：

```cpp
int a = 10;
int b = 20;
const int* p = &a;
p = &b;
```

所以 `const int* p` 限制的是 `*p`，不是 `p`。

## const 指针

将 `const` 写在指针星号之后，表示指针自身不能改变指向：

```cpp
int x = 10;
int* const p = &x;
```

`p` 必须在声明时得到地址，后面不能再向 `p` 赋予另一个地址：

```cpp
int y = 20;
p = &y; // 错误
```

但 `p` 指向的是普通 `int`，所以可以通过它修改 `x`：

```cpp
*p = 30;
```

把两个限制同时写出，就得到一个不能改变指向、也不能通过它修改对象的指针：

```cpp
const int x = 10;
const int* const p = &x;
```

读这类声明时，分别问两个问题即可：

- 星号左边的 `const` 是否让 `*p` 只读？
- 星号右边的 `const` 是否让 `p` 自身不能改变指向？

| 声明 | 可以修改 `*p` | 可以修改 `p` 的指向 |
| --- | --- | --- |
| `int* p` | 是 | 是 |
| `const int* p` | 否 | 是 |
| `int* const p` | 是 | 否 |
| `const int* const p` | 否 | 否 |

## const 引用

学过引用后，可以在被引用类型前加 `const`：

```cpp
int x = 10;
const int& ref = x;
```

`ref` 只提供对 `x` 的只读访问，不能通过 `ref` 赋值：

```cpp
ref = 20; // 错误
```

但 `x` 本身仍然是可修改的 `int`。通过 `x` 修改后，`ref` 读到的是同一对象的新值：

```cpp
x = 20;
printf("%d\n", ref); // 20
```

`const` 引用并没有复制一份对象。它仍然是原对象的别名，只是禁止通过这个别名修改对象。在函数参数中使用 `const` 引用避免复制大对象的方法，属于“函数：参数传递”。

## 完整代码

下面的程序使用只读的方向数量，根据输入方向计算从网格位置 $(row, column)$ 移动一步后的新位置。方向 $0,1,2,3$ 依次表示下、右、上、左。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int DIRECTION_COUNT = 4;
const int dr[DIRECTION_COUNT] = {1, 0, -1, 0};
const int dc[DIRECTION_COUNT] = {0, 1, 0, -1};

void solve() {
    int row;
    int column;
    int direction;
    scanf("%d%d%d", &row, &column, &direction);

    row += dr[direction];
    column += dc[direction];
    printf("%d %d\n", row, column);
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3 5 2
```

输出：

```text
2 5
```

`dr`、`dc` 和 `DIRECTION_COUNT` 都表达固定规则，而 `row`、`column` 和 `direction` 是本次输入与计算使用的状态。`const` 让类型直接体现了这种区别。

## 基础练习

1. 使用 `const int MOD = 1000000007;` 计算并输出两个整数之和对 `MOD` 取模的结果。
2. 声明一个普通 `int x` 和 `const int* p = &x`；通过 `x` 修改原对象，再通过 `*p` 输出新值。
3. 声明 `int* const p = &x`，通过 `*p` 修改 `x`；再尝试让 `p` 指向另一个整数，阅读编译器错误。
4. 用自己的话解释 `const int* const p`中星号两侧的 `const` 分别限制什么。
5. 声明 `int x` 和 `const int& ref = x`，确认通过 `x` 修改后 `ref` 可以读到新值，但不能通过 `ref` 赋值。

## 需要记住什么

1. `const int x = 10;` 对后续代码增加了什么限制？为什么必须在声明时初始化？
2. 为什么 `const` 对象不一定是编译期已知的常量？
3. `const int* p` 中不能修改的是 `p` 还是 `*p`？
4. `int* const p` 中不能修改的是 `p` 还是 `*p`？
5. `const int* const p` 同时增加了哪两个限制？
6. `const int& ref = x` 是否复制了 `x`？为什么仍然不能通过 `ref` 赋值？

编译期常量表达式的完整形式化规则、`constexpr`、类的 `const` 成员函数、`mutable` 和 `const_cast` 都不是本篇的基础学习目标，不要求理解或记忆。
