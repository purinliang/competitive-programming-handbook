# 数论：质数

> 状态：草稿

[数论：整除](divisibility.md) 建立了“能否除尽”的关系。有些正整数几乎不能被更小的数整除；它们是整数乘法结构中的基本材料。

## 质数与合数

大于 $1$ 的正整数，如果它的正因数只有 $1$ 和它本身，就称为**质数**（prime number）。例如

```text
2, 3, 5, 7, 11, 13
```

都是质数。

大于 $1$ 且不是质数的整数称为**合数**（composite number）。例如 $12=3\times4$，所以 $12$ 是合数。

$1$ 既不是质数，也不是合数。把 $1$ 排除在质数之外，才能使后续的算术基本定理具有唯一性；否则任意分解都能随意再乘若干个 $1$。

## 试除判定

按照定义枚举 $2$ 到 $n-1$ 的所有整数当然可以判定 $n$ 是否为质数，但不需要枚举这么远。

如果 $n$ 是合数，就能写成

$$
n=ab,
$$

其中 $1<a<n$ 且 $1<b<n$。假设 $a$ 和 $b$ 都大于 $\sqrt n$，就会有

$$
ab>\sqrt n\cdot\sqrt n=n,
$$

与 $ab=n$ 矛盾。因此，一对因数中至少有一个不超过 $\sqrt n$。只要检查到平方根，就不会漏掉任何合数。

```cpp
bool is_prime(long long n) {
    if (n < 2) {
        return false;
    }

    for (long long i = 2; i <= n / i; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}
```

循环条件 `i <= n / i` 与 $i^2\le n$ 等价，但避免了 `i * i` 在 `n` 接近 `long long` 上限时溢出。

## 完整代码

下面的程序读入一个非负整数，输出它是否为质数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

bool is_prime(ll n) {
    if (n < 2) {
        return false;
    }

    for (ll i = 2; i <= n / i; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    ll n;
    scanf("%lld", &n);

    puts(is_prime(n) ? "Yes" : "No");
    return 0;
}
```

## 复杂度

试除法最多检查到 $\lfloor\sqrt n\rfloor$，时间复杂度为 $O(\sqrt n)$，额外空间复杂度为 $O(1)$。

当只需判断少量整数时，这个算法已经足够。若要同时处理从 $1$ 到 $n$ 的大量整数，后续会使用筛法统一预处理。

## 需要记住什么

1. 质数和合数分别如何定义？
2. 为什么 $1$ 既不是质数也不是合数？
3. 为什么判定质数时只需要试除到 $\sqrt n$？
4. `i <= n / i` 相比 `i * i <= n` 避免了什么问题？
5. 单次试除判定的时间和额外空间复杂度是什么？

## 下一篇

下一篇 [数论：算术基本定理](fundamental-theorem-of-arithmetic.md) 会说明为什么质数可以作为所有正整数的唯一乘法坐标。
