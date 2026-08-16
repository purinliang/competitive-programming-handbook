# 压位高精度

> 最近修订：2026-08-17 01:22 +10:00（未审阅）

基础高精度用一个 `int` 保存一位十进制数字，最容易对应竖式，但一个格子实际只
使用了 `0..9` 十个状态。若把连续若干位合并成一个数字块，就能用更少的循环完成
相同运算。这种表示称为压位高精度。

本篇不重新推导加减乘除的竖式原理，而是回答三个实现问题：一个块压几位、为什么
不会溢出，以及怎样把基础代码机械地推广到更大的内部进制。最后给出非负整数的
比较、加法、减法、乘法和除以低精度整数的完整模板。

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

原来以 `10` 进位的所有公式，只需把 `10` 换成 `BASE`。

## 为什么模板选择九位

本模板使用：

```cpp
const int WIDTH = 9;
const int BASE = 1000000000;
```

`WIDTH=9` 表示一个块对应 9 位十进制数字；`BASE=10^9` 是块之间的进位基数。

选择它不是因为“九位永远最好”，而是因为本模板同时满足以下条件：

1. 每个块使用 `int`，而 `BASE-1=999999999` 能放入 `int`；
2. 乘法中间值使用 `long long`；
3. 每加入一个块乘积就立即对 `BASE` 进位。

乘法内层计算：

```cpp
ll current = c.d[i + j - 1]
    + (ll)a.d[i] * b.d[j] + carry;
```

进入这一步以前，三部分分别满足：

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
current\leq (BASE-1)^2+2(BASE-1)=BASE^2-1.
$$

当 `BASE=10^9` 时，`current<10^18`，能够放入 64 位整数。这个上界与操作数
有多少块无关。

`BASE=10^10` 既不能让数字块继续使用 `int`，平方也超过 64 位整数范围。因此在
这套类型与乘法写法下，`10^9` 是最大的整十进制位宽。

## 八位与九位的差别

`BASE=10^8` 同样安全，而且为额外的临时加法留下更多余量。`BASE=10^9` 的优势是
块数更少。

若两个操作数各有一万位十进制数字：

| 每块位数 | 每个数的块数 | 朴素乘法的块对数量 |
| ---: | ---: | ---: |
| `8` | `1250` | `1562500` |
| `9` | `1112` | `1236544` |

九位版本的内层迭代约为八位版本的 $79\%$。这通常会略快，但实际运行时间还取决于
处理器、编译器、缓存与整数除法成本；不能只凭位宽保证固定耗时。

每块 4 位也很常见。它让两个块的乘积小于 $10^8$，使用较窄的中间类型也容易理解，
代价是块数更多。选择多少位必须与代码的真实中间值上界一起说明。

## 为什么不能先累加整条对角线

有些乘法先执行：

```cpp
c[i + j - 1] += (ll)a[i] * b[j];
```

等所有块乘积累加完，再统一进位。此时同一个 `c[position]` 可能累加
`min(a.n,b.n)` 个接近 `BASE^2` 的乘积，上界变成：

$$
O(\min(n,m)BASE^2).
$$

它会随着输入长度增长。对角线累加版本不能因为单次乘积能放入 64 位整数，就断言
总和也能放入。本模板逐次进位，正是为了让每一步的上界固定。

## 十进制输入与输出

十进制字符串可以从右向左每次截取至多 9 个字符，直接转换成一个数字块：

```cpp
for (int i = 1; i <= n; i++) {
    int r = length - (i - 1) * WIDTH;
    int l = max(0, r - WIDTH);
    for (int j = l; j < r; j++) {
        d[i] = d[i] * 10 + s[j] - '0';
    }
}
```

输出时，最高块按真实长度输出；其他块必须补足 9 位。否则中间块的前导零会丢失，
各块不能还原到原来的十进制位置。

## 加法与减法

逐位公式中的 `10` 直接替换为 `BASE`：

```cpp
c.d[i] = current % BASE;
carry = current / BASE;
```

减法借位时也不再加 `10`，而是加一个 `BASE`：

```cpp
if (current < 0) {
    current += BASE;
    borrow = 1;
}
```

减法仍要求左操作数不小于右操作数。压位只改变表示方法，不会自动增加符号处理。

## 乘法立即进位

乘法位置关系不变：第 `i` 块与第 `j` 块的乘积进入第 `i+j-1` 块。每加入一个
块乘积后立即归一化：

```cpp
for (int i = 1; i <= a.n; i++) {
    ll carry = 0;
    for (int j = 1; j <= b.n; j++) {
        ll current = c.d[i + j - 1]
            + (ll)a.d[i] * b.d[j] + carry;
        c.d[i + j - 1] = current % BASE;
        carry = current / BASE;
    }
    c.d[i + b.n] = carry;
}
```

上面的上界证明依赖这一段代码的进位位置。若以后为了 Karatsuba 或多项式乘法改成
统一累加，必须重新设计块宽和中间类型。

## 除以低精度整数

竖式除法从最高块向最低块处理。放下当前块后：

```cpp
ll current = remainder * BASE + a.d[i];
```

本模板把除数限制为正 `int`。进入每一步以前 `remainder<divisor`，所以：

$$
current<divisor\times BASE<2.15\times 10^{18},
$$

仍能放入 64 位整数。若把低精度除数扩大成任意 `long long`，这个证明就失效，需要
使用 `__int128`、缩小 `BASE` 或改写除法。

## 完整模板

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int WIDTH = 9;
const int BASE = 1000000000;

struct bigint {
    int n;
    vector<int> d;

    bigint() {
        n = 1;
        d.assign(n + 5, 0);
    }

    bigint(const string& s) {
        int length = s.size();
        n = (length + WIDTH - 1) / WIDTH;
        d.assign(n + 5, 0);

        for (int i = 1; i <= n; i++) {
            int r = length - (i - 1) * WIDTH;
            int l = max(0, r - WIDTH);
            for (int j = l; j < r; j++) {
                d[i] = d[i] * 10 + s[j] - '0';
            }
        }
        trim();
    }

    void trim() {
        while (n > 1 && d[n] == 0) {
            n--;
        }
        d.resize(n + 5);
    }

    string str() const {
        string result = to_string(d[n]);
        for (int i = n - 1; i >= 1; i--) {
            string part = to_string(d[i]);
            int padding = WIDTH - (int)part.size();
            result += string(padding, '0') + part;
        }
        return result;
    }
};

int compare(const bigint& a, const bigint& b) {
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

bigint add(const bigint& a, const bigint& b) {
    bigint c;
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
    c.trim();
    return c;
}

bigint subtract(const bigint& a, const bigint& b) {
    assert(compare(a, b) >= 0);

    bigint c;
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
    c.trim();
    return c;
}

bigint multiply(const bigint& a, const bigint& b) {
    bigint c;
    c.n = a.n + b.n;
    c.d.assign(c.n + 5, 0);

    for (int i = 1; i <= a.n; i++) {
        ll carry = 0;
        for (int j = 1; j <= b.n; j++) {
            ll current = c.d[i + j - 1]
                + (ll)a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % BASE;
            carry = current / BASE;
        }
        c.d[i + b.n] = carry;
    }
    c.trim();
    return c;
}

pair<bigint, int> divide(const bigint& a, int divisor) {
    assert(divisor > 0);

    bigint quotient;
    quotient.n = a.n;
    quotient.d.assign(quotient.n + 5, 0);

    ll remainder = 0;
    for (int i = a.n; i >= 1; i--) {
        ll current = remainder * BASE + a.d[i];
        quotient.d[i] = current / divisor;
        remainder = current % divisor;
    }
    quotient.trim();
    return {quotient, (int)remainder};
}
```

模板没有把所有运算符重载进结构体。竞赛题若只需要其中一两种运算，可以直接删除
没有使用的函数，避免把一个通用大整数类当作必须背诵的黑箱。

## 其他输入进制

若外部数字使用 `p` 进制，并希望按字符直接分块，可以选择：

$$
BASE=p^k,
$$

其中 `k` 是每块保存的 `p` 进制数码数量。选择最大的安全 `k` 时仍需检查：

1. `BASE-1` 能否放入数字块类型；
2. `BASE^2-1` 能否放入乘法中间类型；
3. 低精度除法中的 `divisor*BASE` 能否放入中间类型；
4. 当前算法是否逐个乘积立即进位。

例如十六进制可以选择某个 `16^k`，二进制可以选择某个 `2^k`。若使用无符号块与
无符号双宽中间类型，还能更充分利用机器字；但有符号、无符号混合会引入另一组
转换规则，不放进本篇模板。

内部进制也不必等于外部进制的幂。任意 `p` 进制字符串都能逐个数码执行：

```text
value = value * p + digit
```

转换到内部表示；输出时反复除以 `p` 取余。令 `BASE=p^k` 的主要优势是可以直接
分组读写，而不是高精度整数的必要条件。

## 复杂度

若每块压 `WIDTH` 位，原来 `n` 位十进制数字只需约 `n/WIDTH` 个块。渐进复杂度
仍然是：

- 比较、加法、减法和除以低精度整数为线性；
- 朴素乘法为两个块数之积。

压位不会改变大 O 复杂度，但会显著降低块数和循环常数。规模继续增大时，需要的是
Karatsuba、Toom 或 FFT 等更快乘法，而不是无限扩大 `BASE`。

## 需要记住什么

1. 压位为什么等价于把内部进制从 `10` 改成 `BASE`？
2. `WIDTH` 与 `BASE` 分别表示什么？
3. 本模板为什么可以安全使用 `BASE=10^9`？
4. 立即进位与统一累加后进位的中间值上界有什么区别？
5. 九位相对八位减少了多少块与朴素乘法循环？
6. 为什么除以任意 64 位整数时不能直接沿用当前证明？
7. 处理其他外部进制时，为什么可以选 `BASE=p^k`？

## 扩展阅读

[高精度整数：除以高精度整数](big-integer-division-remainder.md) 会说明十进制逐位
试商，并进一步解释压位以后为什么需要二分试商或最高块估商。

[OI Wiki：高精度计算](https://oi-wiki.org/math/bignum/) 对比了逐位高精度、压位
高精度和更快乘法；[GMP 乘法算法](https://gmplib.org/manual/Multiplication-Algorithms)
展示了成熟大整数库如何按规模在普通乘法、Karatsuba、Toom 与 FFT 之间切换。
