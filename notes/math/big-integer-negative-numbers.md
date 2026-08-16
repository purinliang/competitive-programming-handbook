# 高精度整数：负数

> 最近修订：2026-08-17 00:58 +10:00（未审阅）

基础高精度整数只保存非负数，减法也要求左操作数不小于右操作数。若题目需要负数，
最直接的扩展不是给数字数组硬加一个“符号位”，而是把整数拆成符号与绝对值：

```text
整数 = 符号 * 绝对值
```

数字数组继续只保存非负绝对值，原来的竖式算法几乎不需要修改；新增的工作主要是
根据符号决定调用绝对值加法还是绝对值减法。

## 为什么不使用固定宽度补码

32 位整数和 64 位整数拥有固定宽度，因此补码中的最高位可以参与表示符号，溢出
也围绕固定的 $2^{32}$ 或 $2^{64}$ 范围讨论。

高精度整数没有预先固定的最高位。若把补码的符号扩展语义直接延伸到任意精度，
`-1` 会概念性地写成：

```text
...111111111
```

实现还要区分无限延伸的符号位与真正保存的数字块。它适合定义任意精度位运算的
语义，却会让普通四则运算、扩容和规范化变得复杂。

本篇只关心整数四则运算，所以采用符号与绝对值。`-1` 保存为：

```text
sign = -1
magnitude = 1
```

负号不进入任何十进制数字位，只在输入解析与输出时出现。

## 三种符号状态

使用：

```cpp
int sign;
```

并约定：

| `sign` | 含义 |
| ---: | --- |
| `-1` | 负数 |
| `0` | 零 |
| `1` | 正数 |

也可以用一个 `bool negative`，但这会让零同时拥有“正零”和“负零”两个表示。三态
符号可以直接让零成为独立状态。

数字 `0` 的规范表示必须唯一：

```text
sign = 0
n = 1
d[1] = 0
```

无论输入是 `0`、`+0`、`-0` 还是许多前导零，最后都要归一化到这一种表示。

## 输入与规范化

输入字符串的第一个字符可能是 `+` 或 `-`。先记录符号，再把剩余十进制数字逆序
存入 `d`：

```cpp
int begin = 0;
sign = 1;
if (s[0] == '-' || s[0] == '+') {
    sign = s[0] == '-' ? -1 : 1;
    begin = 1;
}
```

删除绝对值的前导零后，若只剩数字零，就把 `sign` 改成 `0`：

```cpp
void normalize() {
    while (n > 1 && d[n] == 0) {
        n--;
    }
    d.resize(n + 5);
    if (n == 1 && d[1] == 0) {
        sign = 0;
    }
}
```

规范化不是美观处理。若允许 `-0` 存在，比较、输出和符号乘法都会出现额外边界。

## 先比较绝对值

带符号加减需要知道两个绝对值谁更大。`compare_abs(a,b)` 完全忽略 `sign`，仍按
位数和最高不同数字比较：

```cpp
int compare_abs(const bigint& a, const bigint& b)
```

完整的有符号比较再分情况：

1. 符号不同，负数小于零，零小于正数；
2. 都是正数，绝对值较大的数更大；
3. 都是负数，绝对值较大的数反而更小。

本篇完整模板只实现运算需要的绝对值比较；若题目需要排序，再按以上规则封装完整
比较运算符。

## 同号相加

若 `a` 与 `b` 符号相同，直接相加绝对值，并保留共同符号：

```text
(+7) + (+5) = +(7 + 5)
(-7) + (-5) = -(7 + 5)
```

零作为加法单位元单独处理：

```text
0 + b = b
a + 0 = a
```

## 异号相加

异号相加等价于较大绝对值减去较小绝对值，结果采用较大绝对值原来的符号：

```text
(+7) + (-5) = +(7 - 5)
(-7) + (+5) = -(7 - 5)
```

若绝对值相等，结果为零：

```text
(+7) + (-7) = 0
```

这正是 `compare_abs` 必须先于带符号加法存在的原因。

## 减法转成加法

减去 `b` 等价于加上 `-b`：

$$
a-b=a+(-b).
$$

因此只需复制 `b` 并翻转非零符号，再调用统一的 `add`：

```cpp
bigint opposite(bigint a) {
    a.sign = -a.sign;
    return a;
}

bigint subtract(const bigint& a, const bigint& b) {
    return add(a, opposite(b));
}
```

零的 `sign=0`，取负后仍是 `0`，不会生成负零。

## 乘法符号

绝对值继续使用原来的竖式乘法。非零结果的符号是两个符号的乘积：

```cpp
c.sign = a.sign * b.sign;
```

只要有一个操作数为零，绝对值乘法得到零，`normalize()` 会把结果符号统一改成
`0`。

## 除以低精度整数

除法先对绝对值做竖式，再单独确定商和余数的符号。本篇采用与 C++ 整数除法相同的
约定：商向零取整，余数与被除数同号。例如：

```text
-17 / 5 = -3
-17 % 5 = -2
17 / -5 = -3
17 % -5 = 2
```

无论除数是正数还是负数，绝对值竖式都使用正除数。商的符号由两个操作数的符号
决定，余数的符号只跟随被除数：

```cpp
quotient.sign = a.sign * (divisor < 0 ? -1 : 1);
```

本篇沿用基础篇的“低精度整数”约定，让除数使用 `int`。进入每一步以前
`remainder<|divisor|`，所以 `remainder * 10 + digit` 能安全放入 64 位整数。
不要为了覆盖题目没有要求的 64 位除数，把基础接口扩大成更复杂的宽整数实现。

## 完整代码

下面沿用一格一位的十进制表示，完整实现带符号整数的加法、减法、乘法以及除以
低精度整数。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

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

        n = s.size() - begin;
        d.assign(n + 5, 0);
        for (int i = 1; i <= n; i++) {
            d[i] = s[s.size() - i] - '0';
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
        string result;
        if (sign < 0) {
            result += '-';
        }
        for (int i = n; i >= 1; i--) {
            result += char('0' + d[i]);
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

bigint add_abs(const bigint& a, const bigint& b) {
    bigint c;
    c.sign = 1;
    c.n = max(a.n, b.n) + 1;
    c.d.assign(c.n + 5, 0);

    int carry = 0;
    for (int i = 1; i <= c.n; i++) {
        int current = carry;
        if (i <= a.n) {
            current += a.d[i];
        }
        if (i <= b.n) {
            current += b.d[i];
        }
        c.d[i] = current % 10;
        carry = current / 10;
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

    int borrow = 0;
    for (int i = 1; i <= a.n; i++) {
        int current = a.d[i] - borrow;
        if (i <= b.n) {
            current -= b.d[i];
        }
        if (current < 0) {
            current += 10;
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
        int carry = 0;
        for (int j = 1; j <= b.n; j++) {
            int current = c.d[i + j - 1] + a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % 10;
            carry = current / 10;
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
        ll current = remainder * 10 + a.d[i];
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
    cout << add(a, b).str() << '\n';
    cout << subtract(a, b).str() << '\n';
    cout << multiply(a, b).str() << '\n';
    cout << quotient.str() << ' ' << remainder << '\n';
    return 0;
}
```

输入：

```text
-123 50 10
```

输出：

```text
-73
-173
-6150
-12 -3
```

## 正确性

绝对值加减乘已经由基础高精度竖式保证正确。带符号加法只做不重叠的情况分派：

- 同号时，绝对值相加并保留共同符号；
- 异号时，绝对值较大者减去较小者，并保留较大绝对值的符号；
- 绝对值相等时，结果为零。

这些规则与整数加法的定义完全一致。减法通过 `a+(-b)` 化为已经正确的加法；乘法
先计算绝对值乘积，再使用符号乘法规则。

低精度除法首先对绝对值执行与基础篇相同的竖式，因此得到唯一的非负绝对值商与
余数。随后让商采用两个操作数的符号乘积，并让余数采用被除数的符号，恰好得到
C++ 向零取整的带符号除法语义。

## 常见错误

### 用一个布尔值保存负号，却不清理负零

`negative=true` 与绝对值零可能输出 `-0`。每次运算后都必须规范化零的符号。

### 异号时总用 `a-b`

绝对值减法要求左侧不小于右侧。必须先比较绝对值，并让较大者减较小者。

### 负数比较仍直接比较绝对值

绝对值越大的负数反而越小。`compare_abs` 只能服务于运算分派，不能直接冒充完整的
有符号比较。

### 把输入的负号存进数字数组

`'-'-'0'` 不是合法十进制数字。符号字符必须先单独解析，数字数组只保存绝对值。

## 需要记住什么

1. 为什么普通高精度四则运算更适合“符号 + 绝对值”而不是固定补码？
2. `sign=-1,0,1` 分别表示什么？
3. 为什么零必须只有一种规范表示？
4. 同号相加与异号相加分别调用哪种绝对值运算？
5. 异号相加的结果采用谁的符号？
6. 怎样把带符号减法化成加法？
7. 除以低精度整数时，商和余数的符号分别怎样确定？
8. 为什么 `int` 除数配合 64 位中间变量不会溢出？

## 扩展阅读

若还要支持按位与、按位或、按位异或和按位取反，就必须另行定义任意精度整数的
无限符号扩展语义。它与本篇只处理四则运算的符号表示不是同一个问题。
