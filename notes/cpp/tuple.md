# 工具类型：tuple

> 最近修订：2026-08-13 04:28 +10:00（未审阅）

[pair](pair.md) 可以把两个相关的值组成一个对象。当一个结果天然包含三个值时，继续嵌套 `pair` 也能保存：

```cpp
pair<int, pair<int, ll>> result;
```

但它把第二、第三个值人为包成了一个内层 `pair`，访问时也变成 `result.second.first` 和 `result.second.second`。这种嵌套并不是问题本身的结构，只是 `pair` 只有两个位置造成的绕路。

`tuple` 用于把固定数量的多个值平行放在一个对象中。竞赛代码中最常见的用法是返回三个或更多个天然属于同一结果的值。

## 声明 tuple

在尖括号中按顺序列出每个成员的类型：

```cpp
tuple<int, int, ll> information;
```

这个对象依次包含两个 `int` 和一个 `ll`。与 `pair<T, U>` 一样，各个成员的类型可以相同，也可以不同。

使用花括号按类型列表的顺序初始化：

```cpp
tuple<int, int, ll> information = {-2, 8, 9};
```

也可以让 `make_tuple` 根据初始值推导类型：

```cpp
auto information = make_tuple(-2, 8, 9LL);
```

`9LL` 使第三个成员的类型为 `long long`。在成员类型已经明确写在左边时，本书仍然优先使用更直接的花括号初始化。

## get 按位置访问

`pair` 有 `first` 和 `second`，`tuple` 却可能包含任意固定数量的成员，因此使用 `get<位置>` 访问：

```cpp
tuple<int, int, ll> information = {-2, 8, 9};
printf("%d\n", get<0>(information));
printf("%d\n", get<1>(information));
printf("%lld\n", get<2>(information));
```

`tuple` 的成员位置是标准库原生接口，因此从 $0$ 开始。对三个成员来说，有效位置是 `0, 1, 2`。

`get` 尖括号中的位置必须在编译时已经确定：

```cpp
int x = get<0>(information);
```

不能把普通运行时变量 `i` 写成 `get<i>(information)` 并用循环遍历。原因是不同位置的成员可以有不同类型，运行时才决定 `i` 时，函数无法拥有一个固定返回类型。

## 返回三个值

假设一个函数需要分析三个整数，同时返回最小值、最大值和总和。这三个值共同构成“分析结果”，但总和使用 `ll` 避免三个 `int` 相加时的范围问题：

```cpp
tuple<int, int, ll> analyze(int a, int b, int c) {
    int minimum = a;
    int maximum = a;

    if (b < minimum) {
        minimum = b;
    }
    if (c < minimum) {
        minimum = c;
    }
    if (b > maximum) {
        maximum = b;
    }
    if (c > maximum) {
        maximum = c;
    }

    ll sum = (ll)a + b + c;
    return {minimum, maximum, sum};
}
```

函数的返回类型已经准确说明三个位置的类型。`return` 后的花括号按同一顺序构造一个 `tuple<int, int, ll>` 对象。

## 结构化绑定

逐个写 `get<0>`、`get<1>`、`get<2>` 能够访问成员，但“位置 $0$”不如“最小值”直接。接收结果时，结构化绑定可以一次为三个成员命名：

```cpp
auto [minimum, maximum, sum] = analyze(a, b, c);
```

方括号中的名称数量必须与 `tuple` 成员数量一致，顺序与返回类型的类型列表一致。

[pair](pair.md#结构化绑定) 已经解释过复制与引用的区别：

```cpp
auto [a, b, c] = values;        // 建立对应值
auto& [a, b, c] = values;       // 引用原成员，可修改
const auto& [a, b, c] = values; // 引用原成员，只读
```

在函数返回的临时结果上，直接使用第一种即可。

## 赋值与比较

相同类型的 `tuple` 可以整体赋值。它们也像 `pair` 一样按字典序比较：从第一个成员开始，只有当前成员相等时，才继续比较下一个。

```cpp
tuple<int, int, int> a = {2, 5, 100};
tuple<int, int, int> b = {2, 6, 0};
printf(a < b ? "Yes\n" : "No\n");
```

输出 `Yes`。第一个成员同为 $2$，第二个成员有 $5<6$，第三个成员不再影响结果。

## tuple、pair 与 struct

| 工具 | 适合的数据 | 成员读取方式 |
| --- | --- | --- |
| `pair` | 语境已经说明含义的两个值 | `first`、`second` 或结构化绑定 |
| `tuple` | 语境已经说明含义的三个或更多固定值 | `get<i>` 或结构化绑定 |
| `struct` | 长期使用、值的数量或业务含义需要明确表达的对象 | 自定义成员名 |

成员达到三个不代表必须使用 `tuple`。若这些值是一个长期存在的题目对象，或调用位置无法立即看出每个位置的含义，使用有名成员的 `struct` 更容易阅读和修改。

## 完整代码

下面的程序读入三个 32 位整数，同时返回最小值、最大值和使用 64 位整数保存的总和。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

tuple<int, int, ll> analyze(int a, int b, int c) {
    int minimum = a;
    int maximum = a;

    if (b < minimum) {
        minimum = b;
    }
    if (c < minimum) {
        minimum = c;
    }
    if (b > maximum) {
        maximum = b;
    }
    if (c > maximum) {
        maximum = c;
    }

    ll sum = (ll)a + b + c;
    return {minimum, maximum, sum};
}

int main() {
    int a, b, c;
    scanf("%d%d%d", &a, &b, &c);

    auto [minimum, maximum, sum] = analyze(a, b, c);
    printf("%d %d %lld\n", minimum, maximum, sum);
    return 0;
}
```

输入：

```text
3 8 -2
```

输出：

```text
-2 8 9
```

函数只进行固定次整数比较和加法，时间与额外空间复杂度都是 $O(1)$。

## 基础练习

1. 声明 `tuple<int, int, int>`，使用 `get<0>`、`get<1>`、`get<2>` 输出三个成员。
2. 使用结构化绑定接收三个成员，再用它们的准确含义命名。
3. 写一个函数，通过 `tuple<ll, ll, ll>` 返回三个整数按输入顺序的平方。
4. 手动比较 `{2, 5, 100}` 与 `{2, 6, 0}`、`{2, 5, 100}` 与 `{2, 5, 99}`，说明由哪个成员决定结果。
5. 分别为“一次函数返回的 `gcd,x,y`”和“学生的姓名、年龄、分数”选择 `tuple` 或 `struct`，说明为什么。

## 需要记住什么

1. `tuple<T, U, V>` 中的类型顺序表示什么？
2. `get<0>` 中的位置为什么从 $0$ 开始？为什么不能换成普通运行时变量？
3. 结构化绑定中的名称数量和顺序必须与什么一致？
4. `tuple` 怎样比较两个对象？
5. 为什么固定的三个自然返回值适合 `tuple`，而长期表示题目对象时通常应使用 `struct`？

`tuple` 的递归内部实现、`tuple_size`、`tuple_element`、`tuple_cat` 和用 `apply` 调用函数都不属于竞赛中的基础使用，不要求理解或记忆。
