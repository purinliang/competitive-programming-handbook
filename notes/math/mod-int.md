# 模运算：modint

> 状态：定稿

许多数论算法只关心整数对某个模数 $m$ 的余数。若每一步都手写 `% m`，负数归一化、乘法溢出和漏写取模会反复干扰真正的算法。`modint` 把这些规则封装成一种“模意义下的整数”，让调用位置可以直接书写加法、减法和乘法。

本篇把类命名为 `modint`，并用 `mint` 作为竞赛代码中的短别名。后续算法只需书写 `mint x`，不必反复展开模运算的实现细节。

这是一份竞赛工具类，不改变模运算本身的数学含义。中国剩余定理等文章可以直接使用它，把正文集中在各自的算法结构上。

## 始终保存标准余数

类中的 `x` 始终满足

$$
0\le x<m.
$$

构造对象时先对输入取模；负余数再加一次 $m$：

```cpp
static ll normalize(ll x) {
    x %= m;
    if (x < 0) {
        x += m;
    }
    return x;
}
```

`m` 是整个类共享的运行时模数。必须先调用 `set_mod`，再构造任何参与运算的对象；已有对象存活时不要改变模数。

## 安全的模加法

若 `a,b` 都在 $[0,m)$，普通写法 `(a + b) % m` 在常见数据范围内最直观。但当 $m$ 已经接近 64 位整数上限时，`a + b` 可能先溢出。

类内部只在这里处理一次边界：

```cpp
static ll add(ll a, ll b) {
    if (a >= m - b) {
        return a - (m - b);
    }
    return a + b;
}
```

两条分支都不会产生超出 $[0,m)$ 的中间结果。调用 `modint` 的算法无需再看见这个实现细节。

## 龟速乘

直接计算 `a * b` 也可能在取模前溢出。龟速乘把 `b` 的二进制位逐个处理，像快速幂一样反复翻倍 `a`、折半 `b`：

```cpp
modint& operator*=(const modint& other) {
    ll a = x;
    ll b = other.x;
    x = 0;
    while (b > 0) {
        if (b % 2 == 1) {
            x = add(x, a);
        }
        a = add(a, a);
        b /= 2;
    }
    return *this;
}
```

整个过程只调用已经安全的模加法，因此不依赖 `__int128`。代价是一次乘法需要 $O(\log m)$ 时间；普通模数和大量乘法场景可以另行选择 `__int128` 或题目允许的更快实现。

## 复合赋值运算符

`+=`、`-=` 和 `*=` 直接修改当前对象并返回自身：

```cpp
modint& operator+=(const modint& other) {
    x = add(x, other.x);
    return *this;
}

modint& operator-=(const modint& other) {
    if (x < other.x) {
        x += m - other.x;
    } else {
        x -= other.x;
    }
    return *this;
}
```

减法中若 `x < other.x`，就在减之前补一个模数。因为这时 $x+m-\texttt{other.x}<m$，中间值也不会溢出。

## 普通运算符

普通的 `+`、`-`、`*` 先复制左操作数，再复用对应的复合赋值：

```cpp
friend modint operator+(modint a, const modint& b) {
    return a += b;
}

friend modint operator-(modint a, const modint& b) {
    return a -= b;
}

friend modint operator*(modint a, const modint& b) {
    return a *= b;
}
```

因此运算结果仍然自动保持在 $[0,m)$。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct modint {
    static ll m;
    ll x;

    modint(ll x = 0) : x(normalize(x)) {}

    static void set_mod(ll new_m) {
        m = new_m;
    }

    static ll normalize(ll x) {
        x %= m;
        if (x < 0) {
            x += m;
        }
        return x;
    }

    static ll add(ll a, ll b) {
        if (a >= m - b) {
            return a - (m - b);
        }
        return a + b;
    }

    ll value() const {
        return x;
    }

    modint& operator+=(const modint& other) {
        x = add(x, other.x);
        return *this;
    }

    modint& operator-=(const modint& other) {
        if (x < other.x) {
            x += m - other.x;
        } else {
            x -= other.x;
        }
        return *this;
    }

    modint& operator*=(const modint& other) {
        ll a = x;
        ll b = other.x;
        x = 0;
        while (b > 0) {
            if (b % 2 == 1) {
                x = add(x, a);
            }
            a = add(a, a);
            b /= 2;
        }
        return *this;
    }

    friend modint operator+(modint a, const modint& b) {
        return a += b;
    }

    friend modint operator-(modint a, const modint& b) {
        return a -= b;
    }

    friend modint operator*(modint a, const modint& b) {
        return a *= b;
    }
};

ll modint::m = 1;

typedef modint mint;

int main() {
    ll m, a, b;
    scanf("%lld%lld%lld", &m, &a, &b);

    mint::set_mod(m);
    mint x = a;
    mint y = b;
    printf("%lld\n", (x + y).value());
    printf("%lld\n", (x - y).value());
    printf("%lld\n", (x * y).value());
    return 0;
}
```

输入：

```text
15 -2 7
```

输出：

```text
5
6
1
```

构造时 `-2` 被归一化为 $13$，所以三行分别是 $(13+7)\bmod15$、$(13-7)\bmod15$ 和 $(13\times7)\bmod15$。

## 复杂度

构造、取值、加法和减法都是 $O(1)$；龟速乘为 $O(\log m)$。每个对象只保存一个 64 位整数，额外空间为 $O(1)$。

## 基础练习

1. 在模 $15$ 意义下手算 `-2 + 7`、`-2 - 7` 和 `-2 * 7`，再与样例输出比较。
2. 用接近 64 位整数上限的模数测试 `add`，说明两条分支为什么都不会溢出。
3. 手动模拟 `13 * 7 (mod 15)` 的龟速乘过程，记录每一次 `a,b,x`。
4. 连续执行 `x += y; x -= y;`，说明为什么 `x` 会回到原来的标准余数。

## 需要记住什么

- `modint` 始终维护的取值范围是什么？
- 为什么必须先设置模数，再构造对象？为什么对象存活时不能改变模数？
- 安全模加法为什么不直接计算可能溢出的 `a + b`？
- 龟速乘怎样把乘法拆成 $O(\log m)$ 次模加法？
- `+`、`-`、`*` 为什么可以复用 `+=`、`-=`、`*=`？
- 模整数类能否解决最终模数本身超出 64 位整数范围的问题？

## 返回基础篇

返回 [模运算与快速幂（正文待写）](../CATALOG.md#05-数学) 继续主学习路线。
