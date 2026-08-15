# 模运算：modint

> 最近修订：2026-08-13 03:46 +10:00（未审阅）

许多数论题从头到尾只使用一个固定模数，例如 $10^9+7$ 或 $998244353$。若每一步都手写 `% MOD`，负数归一化与漏写取模会反复干扰真正的算法。

`modint` 把“始终对同一个 `MOD` 取模”封装成一种类型，使加法、减法和乘法可以直接使用普通运算符。本篇把类命名为 `modint`，并用 `mint` 作为竞赛代码中的短别名。

这是一份固定模数的竞赛工具，不是模运算算法本身，也不试图同时支持多个模数。

## 固定模数

模数直接声明为全局常量：

```cpp
const ll MOD = 1000000007;
```

所有 `modint` 对象都按照这一份 `MOD` 解释自己的值。`const` 保证程序运行期间不能把它改成另一个模数，因此不会出现“修改模数后，旧对象突然改变含义”的问题。

若题目的模数从输入读入，但读入后整道题都不再改变，也可以声明全局 `ll MOD`，在创建任何 `mint` 对象之前只赋值一次。它在语言层面不再是常量，代码必须自己遵守“初始化后不修改”的约定；固定字面量能够满足题意时，优先使用 `const ll MOD`。

中国剩余定理等算法会同时处理多个不同模数，不适合使用这份固定模数类型。那类算法应当在计算位置直接写出当前模数。

## 标准余数

每个对象只保存一个成员 `x`，并始终维持

$$
0\le x<\texttt{MOD}.
$$

构造对象时先取模；若结果为负数，再加一次 `MOD`：

```cpp
modint(ll value = 0) {
    x = value % MOD;
    if (x < 0) {
        x += MOD;
    }
}
```

例如 `mint x = -2;` 在 `MOD = 1000000007` 时保存的是 `1000000005`。对象以后只在标准余数之间运算。

## 复合赋值运算符

加法先把两个标准余数相加。结果小于 `2 * MOD`，因此最多减一次 `MOD`：

```cpp
modint& operator+=(const modint& other) {
    x += other.x;
    if (x >= MOD) {
        x -= MOD;
    }
    return *this;
}
```

减法结果若为负数，补一次 `MOD`：

```cpp
modint& operator-=(const modint& other) {
    x -= other.x;
    if (x < 0) {
        x += MOD;
    }
    return *this;
}
```

乘法直接使用 64 位整数保存中间结果：

```cpp
modint& operator*=(const modint& other) {
    x = x * other.x % MOD;
    return *this;
}
```

这要求 $(\texttt{MOD}-1)^2$ 能放入 64 位整数。常见的 $10^9+7$ 和 $998244353$ 都满足。若具体题目的模数更大，只按题目范围替换这一处乘法；本篇不为一个少见边界捆绑龟速乘或高精度。

三个函数都返回 `*this`，因此调用者既可以写 `a += b`，也可以继续使用修改后的对象。

## 普通运算符

普通的 `+`、`-`、`*` 不应修改左操作数。实现时先按值复制左边的 `a`，再复用对应的复合赋值：

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

复制只包含一个 64 位整数。运算结果仍然由复合赋值函数保证位于 `[0, MOD)`。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

struct modint {
    ll x;

    modint(ll value = 0) {
        x = value % MOD;
        if (x < 0) {
            x += MOD;
        }
    }

    ll value() const {
        return x;
    }

    modint& operator+=(const modint& other) {
        x += other.x;
        if (x >= MOD) {
            x -= MOD;
        }
        return *this;
    }

    modint& operator-=(const modint& other) {
        x -= other.x;
        if (x < 0) {
            x += MOD;
        }
        return *this;
    }

    modint& operator*=(const modint& other) {
        x = x * other.x % MOD;
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

typedef modint mint;

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

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
1000000008 2
```

输出：

```text
3
1000000006
2
```

第一个输入在模 `MOD` 意义下等于 `1`，所以三行分别是 $1+2$、$1-2$ 和 $1\times2$ 的标准余数。

## 复杂度

构造、取值、加法、减法和乘法都是 $O(1)$。每个对象只保存一个 64 位整数，额外空间为 $O(1)$。

## 基础练习

1. 在模 $10^9+7$ 意义下手算 `-2 + 7`、`-2 - 7` 和 `-2 * 7`，再用 `mint` 验证。
2. 连续执行 `x += y; x -= y;`，说明为什么 `x` 会回到原来的标准余数。
3. 把 `MOD` 改成 `998244353`，重新计算同一组输入。
4. 说明为什么修改全局 `MOD` 会改变所有 `mint` 对象的运算规则，以及本篇为什么使用 `const` 禁止这种修改。
5. 检查具体题目的 `MOD`，判断 `(MOD - 1) * (MOD - 1)` 是否能放入 64 位整数。

## 需要记住什么

1. 每个 `modint` 对象保存的是原整数，还是它模 `MOD` 的标准余数？
2. 为什么所有对象必须使用同一个不会中途变化的 `MOD`？
3. `+=` 与 `-=` 为什么最多只需修正一次？
4. `*=` 直接使用 64 位整数乘法需要什么范围保证？
5. 普通运算符为什么可以通过复制左操作数并复用复合赋值实现？
6. 为什么同时处理多个模数的算法不适合使用这份 `modint`？

运算符重载的完整语言规则、运行时切换模数、多个模数类型共存以及特殊大模数乘法都不是本篇工具的目标，不要求理解或记忆。

## 返回基础篇

返回 [模运算](modular-arithmetic.md) 查看这份工具封装的运算基础。
