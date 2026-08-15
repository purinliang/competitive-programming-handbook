# IEEE 754 浮点数表示

> 状态：定稿

[浮点类型](floating-point-types.md) 已经足够支持一般竞赛题。本篇进一步解释浮点误差、精度位数、正负零、无穷和 $\mathrm{NaN}$ 从哪里来；这些编码细节很有意思，但不属于主线要求，不要求任何读者理解或记忆。

## binary32 与 binary64

IEEE 754 是主流计算机采用的浮点运算标准。竞赛环境中的 `float` 通常采用 binary32，`double` 通常采用 binary64：

| C++ 类型 | IEEE 754 格式 | 总位数 | 符号位 | 指数字段 | 小数字段 |
| --- | --- | ---: | ---: | ---: | ---: |
| `float` | binary32 | 32 | 1 位 | 8 位 | 23 位 |
| `double` | binary64 | 64 | 1 位 | 11 位 | 52 位 |

三个字段分别负责：

- **符号位** $s$ 决定正负。
- **指数字段** $E$ 控制数量级，也常称为阶码。
- **小数字段** $F$ 保存有效数字的小数部分，也常称为尾数字段。

指数字段越长，可表示的数量级越广；小数字段越长，相邻可表示数之间的间隔越小。

## 正规数

指数字段既不全为 `0`、也不全为 `1` 时，这个数是**正规数**。它的值为

$$
(-1)^s \times 1.F_2 \times 2^{E-\text{bias}}.
$$

下标 2 表示 `1.F` 是二进制数。

### 偏置值

指数字段本身按照无符号整数保存。为了同时表示正指数和负指数，读取时需要减去固定的**偏置值**（bias）：

- binary32 的偏置值是 127。
- binary64 的偏置值是 1023。

例如 binary32 中存储的指数为 130，真正使用的指数就是

$$
130-127=3.
$$

这种把整个指数范围平移到非负区间后再保存的方法，也称为移码表示。

### 隐藏位

一个正规二进制数总能写成

$$
1.F_2 \times 2^e.
$$

最高位一定是 `1`，因此没有必要把它真的存进小数字段。读取时自动补回这个 `1`，就可以凭空多获得一位有效精度：

- binary32 存储 23 位小数，实际有 24 位二进制有效数字。
- binary64 存储 52 位小数，实际有 53 位二进制有效数字。

这就是隐藏位。它不是近似或压缩，而是利用正规二进制表示中“最高位必为 `1`”的固定规律省下一位。

## 非正规数

如果指数字段全为 `0`、小数字段不全为 `0`，隐藏的最高位不再是 `1`，而是 `0`。此时的值为

$$
(-1)^s \times 0.F_2 \times 2^{1-\text{bias}}.
$$

这种数称为**非正规数**（subnormal number）。它牺牲一部分有效精度，把可以表示的数平滑地延伸到 0 附近：

| 格式 | 最小正正规数 | 最小正非正规数 | 最大有限值 |
| --- | ---: | ---: | ---: |
| binary32 | 约 $1.18 \times 10^{-38}$ | 约 $1.40 \times 10^{-45}$ | 约 $3.40 \times 10^{38}$ |
| binary64 | 约 $2.23 \times 10^{-308}$ | 约 $4.94 \times 10^{-324}$ | 约 $1.80 \times 10^{308}$ |

如果没有非正规数，最小正规数与 0 之间会突然留下很大的空档。

## 特殊值

指数字段全为 `0` 或全为 `1` 时，位模式按照下表解释：

| 指数字段 | 小数字段 | 表示的值 |
| --- | --- | --- |
| 全 `0` | 全 `0` | $+0$ 或 $-0$ |
| 全 `0` | 不全为 `0` | 非正规数 |
| 全 `1` | 全 `0` | $+\infty$ 或 $-\infty$ |
| 全 `1` | 不全为 `0` | $\mathrm{NaN}$ |

$+0$ 与 $-0$ 比较时相等，但符号位不同。$+\infty$ 和 $-\infty$ 表示超出有限范围的两个方向。$\mathrm{NaN}$ 是 **Not a Number**，表示没有普通数值结果的浮点运算；它与包括自己在内的任何值进行相等比较，结果都是 `false`。

下面的程序直接构造并输出这些值：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    double positive_zero = 0.0;
    double negative_zero = copysign(0.0, -1.0);
    double positive_infinity = numeric_limits<double>::infinity();
    double negative_infinity = -positive_infinity;
    double nan = numeric_limits<double>::quiet_NaN();

    cout << boolalpha;
    cout << "+0: " << positive_zero << '\n';
    cout << "-0: " << negative_zero << '\n';
    cout << "+inf: " << positive_infinity << '\n';
    cout << "-inf: " << negative_infinity << '\n';
    cout << "NaN: " << nan << '\n';
    cout << "+0 == -0: " << (positive_zero == negative_zero) << '\n';
    cout << "NaN == NaN: " << (nan == nan) << '\n';
    cout << "signbit(+0): " << signbit(positive_zero) << '\n';
    cout << "signbit(-0): " << signbit(negative_zero) << '\n';
}

int main() {
    solve();
    return 0;
}
```

在常见的 Linux + GCC 环境中，输出为：

```text
+0: 0
-0: -0
+inf: inf
-inf: -inf
NaN: nan
+0 == -0: true
NaN == NaN: false
signbit(+0): false
signbit(-0): true
```

不同环境可能把无穷和 $\mathrm{NaN}$ 的文字拼写成其他等价形式。实际判断时使用 `isinf(x)`、`isnan(x)` 和 `signbit(x)`，不要比较输出文字，也不要用 `x == nan` 判断 $\mathrm{NaN}$。

## 十进制精度

binary32 与 binary64 的二进制有效位数是精确的 24 和 53。换算成十进制精度规模：

$$
24\log_{10}2 \approx 7.22,
$$

$$
53\log_{10}2 \approx 15.95.
$$

所以人们常说 `float` 大约有 7 位、`double` 大约有 16 位十进制有效数字。但二进制与十进制的刻度不能整齐对齐，这两个近似值不是对任意十进制数的保证。

C++ 的 `numeric_limits` 因而给出了三种不同指标；三者的正式含义可以在 [C++ 的 `numeric_limits` 成员说明](https://timsong-cpp.github.io/cppwp/n4659/numeric.limits.members) 中查阅：

| 类型 | `digits` | `digits10` | `max_digits10` |
| --- | ---: | ---: | ---: |
| `float` | 24 | 6 | 9 |
| `double` | 53 | 15 | 17 |

- `digits` 是二进制有效位数。
- `digits10` 表示任意不超过这么多位的十进制有效数字都能可靠保存并还原。
- `max_digits10` 表示输出任意已有浮点值时，最多需要多少位十进制有效数字，才能保证读回同一个浮点值。

因此，基础篇采用“`float` 可靠 6 位、`double` 可靠 15 位”的保守结论；“约 7 位”和“约 16 位”只用于建立精度规模的直觉。

## 需要记住什么

本篇没有主线要求理解或记忆的内容。需要解释浮点行为时能够回来查阅即可；读完之后仍然不记得具体位数、偏置值、公式或特殊编码，不影响继续学习。

## 扩展阅读

- [IEEE 754 官方标准页面](https://standards.ieee.org/ieee/754/6210/) 给出标准的正式范围与版本信息。
- [Wikipedia: IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) 提供便于查阅的格式表、编码示意和历史背景。

## 返回基础篇

返回 [浮点类型](floating-point-types.md) 继续主学习路线。
