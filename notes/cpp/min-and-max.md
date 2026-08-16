# `min` 与 `max`

> 最近修订：2026-08-16 23:54 +10:00（未审阅）

在两个值中选出较小值或较大值非常常见。我们可以用[条件运算符](conditional-operator.md)或 `if / else` 完成选择，但标准库已经提供了 `min` 与 `max`：

```cpp
int smaller = min(a, b);
int larger = max(a, b);
```

`min(a, b)` 返回两者中的较小值，`max(a, b)` 返回较大值。它们只读取参数并产生结果，不会重新排列或修改 `a` 和 `b`。

## 两个值

假设：

```cpp
int a = 3;
int b = 5;
```

那么：

```cpp
int smaller = min(a, b);
int larger = max(a, b);
```

得到：

```text
smaller = 3
larger = 5
```

如果两个参数相等，较小值和较大值当然都是这个共同值。

`min` 与 `max` 不是只能处理整数。只要类型之间有合适的大小关系，就可以比较，例如：

```cpp
double lower = min(3.5, 2.25);
char later = max('a', 'z');
```

字符按照字符编码比较，因此这里的 `later` 是 `'z'`。

## 参数类型要一致

最常用的两个参数版本要求编译器为两边推导出同一个类型。下面的调用会产生编译错误：

```cpp
ll answer = min(10, 20LL);
```

`10` 是 `int` 字面量，`20LL` 是 `long long` 字面量，模板参数无法同时推导成两种类型。应当主动统一类型：

```cpp
ll answer = min(10LL, 20LL);
```

若一个参数来自变量，也应根据真实数据范围选择统一类型：

```cpp
ll limit = 20;
ll answer = min(10LL, limit);
```

不要为了让代码通过编译而随意把更大范围的值转换成 `int`，否则可能丢失数据。

## 多个值

三个值可以逐层比较：

```cpp
int smallest = min(a, min(b, c));
int largest = max(a, max(b, c));
```

先计算内层的两个值，再把结果与剩余值比较。

标准库也支持使用花括号传入一组相同类型的值：

```cpp
int smallest = min({a, b, c});
int largest = max({a, b, c});
```

这种写法会依次比较列表中的元素。列表不能为空，并且其中的值仍应具有一致类型。

如果数据本来保存在数组或 `vector` 中，不要把所有元素手工写进花括号。直接使用循环扫描，或者后续学习标准库的范围最值算法。

## 限制到一个区间

两个函数可以组合，让 `x` 始终落在闭区间 `[lower, upper]`：

```cpp
int bounded = max(lower, min(x, upper));
```

从内向外理解：

1. `min(x, upper)` 先保证结果不大于上界；
2. `max(lower, ...)` 再保证结果不小于下界。

当 `lower <= upper` 时：

- `x < lower` 得到 `lower`；
- `lower <= x && x <= upper` 得到 `x`；
- `x > upper` 得到 `upper`。

标准库还有直接表达相同意图的 `clamp`，但先理解两个最值函数怎样组合，更容易在其他公式中正确使用它们。

## 不会交换原变量

下面的代码只计算两个新值：

```cpp
int smaller = min(a, b);
int larger = max(a, b);
```

执行以后，`a` 和 `b` 保持原值。如果目标是让 `a` 保存原来的 `b`，同时让 `b` 保存原来的 `a`，需要使用标准库的 [`swap`](swap.md)。

## 完整代码

下面的程序读入三个整数，输出其中的最小值和最大值。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a;
    int b;
    int c;
    cin >> a >> b >> c;

    int smallest = min({a, b, c});
    int largest = max({a, b, c});

    cout << smallest << ' ' << largest << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
8 3 5
```

输出：

```text
3 8
```

## 需要记住什么

1. `min(a, b)` 与 `max(a, b)` 分别产生什么结果？
2. 调用它们会不会修改 `a` 和 `b`？
3. 为什么 `min(10, 20LL)` 不能直接推导出统一类型？
4. 怎样使用 `min` 和 `max` 把一个值限制在闭区间内？
5. 多个待比较值已经存入数组时，为什么不应手工写成长花括号列表？
