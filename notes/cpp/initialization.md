# 初始化

> 最近修订：2026-08-16 21:53 +10:00（未审阅）

程序第一次读取一个对象以前，必须让它拥有符合类型规则的确定状态。问题在于，
“没有显式写初值”并不总会产生同一种结果：普通局部整数可能没有确定值，全局整数
会先变成零，而 `string` 和 `vector` 会建立可以正常使用的空对象。

**初始化**发生在对象开始存在时。它与对象建立以后再次写入新值的赋值不同。本篇
集中比较竞赛中最常见的初始化规则，不展开完整 C++ 初始化语法体系。

## 局部内置对象不会自动清零

函数中的普通局部内置对象如果没有初始化器，不会自动得到可以依赖的零：

```cpp
void solve() {
    int value;
    int a[3];
}
```

在给 `value` 或数组元素写入确定值以前读取它们，会产生未定义行为。内存中偶然
出现零不构成语言保证，换一次编译、优化或运行环境就可能得到不同现象。

如果变量马上由保证成功的输入写入，可以先声明再读入：

```cpp
int value;
scanf("%d", &value);
```

否则应在创建时给出真实初值：

```cpp
int count = 0;
int answer = first_candidate;
```

初始化不等于把所有变量机械设为零。初值应表达算法开始时的真实状态。

## 静态存储期对象先零初始化

全局对象和 `static` 局部对象具有静态存储期。对普通整数和数组，即使没有显式
初始化器，也会在程序开始阶段先得到零：

```cpp
int global_value;
int global_array[3];

void count_calls() {
    static int calls;
    calls++;
}
```

这里 `global_value`、`global_array` 的全部元素和 `calls` 都从零开始。`static`
局部对象仍然只有局部名称作用域，只是对象会跨越多次调用持续存在。

这解释了为什么传统竞赛代码中的全局大型数组天然为零，但不能反过来认为所有局部
数组也会清零。需要明显初值时，本书仍会写出 `= 0` 或 `{}`，让代码意图直接可见。

## 空花括号建立零状态

对本篇使用的普通整数、数组和只含这些成员的结构体，空花括号可以建立零状态：

```cpp
int value{};
int a[3]{};

struct Point {
    int x;
    int y;
};

Point point{};
```

`value`、三个数组元素以及 `point.x`、`point.y` 都是零。数组只提供部分初值时，
剩余元素也会进行值初始化：

```cpp
int a[4] = {5, 8};
```

结果是 `5, 8, 0, 0`。这与完全不写初始化器的普通局部数组不同。

## 类类型会执行默认构造

没有显式初值的类类型对象会按照该类型的默认构造规则建立。标准库的 `string` 和
`vector` 都能建立合法空对象：

```cpp
string text;
vector<int> values;
```

此时 `text.size()` 和 `values.size()` 都是零。它们不是“装有随机元素的对象”，
也不需要先赋值成某个特殊空值才能使用。

这条规则不能机械推广到结构体中的内置成员：

```cpp
struct Point {
    int x;
    int y;
};

Point point;
```

`Point` 没有为两个整数成员提供初值，普通局部 `point.x` 和 `point.y` 仍不能在写入
以前读取。写成 `Point point{};` 才会让这两个成员成为零。

## `vector` 的长度与容量

构造时提供元素个数，会直接创建这些元素。`int` 元素进行值初始化，初值为零：

```cpp
vector<int> values(5);
```

现在 `values.size()` 是 `5`，五个元素都是零。也可以明确指定统一初值：

```cpp
vector<int> values(5, -1);
```

几个容易混淆的操作分别改变不同东西：

| 操作 | 元素个数 | 已有元素怎样处理 |
| --- | ---: | --- |
| `assign(n, value)` | 变成 `n` | 全部替换成 `value` |
| `resize(n)` | 变成 `n` | 保留未删除的旧元素；新 `int` 为零 |
| `reserve(n)` | 不变 | 只预留容量，不创建元素 |

因此下面的 `values` 仍然没有元素：

```cpp
vector<int> values;
values.reserve(5);
```

`values.size()` 仍是零，不能因为容量已经足够就访问 `values[0]`。完整容器接口与
失效规则见 [`vector`](vector.md)。

## 完整代码

下面的程序同时观察静态对象、花括号初始化、空标准库对象和指定长度的 `vector`：

```cpp
#include <bits/stdc++.h>
using namespace std;

int global_value;
int global_array[3];

struct Point {
    int x;
    int y;
};

void solve() {
    int local_value{};
    int local_array[3]{};
    Point point{};
    string text;
    vector<int> values(3);
    vector<int> reserved;
    reserved.reserve(3);

    printf("%d %d\n", global_value, global_array[0]);
    printf("%d %d\n", local_value, local_array[0]);
    printf("%d %d\n", point.x, point.y);
    printf("%zu %zu\n", text.size(), values.size());
    printf("%zu\n", reserved.size());
}

int main() {
    solve();
    return 0;
}
```

输出：

```text
0 0
0 0
0 0
0 3
0
```

程序没有读取任何未初始化值。最后一个零说明 `reserve(3)` 没有建立三个元素。

## 常见错误

### 认为所有未显式初始化的整数都是零

静态存储期整数会先零初始化，普通局部内置整数不会。先判断对象的类型、存储期和
初始化语法，不能只看它们都写成了 `int`。

### 把空 `string` 当作未初始化字符数组

`string text;` 会执行默认构造，得到长度为零的合法对象。它与没有初始化器的普通
局部字符数组不是同一套规则。

### 把 `reserve` 当成 `resize`

`reserve` 只准备容量，不改变元素个数。需要通过下标访问 `0..n-1` 时，应先真正
创建 `n` 个元素。

### 以为结构体名称会自动初始化成员

没有构造函数或默认成员初值时，普通局部结构体中的内置成员仍可能没有确定值。
使用 `{}`、成员初值或构造函数建立所需状态。

## 需要记住什么

1. 初始化与赋值分别发生在对象存在过程的哪个阶段？
2. 没有初始化器的普通局部 `int` 和全局 `int` 是否都从零开始？
3. `int a[5]{}` 与普通局部 `int a[5];` 的元素初值有什么区别？
4. 为什么 `string text;` 和 `vector<int> values;` 都是可以正常使用的空对象？
5. `vector<int>(n)` 会建立多少个元素？这些 `int` 的初值是什么？
6. `assign`、`resize` 和 `reserve` 分别怎样影响元素个数？
7. 为什么 `reserve(n)` 后仍不能直接访问第一个元素？
