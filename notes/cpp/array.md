# 序列容器：array

> 最近修订：2026-08-13 04:33 +10:00（未审阅）

[数组：一维数组](one-dimensional-arrays.md) 已经使用内置数组保存一组类型相同、长度固定的元素：

```cpp
int values[5];
```

这种表示连续、直接且高效，但内置数组不是一个具有完整普通对象操作的标准库容器：它不能整体赋值，作为函数参数时还会调整为指针，长度信息不再随参数保留。

`array` 在不改变“类型相同、长度固定、元素连续”这些性质的前提下，把整组元素包成一个能够整体复制、返回和查询长度的标准库容器对象。

## 元素类型与长度

`array` 在尖括号中同时写出元素类型和元素个数：

```cpp
array<int, 5> values;
```

这表示 `values` 恰好包含五个 `int`。长度 `5` 是类型的一部分：

```cpp
array<int, 5> a;
array<int, 7> b;
```

`a` 和 `b` 是两种不同类型的对象，不能直接整体赋值。

长度必须在编译时已经确定。下面这种“先读入 `n`，再声明 `array<int, n>`”的写法不合法：

```cpp
int n;
scanf("%d", &n);
array<int, n> values; // 错误：n 不是编译期常量
```

运行时才知道元素数量时，后续使用 `vector`。

## 初始化

像内置数组一样按顺序使用花括号：

```cpp
array<int, 5> values = {3, 1, 4, 1, 5};
```

初始值个数少于长度时，剩余元素进行值初始化：

```cpp
array<int, 5> values = {3, 1};
```

得到 `3, 1, 0, 0, 0`。若希望所有整数元素从 $0$ 开始，使用空花括号：

```cpp
array<int, 5> values = {};
```

不带初始式的局部 `array<int, 5> values;` 不会自动将五个整数清零，不能在赋值前读取。

## 下标与长度

`array` 是标准库原生容器，使用 0-based 下标。`array<int, 5>` 的有效位置是 `0..4`：

```cpp
values[0] = 3;
values[4] = 5;
```

`size()` 返回元素个数：

```cpp
int n = values.size();
```

因此可以使用普通下标循环遍历：

```cpp
int n = values.size();
for (int i = 0; i < n; i++) {
    printf("%d\n", values[i]);
}
```

本书在题目中自定义的算法对象默认使用 1-based 下标，但直接教学标准库容器时保留它的原生 0-based 接口，不额外增加哨兵和尾部余量。

`operator[]` 不检查越界。`values.at(i)` 会在越界时报告异常，但竞赛代码仍通常在已证明下标合法后使用更直接的 `values[i]`。无论选择哪个接口，都不能用它访问长度之外的元素。

## 首尾元素

非空 `array` 可以用 `front()` 和 `back()` 访问首尾：

```cpp
printf("%d\n", values.front());
printf("%d\n", values.back());
```

它们分别等价于 `values[0]` 和 `values[values.size() - 1]`。返回的是元素的引用，因此也可以用来修改：

```cpp
values.front() = 10;
values.back() = 20;
```

长度为 $0$ 的 `array<T, 0>` 不能调用 `front()` 或 `back()`。竞赛中通常直接声明已知的正长度，不需要为空 `array` 设计额外分支。

## 填充同一个值

`fill(value)` 把每个元素赋成同一个值：

```cpp
array<int, 5> distance;
distance.fill(-1);
```

这与使用循环给五个元素分别赋值的结果相同。`fill` 是成员函数，不是把字节填成某个模式；对 `int` 使用 `-1` 等普通整数值没有字节序或对象表示问题。

## 整体对象操作

内置数组不能整体赋值，而相同类型的 `array` 可以：

```cpp
array<int, 3> a = {1, 2, 3};
array<int, 3> b = a;
```

这会复制三个元素。修改 `b[0]` 不会修改 `a[0]`。

`array` 还可以像普通对象一样按值返回：

```cpp
array<int, 3> neighbors(int x) {
    return {x - 1, x, x + 1};
}
```

相同类型的两个 `array` 按字典序比较：从下标 $0$ 开始，第一个不同元素决定大小。

整体复制和比较都需要按顺序处理元素，对长度为 $N$ 的 `array`，时间复杂度是 $O(N)$。因此函数只读一个可能较大的 `array` 时，通常使用 `const` 引用：

```cpp
ll sum(const array<int, 100>& values) {
    ll result = 0;
    int n = values.size();
    for (int i = 0; i < n; i++) {
        result += values[i];
    }
    return result;
}
```

参数类型中已经包含长度 `100`，不需要另传一个 `n`。但这也意味着函数只接受恰好 `array<int, 100>`，不能直接接收 `array<int, 99>`。

## 存储位置

`array<T, N>` 内部直接包含 $N$ 个连续元素。它不会因为是标准库容器就自动把元素放到堆上。

```cpp
void solve() {
    array<int, 2000005> values;
}
```

当程序实际使用并需要存储全部元素时，这是一个包含数百万个 `int` 的局部对象，与同等大小的局部内置数组一样，在常见竞赛环境中可能导致栈溢出。

需要运行时长度或大块动态存储时，使用后续的 `vector`；需要固定容量的大型全局存储时，内置数组仍然是竞赛中简洁常见的选择。具体原因见 [内存：竞赛程序的常见分区](competitive-program-memory-layout.md)。

## 完整代码

下面的程序读入一周七天的整数温度，输出最低温度、最高温度和总和。题目始终恰好给出七个值，因此固定长度的 `array<int, 7>` 与问题结构一致。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const int DAY_COUNT = 7;

int main() {
    array<int, DAY_COUNT> temperature;
    for (int i = 0; i < DAY_COUNT; i++) {
        scanf("%d", &temperature[i]);
    }

    int minimum = temperature.front();
    int maximum = temperature.front();
    ll sum = 0;

    for (int i = 0; i < DAY_COUNT; i++) {
        if (temperature[i] < minimum) {
            minimum = temperature[i];
        }
        if (temperature[i] > maximum) {
            maximum = temperature[i];
        }
        sum += temperature[i];
    }

    printf("%d %d %lld\n", minimum, maximum, sum);
    return 0;
}
```

输入：

```text
12 15 9 18 21 17 10
```

输出：

```text
9 21 102
```

对一般长度 $N$，读入和扫描所有元素的时间复杂度是 $O(N)$，存储元素的空间复杂度是 $O(N)$。本题中 $N=7$ 是固定常数。

## 基础练习

1. 声明 `array<int, 5>`，使用花括号初始化并通过下标顺序输出。
2. 初始化一个只提供两个数值的 `array<int, 5>`，检查剩余三个元素。
3. 使用 `fill(-1)` 重置整个 `array<int, 5>`。
4. 复制一个 `array`，修改副本的首元素，检查原对象是否变化。
5. 编写 `array<int, 3> neighbors(int x)`，返回 `x - 1`、`x`、`x + 1`。
6. 尝试将 `array<int, 3>` 赋给 `array<int, 4>`，阅读编译器错误并解释为什么长度是类型的一部分。

## 需要记住什么

1. `array<T, N>` 中的 `T` 和 `N` 分别表示什么？`N` 能否在运行时读入？
2. `array<int, 5>` 使用什么下标约定？有效位置是哪些？
3. 如何取得元素个数、首元素和尾元素？
4. `fill(value)` 会对每个元素做什么？
5. `array` 相对内置数组增加了哪些完整对象操作？
6. 为什么只读的较大 `array` 参数通常使用 `const` 引用？
7. 为什么大型局部 `array` 仍然可能导致栈溢出？
8. 什么时候应当使用固定长度的 `array`，什么时候需要后续的 `vector`？

`array` 的零长度特例、`data()` 指针接口、与 C API 的交互以及迭代器类型的完整定义都不属于本篇的基础用法，不要求理解或记忆。

## 下一篇

下一篇 [字符串：string](string.md) 会学习可以在运行时改变长度、并直接表示文本的标准库字符串。
