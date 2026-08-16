# 压位高精度整数

> 最近修订：2026-08-17 01:06 +10:00（未审阅）

基础高精度整数用一个 `int` 保存一位十进制数字，最容易对应竖式，却没有充分使用
一个 `int` 的容量。压位高精度把连续若干位合并成一个数字块，用更少的循环完成
相同运算。

本篇是初中级阶段的附属扩展，不是 OI 赛场上需要默写的主线模板。它面向日常复制
使用，因此不再提供一个只支持非负数的过渡版本，而是直接组合：

- 九位十进制压位；
- 正数、零与负数；
- 完整有符号比较；
- 加法、减法与朴素乘法；
- 高精度整数除以低精度整数，同时返回商与余数。

更基础的竖式推导见 [高精度整数：加法、减法与乘法](big-integer-addition-subtraction-multiplication.md)
和 [高精度整数：除以低精度整数](big-integer-division-by-small-integer.md)。本篇只解释
压位、符号与中间值安全性。

## 数字块就是更大的进制

若每个块保存 `k` 位十进制数字，内部进制就是：

$$
BASE=10^k.
$$

例如每块保存 4 位时：

```text
12345678901234567890
1234 | 5678 | 9012 | 3456 | 7890
```

从低块到高块保存为：

```text
d[1] = 7890
d[2] = 3456
d[3] = 9012
d[4] = 5678
d[5] = 1234
```

一个合法数字块始终满足：

$$
0\leq d[i]<BASE.
$$

原来以 `10` 进位的竖式，只需把 `10` 换成 `BASE`。

## 为什么模板选择九位

模板使用：

```cpp
const int WIDTH = 9;
const int BASE = 1000000000;
```

`WIDTH=9` 表示一个块对应 9 位十进制数字，`BASE=10^9` 是块之间的进位基数。
选择它需要同时检查存储类型、乘法中间类型和进位时机：

1. `BASE-1=999999999` 能放入 `int`；
2. 块乘积与进位使用 64 位整数；
3. 朴素乘法每加入一个块乘积就立即进位。

乘法内层计算：

```cpp
ll current = c.d[i + j - 1] + (ll)a.d[i] * b.d[j] + carry;
```

进入这一步以前：

$$
0\leq c.d[i+j-1]<BASE,
$$

$$
0\leq a.d[i]b.d[j]<(BASE-1)^2,
$$

$$
0\leq carry<BASE.
$$

所以：

$$
current\leq (BASE-1)^2+2(BASE-1)=BASE^2-1<10^{18}.
$$

这个上界与操作数有多少块无关。`BASE=10^{10}` 既不能继续装进 `int`，平方也
超过 64 位整数范围，因此 `10^9` 是这套类型与写法下最大的整十进制位宽。

## 为什么不能先累加整条对角线

有些乘法先执行：

```cpp
c[i + j - 1] += (ll)a[i] * b[j];
```

等所有块乘积累加完再统一进位。此时同一个结果块可能累加
`min(a.n,b.n)` 个接近 `BASE^2` 的乘积，上界变成：

$$
O(\min(n,m)BASE^2).
$$

这个值会随输入长度增长，不能继续使用上面的固定上界。快速乘法正是这种“先完成
卷积，再统一进位”的结构，因此必须重新选择系数范围或使用多个模数恢复系数。

## 符号与绝对值

数字块只保存绝对值，`sign` 单独保存符号：

| `sign` | 含义 |
| ---: | --- |
| `-1` | 负数 |
| `0` | 零 |
| `1` | 正数 |

加减乘除的块运算始终先处理非负绝对值，再决定结果符号。零只有一种规范表示：

```text
sign = 0
n = 1
d[1] = 0
```

输入 `-0` 或运算得到零时，`normalize()` 都会清除负号。带符号运算的完整推导见
[高精度整数：负数](big-integer-negative-numbers.md)。

## 十进制输入与输出

输入先去掉可选的正负号，再从右向左每次截取至多 9 个字符：

```cpp
for (int i = 1; i <= n; i++) {
    int r = length - (i - 1) * WIDTH;
    int l = max(begin, r - WIDTH);
    for (int j = l; j < r; j++) {
        d[i] = d[i] * 10 + s[j] - '0';
    }
}
```

输出时，最高块按真实长度输出；其他块必须补足 9 位。否则数字块中的前导零会
丢失，无法还原原来的十进制位置。

## 加法与减法

绝对值加减仍然把逐位公式中的 `10` 替换为 `BASE`。带符号加法再按符号分派：

- 同号：绝对值相加，保留共同符号；
- 异号：较大绝对值减去较小绝对值，保留较大绝对值的符号；
- 绝对值相等：结果归一化为零。

减法统一写成：

$$
a-b=a+(-b).
$$

完整比较同样先比较符号，再根据正负决定是否反转绝对值比较结果。

## 乘法立即进位

第 `i` 块与第 `j` 块的乘积进入第 `i+j-1` 块。每加入一个块乘积后立即归一化：

```cpp
for (int i = 1; i <= a.n; i++) {
    ll carry = 0;
    for (int j = 1; j <= b.n; j++) {
        ll current = c.d[i + j - 1] + (ll)a.d[i] * b.d[j] + carry;
        c.d[i + j - 1] = current % BASE;
        carry = current / BASE;
    }
    c.d[i + b.n] = carry;
}
```

非零结果的符号是两个操作数符号的乘积。

## 除以低精度整数

竖式从最高块向最低块处理：

```text
current = remainder * BASE + 当前块
当前商块 = current / |divisor|
remainder = current % |divisor|
```

模板让低精度除数使用 `int`。进入每一步以前都有
`remainder<|divisor|`，所以：

$$
current<|divisor|\times BASE<2.15\times 10^{18},
$$

能够放入 64 位整数。即使除数是 `INT_MIN`，先把它转换成 64 位整数再取绝对值也
不会溢出。

返回语义与 C++ 整数除法一致：商向零取整，余数与被除数同号。商可能仍是高精度
整数，余数的绝对值严格小于低精度除数的绝对值，所以最终能返回为 `int`。

## 完整模板

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int WIDTH = 9;
const int BASE = 1000000000;

struct bigint {
    int sign;
    int n;
    vector<int> d;

    bigint() {
        sign = 0;
        n = 1;
        d.assign(n + 5, 0);
    }

    bigint(const string& s) {
        int begin = 0;
        sign = 1;
        if (s[0] == '-' || s[0] == '+') {
            sign = s[0] == '-' ? -1 : 1;
            begin = 1;
        }

        int length = s.size();
        n = max(1, (length - begin + WIDTH - 1) / WIDTH);
        d.assign(n + 5, 0);

        for (int i = 1; i <= n; i++) {
            int r = length - (i - 1) * WIDTH;
            int l = max(begin, r - WIDTH);
            for (int j = l; j < r; j++) {
                d[i] = d[i] * 10 + s[j] - '0';
            }
        }
        normalize();
    }

    void normalize() {
        while (n > 1 && d[n] == 0) {
            n--;
        }
        d.resize(n + 5);
        if (n == 1 && d[1] == 0) {
            sign = 0;
        }
    }

    string str() const {
        if (sign == 0) {
            return "0";
        }

        string result = sign < 0 ? "-" : "";
        result += to_string(d[n]);
        for (int i = n - 1; i >= 1; i--) {
            string part = to_string(d[i]);
            int padding = WIDTH - (int)part.size();
            result += string(padding, '0') + part;
        }
        return result;
    }
};

int compare_abs(const bigint& a, const bigint& b) {
    if (a.n != b.n) {
        return a.n < b.n ? -1 : 1;
    }
    for (int i = a.n; i >= 1; i--) {
        if (a.d[i] != b.d[i]) {
            return a.d[i] < b.d[i] ? -1 : 1;
        }
    }
    return 0;
}

int compare(const bigint& a, const bigint& b) {
    if (a.sign != b.sign) {
        return a.sign < b.sign ? -1 : 1;
    }
    if (a.sign == 0) {
        return 0;
    }

    int order = compare_abs(a, b);
    return a.sign > 0 ? order : -order;
}

bigint add_abs(const bigint& a, const bigint& b) {
    bigint c;
    c.sign = 1;
    c.n = max(a.n, b.n) + 1;
    c.d.assign(c.n + 5, 0);

    ll carry = 0;
    for (int i = 1; i <= c.n; i++) {
        ll current = carry;
        if (i <= a.n) {
            current += a.d[i];
        }
        if (i <= b.n) {
            current += b.d[i];
        }
        c.d[i] = current % BASE;
        carry = current / BASE;
    }
    c.normalize();
    return c;
}

bigint subtract_abs(const bigint& a, const bigint& b) {
    assert(compare_abs(a, b) >= 0);

    bigint c;
    c.sign = 1;
    c.n = a.n;
    c.d.assign(c.n + 5, 0);

    ll borrow = 0;
    for (int i = 1; i <= a.n; i++) {
        ll current = (ll)a.d[i] - borrow;
        if (i <= b.n) {
            current -= b.d[i];
        }
        if (current < 0) {
            current += BASE;
            borrow = 1;
        } else {
            borrow = 0;
        }
        c.d[i] = current;
    }
    c.normalize();
    return c;
}

bigint add(const bigint& a, const bigint& b) {
    if (a.sign == 0) {
        return b;
    }
    if (b.sign == 0) {
        return a;
    }
    if (a.sign == b.sign) {
        bigint c = add_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    int order = compare_abs(a, b);
    if (order == 0) {
        return bigint();
    }
    if (order > 0) {
        bigint c = subtract_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    bigint c = subtract_abs(b, a);
    c.sign = b.sign;
    return c;
}

bigint opposite(bigint a) {
    a.sign = -a.sign;
    return a;
}

bigint subtract(const bigint& a, const bigint& b) {
    return add(a, opposite(b));
}

bigint multiply(const bigint& a, const bigint& b) {
    bigint c;
    c.sign = a.sign * b.sign;
    c.n = a.n + b.n;
    c.d.assign(c.n + 5, 0);

    for (int i = 1; i <= a.n; i++) {
        ll carry = 0;
        for (int j = 1; j <= b.n; j++) {
            ll current = c.d[i + j - 1] + (ll)a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % BASE;
            carry = current / BASE;
        }
        c.d[i + b.n] = carry;
    }
    c.normalize();
    return c;
}

pair<bigint, int> divide(const bigint& a, int divisor) {
    assert(divisor != 0);

    ll positive_divisor = abs((ll)divisor);

    bigint quotient;
    quotient.sign = a.sign * (divisor < 0 ? -1 : 1);
    quotient.n = a.n;
    quotient.d.assign(quotient.n + 5, 0);

    ll remainder = 0;
    for (int i = a.n; i >= 1; i--) {
        ll current = remainder * BASE + a.d[i];
        quotient.d[i] = current / positive_divisor;
        remainder = current % positive_divisor;
    }
    quotient.normalize();

    int signed_remainder = remainder;
    if (a.sign < 0) {
        signed_remainder = -signed_remainder;
    }
    return {quotient, signed_remainder};
}

int main() {
    string sa, sb;
    int divisor;
    cin >> sa >> sb >> divisor;

    bigint a(sa);
    bigint b(sb);
    auto [quotient, remainder] = divide(a, divisor);

    cout << compare(a, b) << '\n';
    cout << add(a, b).str() << '\n';
    cout << subtract(a, b).str() << '\n';
    cout << multiply(a, b).str() << '\n';
    cout << quotient.str() << ' ' << remainder << '\n';
    return 0;
}
```

输入：

```text
-12345678901234567890 98765432109876543210 97
```

输出：

```text
-1
86419753208641975320
-111111111011111111100
-1219326311370217952237463801111263526900
-127275040218913071 -3
```

## 复杂度

设两个操作数分别有 `n`、`m` 个九位块：

- 比较、加法、减法是 $O(\max(n,m))$；
- 除以低精度整数是 $O(n)$；
- 朴素乘法是 $O(nm)$。

压位不会改变大 O 复杂度，但会把一万位十进制整数从一万个数字格缩短到约 1112
个数字块。若乘法规模继续增大，应切换算法，而不是继续扩大 `BASE`。

## 使用边界

这份模板适合需要任意长度十进制整数、完整符号语义和普通四则运算子集的日常程序。
题目只要求一种简单运算时，基础的一格一位版本通常更容易修改和检查。

模板暂不包含：

- 高精度整数除以高精度整数；
- 任意精度按位运算；
- Karatsuba、FFT 或 NTT 快速乘法；
- 自动在多种乘法算法之间选择阈值。

前两项需要新增运算语义，后两项会改变乘法的系数范围和实现结构，不适合继续塞进
这一份初中级扩展模板。

## 需要记住什么

本篇是可查阅的实现扩展，不要求背诵完整模板。使用前应能确认：

1. `WIDTH` 与 `BASE` 分别表示什么？
2. 为什么立即进位的朴素乘法可以安全使用 `BASE=10^9`？
3. 为什么统一累加卷积不能沿用同一个中间值证明？
4. 三态 `sign` 怎样消除负零？
5. 为什么 `int` 除数配合 64 位中间变量不会溢出？
6. 商和余数分别采用什么符号？

## 配套深入篇

[高精度整数：除以高精度整数](big-integer-division-remainder.md) 解释长除法怎样同时
生成商与余数，以及压位后怎样规范化并估计一个商块。

[高精度整数：快速乘法](big-integer-fast-multiplication.md) 解释怎样把数字块乘法
转成卷积，并比较复数 FFT 与多模数 NTT 的安全条件。

[GNU MP 的乘法算法](https://gmplib.org/manual/Multiplication-Algorithms.html) 展示成熟
大整数库怎样按规模在朴素乘法、Karatsuba、Toom 与 FFT 之间切换。
