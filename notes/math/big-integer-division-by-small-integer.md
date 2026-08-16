# 高精度整数：除以低精度整数

> 最近修订：2026-08-17 00:20 +10:00（未审阅）

一个高精度整数可能有数百位，不能直接放进普通整数类型；但除数有时只是一个
`int`。这时不需要实现两个高精度整数之间的完整除法，只要模仿十进制竖式，从
最高位开始逐块确定商，就能同时得到高精度商和低精度余数。

本篇沿用[高精度整数：加法、减法与乘法](big-integer-addition-subtraction-multiplication.md)
的压位表示：每个数字块保存 8 位十进制数字，最低块放在 `d[1]`。

## 为什么从最高块开始

加法和乘法从低位处理进位，所以数字块按从低到高保存很方便。除法却必须先知道
更高位产生的余数，才能继续处理下一块，因此遍历方向正好相反。

普通竖式计算 `1234 / 7` 时，会依次处理 `1`、`12`、`53` 和 `44`。每一步都把
上一步的余数乘以 10，再放下一个十进制数字。

压位表示完全相同，只是每次放下来的不再是一位十进制数字，而是一整个以
`BASE` 为基数的数字块：

```cpp
ll current = remainder * BASE + a.d[i];
quotient.d[i] = current / divisor;
remainder = current % divisor;
```

其中：

- `remainder` 是处理完更高块后留下的余数；
- `current` 是把当前块放下来后得到的临时被除数；
- `current / divisor` 是当前位置的商；
- `current % divisor` 留给下一个更低的块。

因为进入每一步之前都有 `remainder < divisor`，所以

$$
0\leq remainder\times BASE+a.d[i]<divisor\times BASE.
$$

当前商一定在 `[0, BASE)` 中，恰好能放进一个数字块。若 `divisor` 是正的
32 位整数，`current` 也能安全放入 64 位整数。

## 商与余数分别是什么类型

设被除数为 $a$，正除数为 $b$。最终结果满足

$$
a=bq+r,\qquad 0\leq r<b.
$$

商 $q$ 可能仍有数百位，所以继续使用 `bigint`；余数 $r$ 严格小于低精度除数，
因此一个 `int` 就足够保存。函数用 `pair<bigint, int>` 一次返回两项：

```cpp
pair<bigint, int> divide(const bigint& a, int divisor)
```

除数必须大于零。除以零没有定义，负数除法则还需要先约定商和余数的符号，不属于
本篇的非负整数模板。

## 去掉商的前导零块

最高几个块可能不够除。例如一个数小于除数时，每个商块都是零。计算完成后调用
`trim()` 去掉最高位的零块，但仍保留一个零块表示商 $0$：

```cpp
quotient.trim();
```

余数不需要额外整理；最后一次循环留下的 `remainder` 就是整个除法的余数。

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

第一行是商，第二行是余数。可以用
`97 * 127275040218913071 + 3` 还原原来的被除数。

## 复杂度

设被除数有 $n$ 个压位块。算法只从最高块到最低块扫描一次，时间复杂度是
$O(n)$；商占用 $O(n)$ 个块。余数始终只占一个低精度整数。

## 基础练习

1. 用十进制竖式计算 `1234 / 7`，记录每一步放下新数字后的临时被除数。
2. 把同样的过程改写成以 `100` 为 `BASE` 的压位除法。
3. 测试被除数小于除数、被除数为零以及能够整除三种边界。
4. 验证每组输出都满足 `被除数 = 除数 * 商 + 余数`。

## 需要记住什么

1. 为什么高精度除法必须从最高块向最低块处理？
2. 放下当前块后，`current` 为什么等于 `remainder * BASE + d[i]`？
3. 为什么一个商块一定小于 `BASE`？
4. 为什么商需要高精度类型，而余数只需要低精度类型？
5. 除法结束后为什么只需要对商调用 `trim()`？
6. 本篇对被除数和除数的符号有什么要求？

## 扩展阅读

[高精度整数：除以高精度整数（正文待写）](../catalog.md#05-数学) 中，除数本身也
无法放进普通整数，每一位商都需要通过比较与试商确定。该内容不影响后续主线学习。

