# 多项式：表示、加法与减法

> 最近修订：2026-08-17 12:16 +10:00（未审阅）

一个一元多项式写成：

$$
A(x)=a_0+a_1x+a_2x^2+\cdots+a_nx^n.
$$

程序真正需要保存的是每个幂次对应的系数。最直接的表示是：

```cpp
coefficient[i] = a_i;
```

这样数组下标就等于 $x$ 的指数：`coefficient[0]` 是常数项，
`coefficient[1]` 是一次项系数。

本篇建立后续卷积、FFT、NTT 与生成函数共同使用的基本表示，只讨论系数数组、
次数、规范化、加法和减法。

## 为什么这里自然从 0 开始

全书自定义的点、树和普通序列默认从 1 开始编号，但多项式的指数本来就从 0
开始。若把 $a_i$ 存进位置 `i+1`，每次读取次数都要额外平移。

因此多项式明确采用：

```text
数组下标 = 单项式次数
```

这是由数学对象本身决定的 0-based 表示。末尾仍可额外预留空间，但有效常数项
必须位于下标 0。

## 次数与系数数组长度

若最高非零项是 $a_nx^n$，多项式次数为 $n$，却需要保存 `n+1` 个系数：

```text
a[0], a[1], ..., a[n]
```

次数与元素个数相差 1，是最常见的边界来源。

零多项式的所有系数都为 0。数学中它的次数通常不定义；代码为了保持容器非空，
统一把零多项式保存成：

```cpp
coefficient = {0};
```

并让 `degree()` 返回 0。这个返回值是代码约定，不宣称零多项式在数学上的次数
真的等于 0。

## 规范化尾部零

以下两个数组表示同一个多项式：

```text
[3, 2]
[3, 2, 0, 0]
```

它们都表示 $3+2x$。若不删除无意义的最高位零，次数判断和结果输出会不一致。

```cpp
void normalize() {
    while (coefficient.size() > 1 && coefficient.back() == 0) {
        coefficient.pop_back();
    }
}
```

保留至少一个元素，确保零多项式仍能安全访问常数项。

## 多项式加法

同次数项直接相加：

$$
(A+B)_i=a_i+b_i.
$$

两者次数不同时，把缺少的高次系数视为 0。结果数组长度取两者较大值，逐项读取
存在的系数即可。

例如：

$$
(1+2x+3x^2)+(4-2x)=5+3x^2.
$$

一次项系数相加后变成 0，但它位于中间，不能删除；只有最高次末尾的连续零可以
由 `normalize()` 移除。

## 多项式减法

减法同样按次数对齐：

$$
(A-B)_i=a_i-b_i.
$$

加减都只访问每个系数一次。设两者最大次数为 $n$，时间复杂度和结果空间都是
$O(n)$。

## 完整代码

输入两个整系数多项式的次数与从低次到高次的系数。输出和与差，格式为“次数，
随后从低次到高次的全部系数”。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Polynomial {
    vector<ll> coefficient;

    Polynomial(vector<ll> coefficient = {0}) : coefficient(move(coefficient)) {
        normalize();
    }

    void normalize() {
        while (coefficient.size() > 1 && coefficient.back() == 0) {
            coefficient.pop_back();
        }
    }

    int degree() const {
        return (int)coefficient.size() - 1;
    }

    ll get(int exponent) const {
        if (exponent >= (int)coefficient.size()) {
            return 0;
        }
        return coefficient[exponent];
    }
};

Polynomial add(const Polynomial& a, const Polynomial& b) {
    int size = max((int)a.coefficient.size(), (int)b.coefficient.size());
    vector<ll> result(size, 0);

    for (int exponent = 0; exponent < size; exponent++) {
        result[exponent] = a.get(exponent) + b.get(exponent);
    }

    return Polynomial(result);
}

Polynomial subtract(const Polynomial& a, const Polynomial& b) {
    int size = max((int)a.coefficient.size(), (int)b.coefficient.size());
    vector<ll> result(size, 0);

    for (int exponent = 0; exponent < size; exponent++) {
        result[exponent] = a.get(exponent) - b.get(exponent);
    }

    return Polynomial(result);
}

Polynomial read_polynomial() {
    int degree;
    cin >> degree;

    vector<ll> coefficient(degree + 1);
    for (ll& value : coefficient) {
        cin >> value;
    }

    return Polynomial(coefficient);
}

void print_polynomial(const Polynomial& polynomial) {
    cout << polynomial.degree() << '\n';

    for (int exponent = 0; exponent <= polynomial.degree(); exponent++) {
        cout << polynomial.coefficient[exponent]
             << (exponent == polynomial.degree() ? '\n' : ' ');
    }
}

void solve() {
    Polynomial a = read_polynomial();
    Polynomial b = read_polynomial();

    print_polynomial(add(a, b));
    print_polynomial(subtract(a, b));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 为什么先统一表示再学习乘法

多项式乘法、求导、积分、求逆和生成函数看似操作不同，却都依赖同一条约定：
下标 `i` 表示 $x^i$ 的系数。

后续朴素乘法会把 `a[i] * b[j]` 加入 `result[i+j]`；FFT 与 NTT 只是加速同一
卷积，并不会改变系数的意义。若基础表示在不同模板中一会儿平移一位、一会儿把
数组长度当成次数，后续所有边界都会变得难以统一。

## 取模多项式

若题目在模 `mod` 意义下运算，加减后要把系数规范到 `[0,mod)`：

```cpp
value %= mod;
if (value < 0) {
    value += mod;
}
```

是否取模属于系数所在代数结构，不属于多项式下标表示本身。本篇使用普通整系数，
避免在最基础的加减中绑定某个固定模数。

## 常见错误

- 把常数项存到下标 1，后续卷积又按下标和解释次数；
- 混淆多项式次数 `n` 与系数数量 `n+1`；
- 删除中间为 0 的系数，使后续系数次数整体错位；
- 结果最高次系数抵消为 0 后忘记规范化；
- 把零多项式规范化成空 `vector`，随后访问常数项越界；
- 两个次数不同的多项式加减时，只遍历较短数组；
- 模意义减法得到负数后没有规范到合法余数范围。

## 需要记住什么

- `coefficient[i]` 对应哪个单项式？
- 为什么次数为 $n$ 的多项式需要 $n+1$ 个系数？
- 多项式为什么在这里自然使用 0-based 下标？
- 哪些零系数可以由 `normalize()` 删除，哪些不能？
- 加法与减法怎样处理次数不同的两个多项式？
- 零多项式在代码中怎样保持安全表示？
