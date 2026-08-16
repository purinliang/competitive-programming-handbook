# 费马小定理

> 最近修订：2026-08-15 21:40 +10:00（未审阅）

计算 $a^b\bmod p$ 时，[模快速幂](modular-exponentiation.md) 已经把时间降到
$O(\log b)$。但如果指数有几十万位，连 64 位整数都无法保存，模快速幂仍然不能
直接接收它。

当模数 $p$ 是质数时，费马小定理（Fermat's little theorem）揭示了幂的周期，可以先缩小指数：

$$
a^p\equiv a\pmod p.
$$

若 $p\nmid a$，也就是 $a$ 不是 $p$ 的倍数，还可以写成更常用的形式：

$$
a^{p-1}\equiv1\pmod p.
$$

本篇解释这两个形式为什么成立，以及怎样用它们处理巨大指数。质数模下求模逆元也会直接使用第二个形式。

## 乘法重新排列非零余数

先假设 $p$ 是质数且 $p\nmid a$。观察下面 $p-1$ 个数模 $p$ 的余数：

$$
a,2a,3a,\ldots,(p-1)a.
$$

它们都不是 $0$。如果其中两个余数相同，例如：

$$
ai\equiv aj\pmod p,
$$

那么：

$$
p\mid a(i-j).
$$

$p$ 是质数且不整除 $a$，因此只能有 $p\mid(i-j)$。而 $i,j$ 都在 $1..p-1$ 中，所以只能是 $i=j$。

这说明上述 $p-1$ 个余数两两不同。模 $p$ 的非零余数本来就只有：

$$
1,2,3,\ldots,p-1,
$$

所以乘以 $a$ 只会重新排列它们，不会增加、遗漏或重复任何一个余数。

## 推出周期形式

既然两组数只是顺序不同，它们的乘积同余：

$$
a\cdot2a\cdot3a\cdots(p-1)a
\equiv
1\cdot2\cdot3\cdots(p-1)
\pmod p.
$$

整理左边：

$$
a^{p-1}(p-1)!\equiv(p-1)!\pmod p.
$$

$(p-1)!$ 的每个因数都小于质数 $p$，所以它与 $p$ 互质，可以在同余式两边约去：

$$
a^{p-1}\equiv1\pmod p.
$$

这就是费马小定理最常用的形式。它的前提 $p\nmid a$ 不能删除。

## 覆盖所有整数的形式

如果 $p\nmid a$，在上一式两边同乘 $a$：

$$
a^p\equiv a\pmod p.
$$

如果 $p\mid a$，那么 $a$ 和 $a^p$ 模 $p$ 都是 $0$，同一个结论仍然成立。因此：

$$
a^p\equiv a\pmod p
$$

对任意整数 $a$ 都成立。

两个形式的适用范围不同：

- $a^p\equiv a\pmod p$ 不要求 $a$ 与 $p$ 互质；
- $a^{p-1}\equiv1\pmod p$ 要求 $p\nmid a$。

## 缩小指数

当 $p\nmid a$ 时，每增加 $p-1$ 次幂都会乘上一个模 $p$ 同余于 $1$ 的因子：

$$
a^{b+(p-1)}
=a^b\cdot a^{p-1}
\equiv a^b\pmod p.
$$

因此非负指数可以先对 $p-1$ 取余：

$$
a^b\equiv a^{b\bmod(p-1)}\pmod p.
$$

例如计算：

$$
3^{10^{20}}\bmod7.
$$

$7$ 是质数且 $7\nmid3$。因为 $p-1=6$，先求指数对 $6$ 的余数：

$$
10^{20}\bmod6=4.
$$

于是：

$$
3^{10^{20}}\equiv3^4\equiv4\pmod7.
$$

指数无论有多少位，最终快速幂只需要处理小于 $p-1$ 的指数。

## 十进制大数取余

若指数以十进制字符串保存，可以从左到右读每一位。已经读到的前缀余数是 `remainder`，再读入数字 `digit` 后，新数等于旧前缀乘 `10` 再加当前位：

```cpp
remainder = ((__int128)remainder * 10 + digit - '0') % mod;
```

函数不需要保存完整整数：

```cpp
ll decimal_mod(const string& number, ll mod) {
    ll remainder = 0;
    for (char digit : number) {
        remainder = ((__int128)remainder * 10 + digit - '0') % mod;
    }
    return remainder;
}
```

这里直接遍历 C++ `string` 的字符，不自行定义字符下标，因此保留标准库的原生接口。

## 底数是模数倍数

指数缩减公式要求 $p\nmid a$。若 $a\equiv0\pmod p$ 且原指数大于 `0`，答案应当是 `0`。

不能先把指数对 $p-1$ 取余，再把余数当作真实指数。例如：

$$
7^6\bmod7=0,
$$

但 $6\bmod6=0$，错误地改算 $7^0$ 会得到 `1`。

因此代码先判断原指数是否为 `0`，再判断规范后的底数是否为 `0`：

```text
原指数为 0：答案是 1 mod p
原指数大于 0 且 a mod p = 0：答案是 0
其他情况：指数对 p-1 取余后快速幂
```

## 完整代码

下面的程序假设 `p>1` 且 `p` 已知是质数，计算十进制非负大整数指数下的 $a^b\bmod p$。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll power(ll base, ll exponent, ll mod) {
    base %= mod;
    if (base < 0) {
        base += mod;
    }

    ll result = 1 % mod;
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (__int128)result * base % mod;
        }
        base = (__int128)base * base % mod;
        exponent /= 2;
    }
    return result;
}

bool is_zero(const string& number) {
    for (char digit : number) {
        if (digit != '0') {
            return false;
        }
    }
    return true;
}

ll decimal_mod(const string& number, ll mod) {
    ll remainder = 0;
    for (char digit : number) {
        remainder = ((__int128)remainder * 10 + digit - '0') % mod;
    }
    return remainder;
}

ll fermat_power(ll a, const string& exponent, ll p) {
    if (is_zero(exponent)) {
        return 1 % p;
    }

    a %= p;
    if (a < 0) {
        a += p;
    }
    if (a == 0) {
        return 0;
    }

    ll reduced_exponent = decimal_mod(exponent, p - 1);
    return power(a, reduced_exponent, p);
}

int main() {
    ll a, p;
    string exponent;
    cin >> a >> exponent >> p;

    cout << fermat_power(a, exponent, p) << '\n';
    return 0;
}
```

输入：

```text
3 100000000000000000000 7
```

输出：

```text
4
```

`10^20` 对 `6` 取余是 `4`，所以程序最后计算的是 $3^4\bmod7$。

## 与模逆元的关系

若 $p$ 是质数且 $p\nmid a$，费马小定理给出：

$$
a^{p-1}\equiv1\pmod p.
$$

拆出一个 $a$：

$$
a\cdot a^{p-2}\equiv1\pmod p.
$$

因此 $a^{p-2}$ 就是 $a$ 模 $p$ 的乘法逆元。下一篇 [模逆元（正文待写）](../catalog.md#05-数学) 会把它与扩展欧几里得方法放到各自适用的条件下比较。

## 复杂度

设十进制指数有 $L$ 位。扫描字符串并计算指数模 `p-1` 需要 $O(L)$ 时间；缩减后的指数小于 `p-1`，快速幂需要 $O(\log p)$ 时间。因此总时间复杂度是：

$$
O(L+\log p).
$$

除输入字符串外，算法只使用 $O(1)$ 额外空间。

## 常见错误

### 模数不是质数

费马小定理要求模数是质数。例如模 `8` 时，$2^7\not\equiv1\pmod8$。不能因为代码形式相同就对任意模数使用 `p-1` 缩减指数。

### 忘记互质条件

$a^{p-1}\equiv1\pmod p$ 要求 $p\nmid a$。底数是模数倍数时，必须单独处理原指数为 `0` 与大于 `0` 的情况。

### 混淆两个形式

$a^p\equiv a\pmod p$ 对所有整数 $a$ 成立；$a^{p-1}\equiv1\pmod p$ 只对 $p\nmid a$ 成立。后者才能直接给出长度为 `p-1` 的幂周期。

### 把必要条件当作质数判定

若某个数 $n$ 满足 $a^n\equiv a\pmod n$，不能仅凭这一次检验断定 $n$ 是质数。可靠的质数检测需要额外条件与算法。

### 忽略中间乘法容量

当 `p` 接近 64 位整数上限时，两个余数的乘积可能超出 64 位整数。完整代码使用 `__int128` 保存乘法中间结果。

## 基础练习

1. 列出 `2,4,6,8,10,12` 模 `7` 的余数，验证它们恰好重排了 `1..6`。
2. 从两组非零余数的乘积相同，独立推出 $a^{p-1}\equiv1\pmod p$。
3. 分别说明费马小定理两个形式对底数 `a` 的限制。
4. 手算 $2^{1000}\bmod13$，先缩减指数，再执行快速幂。
5. 构造底数能被 `p` 整除的例子，说明为什么不能直接令 `b=b%(p-1)`。
6. 用普通 64 位指数随机生成小数据，把缩减指数后的结果与直接快速幂比较。

## 需要记住什么

1. 费马小定理的两个常用形式分别是什么？
2. 为什么乘以非零余数 `a` 只会重新排列模 `p` 的非零余数？
3. 为什么能在乘积同余式中约去 $(p-1)!$？
4. 哪个形式要求 $p\nmid a$？
5. 为什么指数可以对 `p-1` 取余？
6. 底数是 `p` 的倍数时，为什么必须保留“原指数是否为 0”的信息？
7. 质数模下，为什么 $a^{p-2}$ 是 $a$ 的模逆元？

欧拉定理会把“质数模”推广到一般互质模数；伪质数与 Carmichael 数会说明为什么费马同余不能单独完成确定性质数判定。这些内容不属于本篇基础目标。
