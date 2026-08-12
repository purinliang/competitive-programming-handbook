# 高精度整数：加法、减法与乘法

> 最近修订：2026-08-13 04:06 +10:00（未审阅）

64 位整数也只能保存大约 $19$ 位十进制数字。当题目给出数百位甚至数万位的非负整数时，一个 `long long` 已经放不下它，但我们仍然可以模仿竖式计算，分段保存数字并自己处理进位。这就是高精度整数运算。

本篇只实现非负整数的比较、加法、减法和乘法。减法要求左操作数不小于右操作数；负号与带符号运算不属于本篇的基础模板。

## 从逐位存储到压位存储

最直接的方法是用一个数组格存一位十进制数字。这样当然能算，但每个 `int` 只使用了 $0$ 到 $9$ 之间的十个状态，大部分存储空间和运算能力都被浪费了。

一个 `int` 能稳定保存 $0$ 到 $10^8-1$，因此可以把每 $8$ 位十进制数字压入一格：

```cpp
const int WIDTH = 8;
const int BASE = 100000000;
```

例如，十进制整数

```text
12345678901234567890
```

从右向左每 $8$ 位分组后是

```text
1234 | 56789012 | 34567890
```

我们从低位到高位保存这些块：

| 下标 | `1` | `2` | `3` |
| --- | ---: | ---: | ---: |
| `d[i]` | `34567890` | `56789012` | `1234` |

最低位放在 `d[1]`，因为加法、减法和乘法都要从低位开始处理进位或借位。变量 `n` 单独记录当前真实块数，`d` 按照本书统一约定在尾部保留 `+5` 余量。

每块 $8$ 位并不是唯一选择。每块 $4$ 位会让中间数值更小，但块数约是本篇方案的两倍。在乘法中，两个小于 $10^8$ 的块相乘小于 $10^{16}$，能够放入 64 位整数，所以每块 $8$ 位在实现简洁和运算效率之间有很好的平衡。

## 十进制字符串转换

输入首先作为 `string` 读入。转换时从字符串右端向左每次取至多 `WIDTH` 个字符，再用普通十进制累加得到一块：

```cpp
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
```

`d` 是我们自己定义的高精度数字块，因此使用 `1..n`。`string` 的下标则是 C++ 原生接口，所以转换边界仍然使用它的 0-based 下标和左闭右开区间 `[l, r)`。两套约定只在这个输入边界相遇。

输入可能含有前导零。`trim` 删去最高位的零块，但至少保留一块表示数字 $0$：

```cpp
void trim() {
    while (n > 1 && d[n] == 0) {
        n--;
    }
    d.resize(n + 5);
}
```

输出时，最高块不补零；其余每块必须补齐 $8$ 位。否则上例会把中间的 `00001234` 误输出为 `1234`，整个数的位置就会错乱。

## 比较

减法之前需要知道两个非负整数谁更大。先比较真实块数 `n`；块数相同时，再从最高块向最低块找第一个不同的位置：

```cpp
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
```

返回 `-1`、`0`、`1` 分别表示 $a<b$、$a=b$、$a>b$。

## 加法

对每个块，需要相加左操作数、右操作数和上一块产生的进位 `carry`：

```cpp
ll current = carry;
if (i <= a.n) {
    current += a.d[i];
}
if (i <= b.n) {
    current += b.d[i];
}
c.d[i] = current % BASE;
carry = current / BASE;
```

`current % BASE` 留在当前块，`current / BASE` 进入下一块。两个块和一个进位的总和小于 `2 * BASE`，所以 `carry` 只会是 $0$ 或 $1$。

循环多预留一块，用来接收最高位可能产生的进位。最后调用 `trim`：若没有产生新的最高块，就去掉这个零块。

## 减法

本篇的 `subtract(a, b)` 假设 $a\ge b$。从低位向高位计算时，`borrow` 表示上一块是否已经向当前块借了 $1$ 个 `BASE`：

```cpp
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
```

若当前差为负，就在本块加上一个 `BASE`，同时记录下一块还要减去 $1$。由于已经保证 $a\ge b$，最高块处理完后不会留下借位。

减法可能产生最高零块，例如 `100000000 - 1 = 99999999`。因此结束后同样需要 `trim`。

## 乘法

竖式乘法会让 `a.d[i]` 与 `b.d[j]` 两两相乘。因为它们分别表示 `BASE` 的 $i-1$ 次方和 $j-1$ 次方，乘积应当累加到结果的第 $i+j-1$ 块。

不能把所有乘积先堆在结果块中，再统一进位：同一块可能累加很多个接近 $10^{16}$ 的乘积，很快就会超出 64 位整数。

因此每加入一个乘积就立即对 `BASE` 进位：

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

每次计算前，`c.d[i + j - 1]` 已经被前一轮归一化到 `[0, BASE)`；当前乘积小于 $10^{16}$，`carry` 也小于 `BASE`，所以 `current` 能够放入 64 位整数。

两个分别有 $n,m$ 块的数相乘，结果最多有 $n+m$ 块。循环结束后再用 `trim` 处理乘数为零等情况。

## 完整代码

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int WIDTH = 8;
const int BASE = 100000000;

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
            result += string(WIDTH - part.size(), '0') + part;
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
    for (int i = 1; i <= c.n; i++) {
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
            ll current = c.d[i + j - 1] + (ll)a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % BASE;
            carry = current / BASE;
        }
        c.d[i + b.n] = carry;
    }
    c.trim();
    return c;
}

int main() {
    string sa, sb;
    cin >> sa >> sb;

    bigint a(sa);
    bigint b(sb);
    cout << add(a, b).str() << '\n';
    cout << subtract(a, b).str() << '\n';
    cout << multiply(a, b).str() << '\n';
    return 0;
}
```

这里直接用 `cin` 把任意长度的十进制文本读入 `string`，避免为 `scanf` 额外设定一个与题目范围绑定的字符缓冲区。模板不关闭 C++ 与 C 输入输出的默认同步，也不与 `scanf` / `printf` 混用。

示例输入保证第一个数不小于第二个数。

输入：

```text
10000000000000000 2
```

输出：

```text
10000000000000002
9999999999999998
20000000000000000
```

## 复杂度

设两个数分别有 $n,m$ 个压位块。比较、加法和减法的时间复杂度是 $O(\max(n,m))$；竖式乘法的时间复杂度是 $O(nm)$。结果最多需要 $O(n+m)$ 个块。

`WIDTH` 是常数，所以换成十进制位数表示时，渐进复杂度不变；压位主要降低时间和空间的常数。

## 基础练习

1. 手动将 `12345678901234567890` 分成每块 $8$ 位的存储，再按模板的输出规则还原。
2. 用块数组模拟 `9999999999999999 + 2`，记录每一块的 `current` 和 `carry`。
3. 模拟 `10000000000000000 - 2`，观察借位如何穿过一个值为零的块。
4. 用较短的整数手算竖式乘法，并说明 `a.d[i] * b.d[j]` 为什么进入第 `i + j - 1` 块。
5. 使用包含前导零的输入和数字 $0$ 测试三种运算。

## 需要记住什么

1. 什么是压位高精度？为什么它比每格只存一位十进制数字更高效？
2. 本篇的 `BASE` 和 `WIDTH` 分别表示什么？为什么选择 $10^8$？
3. 为什么最低块放在 `d[1]`？
4. 输出时为什么只有最高块不补零？
5. 加法中 `carry` 怎样产生？减法中 `borrow` 怎样传递？
6. 乘法中一对块的乘积为什么累加到 `i + j - 1`？为什么每次累加后就要进位？
7. `subtract(a, b)` 对操作数有什么要求？本篇是否已经实现负数？

## 扩展阅读

[高精度整数：除法与余数（正文待写）](../CATALOG.md#05-数学) 会在同一种压位表示上继续实现长除法。该篇不属于核心学习路线，不影响继续学习后续主线内容。

[高精度整数：负数（正文待写）](../CATALOG.md#05-数学) 会增加符号、绝对值比较、带符号的加减分派以及负零归一化。这些规则不改变本篇的压位和竖式运算原理。
