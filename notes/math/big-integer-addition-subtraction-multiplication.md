# 高精度整数：加法、减法与乘法

> 最近修订：2026-08-17 00:58 +10:00（未审阅）

64 位整数只能保存大约 19 位十进制数字。题目若给出数百位甚至上万位的非负整数，
就不能再把整个数放进一个 `long long`，但仍然可以把每一位拆开保存，再模仿小学
竖式完成运算。

本篇先使用最直观的表示：一格保存一位十进制数字。它只实现非负整数的比较、加法、
减法和乘法；减法要求左操作数不小于右操作数。负号与压位优化分别属于扩展阅读。

## 一格保存一位十进制数字

输入先作为 `string` 读入。为了让个位、十位、百位始终位于固定位置，把最低位
数字保存在 `d[1]`：

```text
十进制整数：  12345
数字块下标：  5 4 3 2 1
d[i]：        1 2 3 4 5
```

也就是说：

```text
d[1] = 5
d[2] = 4
d[3] = 3
d[4] = 2
d[5] = 1
```

加法、减法和乘法都要从低位处理进位或借位。低位放在小下标后，循环可以直接从
`1` 向上推进；数字变长时，也只需在数组末尾增加新位置。

`n` 记录当前真实位数，`d` 按本书约定保留 `+5` 余量：

```cpp
struct bigint {
    int n;
    vector<int> d;
};
```

## 从字符串转换

`string` 本身从左到右保存最高位到最低位。构造高精度整数时，把它反向复制到
`d[1..n]`：

```cpp
bigint(const string& s) {
    n = s.size();
    d.assign(n + 5, 0);

    for (int i = 1; i <= n; i++) {
        d[i] = s[n - i] - '0';
    }
    trim();
}
```

自定义数字数组使用从 1 开始的下标；表达式 `s[n-i]` 则保留 `string` 原生的
0-based 下标。这是两套约定相接的输入边界。

输入可能含有前导零。`trim()` 删除最高位多余的零，但至少保留一位表示数字 `0`：

```cpp
void trim() {
    while (n > 1 && d[n] == 0) {
        n--;
    }
    d.resize(n + 5);
}
```

输出时从 `d[n]` 反向输出到 `d[1]`，便能恢复正常十进制顺序。

## 比较

两个非负整数先比较位数。位数较多的一定更大；位数相同时，再从最高位向最低位
寻找第一对不同数字：

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

返回 `-1`、`0`、`1` 分别表示 `a<b`、`a=b`、`a>b`。减法会用它检查结果是否
仍为非负整数。

## 加法

竖式加法从个位开始。当前位置需要相加：

1. `a` 的当前数字；
2. `b` 的当前数字；
3. 上一位产生的进位 `carry`。

```cpp
int current = carry;
if (i <= a.n) {
    current += a.d[i];
}
if (i <= b.n) {
    current += b.d[i];
}

c.d[i] = current % 10;
carry = current / 10;
```

`current % 10` 留在当前位，`current / 10` 进入下一位。结果最多比两个操作数中的
较长者多一位，例如 `999+1=1000`，所以循环额外处理一个位置。

## 减法

本篇的 `subtract(a,b)` 要求 `a>=b`。当前位置先减去右操作数和上一位留下的借位：

```cpp
int current = a.d[i] - borrow;
if (i <= b.n) {
    current -= b.d[i];
}
```

若结果为负，就从更高一位借来一个十：

```cpp
if (current < 0) {
    current += 10;
    borrow = 1;
} else {
    borrow = 0;
}
```

例如计算 `1000-1` 时，借位会连续穿过多个零。最终结果可能出现前导零，所以必须
调用 `trim()`。

## 乘法

数字 `a.d[i]` 的十进制权值是 $10^{i-1}$，`b.d[j]` 的权值是 $10^{j-1}$，
因此它们的乘积应进入结果的第 `i+j-1` 位。

```cpp
for (int i = 1; i <= a.n; i++) {
    int carry = 0;
    for (int j = 1; j <= b.n; j++) {
        int current = c.d[i + j - 1]
            + a.d[i] * b.d[j] + carry;
        c.d[i + j - 1] = current % 10;
        carry = current / 10;
    }
    c.d[i + b.n] = carry;
}
```

这段代码沿着 `b` 的每一位完成一行竖式，并在加入每个数字乘积后立刻进位。计算
`current` 以前：

- `c.d[i+j-1]` 已经在 `[0,9]`；
- `a.d[i]*b.d[j]` 最多是 `81`；
- `carry` 也小于 `10`。

所以 `current<100`。这个上界与操作数有多少位无关；即使两个数各有一万位，
中间变量也不会因为总位数增加而溢出。

> 另一种写法会先把所有落在同一结果位的乘积累加起来，最后再统一进位。那种写法
> 的中间值还要乘上参与累加的数字数量，安全范围与最大输入位数有关，不能直接套用
> 本篇的上界。

两个分别有 `n` 位与 `m` 位的整数相乘，结果最多有 `n+m` 位。最后仍需用
`trim()` 处理乘数为零等情况。

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

bigint add(const bigint& a, const bigint& b) {
    bigint c;
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
    c.trim();
    return c;
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

bigint multiply(const bigint& a, const bigint& b) {
    bigint c;
    c.n = a.n + b.n;
    c.d.assign(c.n + 5, 0);

    for (int i = 1; i <= a.n; i++) {
        int carry = 0;
        for (int j = 1; j <= b.n; j++) {
            int current = c.d[i + j - 1]
                + a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % 10;
            carry = current / 10;
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

示例保证第一个数不小于第二个数。

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

## 正确性

加法与减法按照十进制位从低到高处理。进入第 `i` 位时，更低位置已经得到正确
结果，它们对当前位的全部影响被压缩成唯一的 `carry` 或 `borrow`；按照十进制
除以 `10` 后，余数留在当前位，商传向更高位。因此归纳可得每一位都与竖式结果
相同。

乘法外层固定 `a.d[i]`，内层依次加入它与 `b` 每一位的乘积。每对数字的权值唯一
确定结果位置 `i+j-1`，所以所有竖式部分积不重不漏；每次立即进位只改变同一个
整数的十进制表示，不改变数值。全部数字对处理完后，`c` 就等于 `a*b`。

## 复杂度与实际规模

设两个数分别有 `n`、`m` 位十进制数字：

- 比较、加法和减法需要 $O(\max(n,m))$ 时间；
- 竖式乘法需要 $O(nm)$ 时间；
- 结果使用 $O(n+m)$ 个数字格。

两个一万位整数相乘会处理约一亿对十进制数字。这可以作为理解朴素乘法规模的参考，
但具体运行时间取决于处理器、编译器和实现，不能把“一万位”当作固定的时间边界。
压位会显著减少数字块数量；更大的整数还可以使用 Karatsuba 或 FFT 等更快乘法。

## 常见错误

### 最高位放在 `d[1]`

这样每次进位都可能需要整体移动已有数字。最低位放在 `d[1]` 才能让位权固定并从
小下标自然向上进位。

### 删除数字零的最后一位

`trim()` 必须至少保留一位，否则 `0` 会变成没有任何数字的非法表示。

### 减法没有检查大小

本篇没有符号位。若 `a<b`，借位会越过最高位，不能得到正确负数。

### 乘法统一累加后仍按固定小上界估算

进位时机改变以后，中间值上界也会改变。代码安全性必须根据真正的循环逐项推导。

## 基础练习

1. 写出 `12345` 在 `d[1..5]` 中的实际顺序，再从数组恢复字符串。
2. 模拟 `999+2` 的每一位 `current` 与 `carry`。
3. 模拟 `1000-2`，观察借位怎样穿过零。
4. 说明 `a.d[i]*b.d[j]` 为什么进入 `c.d[i+j-1]`。
5. 使用前导零、数字零和位数不同的操作数测试完整代码。

## 需要记住什么

1. 为什么最低位数字保存在 `d[1]`？
2. `trim()` 为什么必须保留至少一位？
3. 加法的进位与减法的借位分别怎样传递？
4. 本篇减法要求满足什么前置条件？
5. 乘法中两个数字的位置怎样决定结果位置？
6. 为什么当前乘法写法的中间值上界与总位数无关？
7. 一格一位的竖式乘法复杂度是什么？

## 继续学习

[高精度整数：除以低精度整数](big-integer-division-by-small-integer.md) 会沿用同一种
十进制逐位表示，从最高位开始模拟竖式除法。

## 扩展阅读

[高精度整数：负数（正文待写）](../catalog.md#05-数学) 会增加符号、绝对值比较、
带符号运算分派和负零归一化。

[压位高精度（正文待写）](../catalog.md#05-数学) 会把若干十进制数字合并成一个
数字块，严格推导安全 `BASE`，并给出更高效的完整模板。
