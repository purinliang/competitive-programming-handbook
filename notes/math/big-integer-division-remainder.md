# 高精度整数：除以高精度整数

> 最近修订：2026-08-17 01:49 +10:00（未审阅）

当被除数与除数都无法放入普通整数时，除法仍然可以模仿十进制竖式。它会同时得到
商与余数；所谓“高精度取模”不需要另一套算法，直接取除法结束后的余数即可。

本篇先给出非负十进制逐位版本。它容易证明、没有浮点误差，适合真正理解除法。
压位后的商块不再只有 `0..9`，需要二分试商或最高块估商，放在后半解释。

## 商和余数

给定非负被除数 `a` 与正除数 `b`，需要找到唯一的 `q` 与 `r`，满足：

$$
a=bq+r,\qquad 0\leq r<b.
$$

`q` 是商，`r` 是余数。接口自然返回：

```cpp
pair<bigint, bigint> divmod(const bigint& a, const bigint& b)
```

若只需要 `a/b`，取返回值的第一项；若只需要 `a%b`，取第二项。但两项在计算过程中
本来就一起产生，不应把同一遍长除法重复执行两次。

## 从最高位放下一位

维护已经处理过的前缀余数 `remainder`。从被除数最高位向最低位扫描，每次执行：

```text
remainder = remainder * 10 + 当前数字
```

一格一位的高精度把最低位保存在 `d[1]`。乘以 `10` 相当于把所有旧数字向高位移动
一格，再把当前数字放入 `d[1]`：

```cpp
void bring_down(bigint& a, int digit) {
    if (a.n == 1 && a.d[1] == 0) {
        a.d[1] = digit;
        return;
    }

    a.n++;
    a.d.resize(a.n + 5);
    for (int i = a.n; i >= 2; i--) {
        a.d[i] = a.d[i - 1];
    }
    a.d[1] = digit;
}
```

若旧余数为零，直接把唯一数字改成当前位，可以避免制造多余前导零。

## 确定一个商位

放下一位以后，需要找最大的十进制数字 `digit`，满足：

$$
b\times digit\leq remainder.
$$

因为每次循环开始前都有 `remainder<b`，放下一位后：

$$
remainder<10b.
$$

所以商位一定在 `0..9`。可以从 `9` 向下尝试：

```cpp
int quotient_digit = 0;
for (int digit = 9; digit >= 1; digit--) {
    bigint product = multiply_small(b, digit);
    if (compare(product, remainder) <= 0) {
        quotient_digit = digit;
        remainder = subtract(remainder, product);
        break;
    }
}
```

每个位置最多试 9 次，是固定常数。也可以二分 `0..9`，但代码不会因此改变渐进
复杂度，本篇选择更直观的降序试商。

## 为什么余数会重新小于除数

`quotient_digit` 是满足乘积不超过余数的最大数字，所以相减后余数非负。若新余数
仍不小于 `b`，就还能把商位再增加 `1`，与“最大”矛盾。因此相减后重新满足：

$$
0\leq remainder<b.
$$

这个不变量保证下一次放下一位时，新的商位仍然不会超过 `9`。

## 商位放在哪里

扫描被除数的 `d[i]` 时，当前得到的商位也写入 `quotient.d[i]`。最高位置可能得到
零，例如 `1234/7` 的临时商是 `0176`。全部处理完以后调用 `trim()`，得到规范商
`176`。

## 完整代码

```cpp
#include <bits/stdc++.h>

using namespace std;

struct bigint {
    int n;
    vector<int> d;

    bigint() {
        n = 1;
        d.assign(n + 5, 0);
    }

    bigint(const string& s) {
        n = s.size();
        d.assign(n + 5, 0);

        for (int i = 1; i <= n; i++) {
            d[i] = s[n - i] - '0';
        }
        trim();
    }

    void trim() {
        while (n > 1 && d[n] == 0) {
            n--;
        }
        d.resize(n + 5);
    }

    bool is_zero() const {
        return n == 1 && d[1] == 0;
    }

    string str() const {
        string result;
        for (int i = n; i >= 1; i--) {
            result += char('0' + d[i]);
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

bigint subtract(const bigint& a, const bigint& b) {
    assert(compare(a, b) >= 0);

    bigint c;
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
    c.trim();
    return c;
}

bigint multiply_small(const bigint& a, int multiplier) {
    assert(0 <= multiplier && multiplier <= 9);

    bigint c;
    c.n = a.n + 1;
    c.d.assign(c.n + 5, 0);

    int carry = 0;
    for (int i = 1; i <= a.n; i++) {
        int current = a.d[i] * multiplier + carry;
        c.d[i] = current % 10;
        carry = current / 10;
    }
    c.d[a.n + 1] = carry;
    c.trim();
    return c;
}

void bring_down(bigint& a, int digit) {
    assert(0 <= digit && digit <= 9);

    if (a.is_zero()) {
        a.d[1] = digit;
        return;
    }

    a.n++;
    a.d.resize(a.n + 5);
    for (int i = a.n; i >= 2; i--) {
        a.d[i] = a.d[i - 1];
    }
    a.d[1] = digit;
}

pair<bigint, bigint> divmod(const bigint& a, const bigint& b) {
    assert(!b.is_zero());

    bigint quotient;
    quotient.n = a.n;
    quotient.d.assign(quotient.n + 5, 0);

    bigint remainder;
    for (int i = a.n; i >= 1; i--) {
        bring_down(remainder, a.d[i]);

        for (int digit = 9; digit >= 1; digit--) {
            bigint product = multiply_small(b, digit);
            if (compare(product, remainder) <= 0) {
                quotient.d[i] = digit;
                remainder = subtract(remainder, product);
                break;
            }
        }
    }

    quotient.trim();
    remainder.trim();
    return {quotient, remainder};
}

int main() {
    string sa, sb;
    cin >> sa >> sb;

    bigint a(sa);
    bigint b(sb);
    auto [quotient, remainder] = divmod(a, b);
    cout << quotient.str() << '\n';
    cout << remainder.str() << '\n';
    return 0;
}
```

输入：

```text
12345678901234567890 123456789
```

输出：

```text
100000000010
0
```

若题目只问取模，仍然调用一次 `divmod`，使用返回的 `remainder`。

## 正确性

处理完被除数的某个前缀后，维持：

```text
当前前缀 = b * 当前商前缀 + remainder
0 <= remainder < b
```

放下一位把等式两侧对应的前缀扩大十倍并加入当前数字。选择最大的合法商位后，
从余数中减去 `b*quotient_digit`，等式继续成立；最大性又保证新余数重新小于 `b`。

从最高位到最低位完成归纳后，当前前缀就是整个被除数，因此返回的商与余数满足
整数除法定义。

## 复杂度

设被除数有 `n` 位，除数有 `m` 位。每个被除数位置至多尝试 9 个商位；一次
低精度乘法、比较和减法都需要 $O(m)$ 时间。`bring_down` 移动的余数长度也为
$O(m)$，因此总时间复杂度是 $O(nm)$，商和余数使用 $O(n+m)$ 空间。

常数可以通过缓存部分乘积、二分试商或更精确估商降低，但不会改变这个基础版本的
渐进复杂度。

## 压位后的二分试商

内部进制改成 `BASE` 后，算法框架仍然是：

```text
remainder = remainder * BASE + 当前块
寻找最大的 quotient_block，使 divisor * quotient_block <= remainder
remainder -= divisor * quotient_block
```

但商块范围变成 `[0,BASE)`。若 `BASE=10^9`，逐个尝试不再可行。最容易保证正确
的版本是在这个范围内二分；每次用“高精度乘低精度”计算候选乘积并比较。

若被除数与除数分别有 `n,m` 个块，二分版本复杂度为：

$$
O(nm\log BASE).
$$

它很适合验证算法或处理中等规模数据，但每个商块约进行 30 次试探。

## 最高块估商与修正

更高效的基础长除法会先把除数规范化，使最高块足够大，再用余数最高两块和除数
最高块估计商块：

```text
q_hat ≈ (最高余数块 * BASE + 次高余数块) / 最高除数块
```

把 `q_hat` 限制在 `BASE-1` 以内，再用除数的次高块检查估计。随后执行一次
“除数乘 `q_hat` 并按位置相减”：

- 若没有产生最高位借位，估计可用；
- 若产生借位，说明商估大了，把商减一，并把除数加回余数。

这类算法通常称为长除法的规范化估商，经典形式是 Knuth Algorithm D。每个商块
只做常数次乘减与修正，基础复杂度回到 $O(nm)$。实现必须同时处理规范化、双宽
中间值、估商上界与借位修正，明显比十进制教学模板更容易出错。

本书的可读扩展模板优先采用二分试商；若题目真的把大整数除法作为性能瓶颈，应使用
经过验证的成熟实现，而不是临场默写未经测试的估商代码。

## 需要记住什么

1. 为什么高精度除法与取模是同一个算法的两个输出？
2. 十进制长除法怎样维护前缀余数？
3. 为什么每个十进制商位只可能在 `0..9`？
4. 选择最大合法商位后，为什么新余数一定小于除数？
5. 压位后为什么不能继续逐个尝试商块？
6. 二分试商与最高块估商的复杂度和实现风险分别是什么？

## 扩展阅读

[GMP 基础除法](https://gmplib.org/manual/Basecase-Division) 说明成熟大整数库怎样使用
规范化后的最高 limb 估商，并在估计过大时执行加回修正。

