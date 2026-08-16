# 高精度整数：除以低精度整数

> 最近修订：2026-08-17 01:05 +10:00（未审阅）

一个高精度整数可能有数千位，但除数有时只是普通的正整数。商仍可能非常长，余数
却一定小于除数。我们可以沿用一格一位的十进制表示，从最高位开始模拟小学竖式，
一次得到高精度商和低精度余数。

## 为什么除法从最高位开始

[高精度整数：加法、减法与乘法](big-integer-addition-subtraction-multiplication.md)
把最低位保存在 `d[1]`。加减乘从低位处理进位，因此从小下标向大下标遍历；除法
必须先得到高位留下的余数，遍历方向恰好相反。

例如计算 `1234/7`：

| 放下的数字 | 临时被除数 | 当前商位 | 新余数 |
| ---: | ---: | ---: | ---: |
| `1` | `1` | `0` | `1` |
| `2` | `12` | `1` | `5` |
| `3` | `53` | `7` | `4` |
| `4` | `44` | `6` | `2` |

包含最前面的零商位时得到 `0176`，去掉前导零后，商是 `176`，余数是 `2`。

## 放下一位

进入某一步时，`remainder` 是处理完所有更高位以后留下的余数。放下当前十进制
数字 `a.d[i]`，相当于把余数乘以 `10` 后再加这一位：

```cpp
ll current = remainder * 10 + a.d[i];
quotient.d[i] = current / divisor;
remainder = current % divisor;
```

每一步结束后都有：

$$
0\leq remainder<divisor.
$$

因此放下一位后：

$$
0\leq current<divisor\times 10.
$$

当前商位一定在 `[0,9]`，恰好是一位十进制数字。

即使 `divisor` 是正的 32 位整数，`remainder*10` 也可能超出 `int`，所以
`current` 与计算过程中的 `remainder` 使用 64 位整数。最终余数严格小于除数，
再转换回 `int`。

## 返回商和余数

设被除数为 `a`、正除数为 `b`，结果必须满足：

$$
a=bq+r,\qquad 0\leq r<b.
$$

商 `q` 可能仍有数千位，使用 `bigint`；余数 `r` 使用 `int`。函数用
`pair<bigint,int>` 同时返回两项：

```cpp
pair<bigint, int> divide(const bigint& a, int divisor)
```

除数必须大于零。除以零没有定义；负数的商和余数还涉及符号约定，不属于本篇。

## 去掉商的前导零

最高几位可能不够除，产生值为零的商位。全部数字处理完成后，对商调用 `trim()`：

```cpp
quotient.trim();
```

若被除数小于除数，所有商位都是零，`trim()` 仍会保留一个零，规范表示商 `0`。

## 完整代码

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

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

pair<bigint, int> divide(const bigint& a, int divisor) {
    assert(divisor > 0);

    bigint quotient;
    quotient.n = a.n;
    quotient.d.assign(quotient.n + 5, 0);

    ll remainder = 0;
    for (int i = a.n; i >= 1; i--) {
        ll current = remainder * 10 + a.d[i];
        quotient.d[i] = current / divisor;
        remainder = current % divisor;
    }
    quotient.trim();
    return {quotient, (int)remainder};
}

int main() {
    string s;
    int divisor;
    cin >> s >> divisor;

    bigint a(s);
    auto [quotient, remainder] = divide(a, divisor);
    cout << quotient.str() << '\n';
    cout << remainder << '\n';
    return 0;
}
```

输入：

```text
12345678901234567890 97
```

输出：

```text
127275040218913071
3
```

第一行是商，第二行是余数。结果满足：

```text
12345678901234567890 = 97 * 127275040218913071 + 3
```

## 正确性

从最高位向最低位归纳。处理当前位以前，所有更高位构成的前缀已经被准确写成：

```text
divisor * 已得到的商前缀 + remainder
```

放下一个十进制数字，相当于整个前缀乘以 `10` 后加当前数字，因此新的待除部分就是
`remainder*10+a.d[i]`。整数除法与余数运算把它唯一拆成当前商位和新余数，并继续
保持 `0<=remainder<divisor`。

处理完最低位后，这个不变量覆盖整个被除数，所以商与余数满足定义。

## 复杂度

设被除数有 `n` 位十进制数字。算法只扫描一次，时间复杂度是 $O(n)$；高精度商
使用 $O(n)$ 空间，余数只占一个低精度整数。

## 常见错误

### 像加法一样从最低位开始

低位的商依赖更高位留下的余数，不能先独立确定。除法必须从最高位向最低位处理。

### 忘记乘以 `10`

放下一位不是 `remainder+d[i]`，而是 `remainder*10+d[i]`。这里的 `10` 来自当前
一格一位的十进制表示。

### 用 `int` 保存 `current`

除数接近 32 位整数上界时，`remainder*10` 可能超过 `int`；中间计算需要
64 位整数。

### 输出商的前导零

最高商位可以为零。全部计算结束后必须规范化商，但数字零仍保留一位。

## 基础练习

1. 完整模拟 `1234/7` 的四步临时被除数、商位与余数。
2. 测试被除数小于除数、能够整除、被除数为零三种边界。
3. 对每组程序输出验证 `a=divisor*quotient+remainder`。
4. 把表示改成一格保存两位十进制数字，指出公式中的 `10` 应改成什么。

## 需要记住什么

1. 为什么除法从最高位开始？
2. 放下当前数字后，为什么临时被除数是 `remainder*10+d[i]`？
3. 为什么每个商位一定属于 `[0,9]`？
4. 商与余数分别使用什么类型？
5. 为什么中间变量使用 64 位整数？
6. 商和余数必须满足哪两个条件？

## 扩展阅读

[高精度整数：除以高精度整数（正文待写）](../catalog.md#05-数学) 会继续模拟长除法，
但每一步都要比较高精度余数与高精度除数并确定商位。

[压位高精度（正文待写）](../catalog.md#05-数学) 会把公式中的进制从 `10` 扩大到
`BASE`。除以低精度整数的原理不变，但必须重新检查中间值范围。

