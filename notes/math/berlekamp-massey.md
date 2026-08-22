# 线性递推：Berlekamp–Massey

> 最近修订：2026-08-23 06:59 +10:00（未审阅）

已知 Fibonacci 数列的递推式：

$$
F_n=F_{n-1}+F_{n-2},
$$

就能用矩阵快速幂计算很远的一项。但是有些题目只给出一段数列，没有直接告诉我们递推式：

```text
0, 1, 1, 2, 3, 5, 8, 13, ...
```

若它确实来自一个很短的线性递推，能否从已经看到的项反推出这个递推？

Berlekamp–Massey 算法解决的正是这个问题：在一个域上，给定有限序列，求能够解释这段
序列的最短线性递推。竞赛中最常见的环境是对质数 `MOD` 取模，此时每个非零数都有
逆元，可以完成算法所需的除法。

找到递推以后，再对特征多项式快速幂，就能计算第 `n` 项。本文会把“找递推”和“用递推”
两部分完整连接起来。

## 问题与约定

给定：

$$
s_0,s_1,\ldots,s_{m-1},
$$

寻找尽量小的阶数 `L` 和系数：

$$
c_1,c_2,\ldots,c_L,
$$

使已知范围内满足：

$$
s_n=c_1s_{n-1}+c_2s_{n-2}+\cdots+c_Ls_{n-L}.
$$

这里数列下标保留线性递推的常见数学约定，从 `0` 开始；`c_1` 乘离当前项最近的
`s_(n-1)`。

只有有限项时，算法求出的是“能够解释当前样本的最短递推”。若输入项太少，某个偶然
规律可能同样解释这些项，却不能预测真正的后续。一个 `L` 阶递推通常至少需要约 `2L`
项才能稳定恢复，实际使用时最好再用额外已知项验证。

## 把递推改写成连接多项式

把等式全部移动到左侧：

$$
s_n-c_1s_{n-1}-c_2s_{n-2}-\cdots-c_Ls_{n-L}=0.
$$

定义连接多项式：

$$
C(x)=C_0+C_1x+\cdots+C_Lx^L,
$$

其中：

$$
C_0=1,
\qquad
C_i=-c_i.
$$

于是第 `n` 项是否符合当前递推，可以用一个数衡量：

$$
d_n=\sum_{i=0}^{L}C_i s_{n-i}.
$$

这个 `d_n` 称为当前项的偏差：

- `d_n = 0`：当前递推已经能解释 `s_n`；
- `d_n != 0`：必须修改连接多项式。

算法逐项扫描序列，并始终维护能够解释已经扫描部分的最短连接多项式 `C`。

## 怎样消掉新的偏差

假设以前某次更新前保存的连接多项式是 `B(x)`，它在当时产生的非零偏差为 `b`。
从那次位置到当前项相隔 `m` 步，把它平移成：

$$
x^mB(x).
$$

它在当前位置造成的偏差就是 `b`。当前多项式 `C` 的偏差为 `d`，因此执行：

$$
C'(x)=C(x)-\frac dbx^mB(x),
$$

新偏差变成：

$$
d-\frac db\cdot b=0.
$$

这就是 Berlekamp–Massey 最核心的一步。代码中的：

- `connection` 表示当前 `C`；
- `previous` 表示备用的 `B`；
- `discrepancy` 表示当前 `d`；
- `previous_discrepancy` 表示 `b`；
- `shift` 表示相隔的 `m` 步。

模质数时，`d/b` 通过：

$$
d\cdot b^{MOD-2}\pmod {MOD}
$$

计算。若模数不是质数，非零 `b` 也可能没有逆元，本文模板不能直接使用。

## 什么时候必须增加阶数

处理下标 `n` 以前，当前递推阶数为 `L`。若：

$$
2L\le n,
$$

已有自由度不足以在保持以前等式的同时修正新偏差，最短阶数必须更新为：

$$
L'=n+1-L.
$$

这时还要保存更新前的 `C` 和当前偏差，作为以后修正所需的 `B` 与 `b`。

若 `2L > n`，平移后的 `B` 可以在现有阶数内消掉偏差，不必增加 `L`。无论哪种情况，
新的 `C` 都会解释截至当前项的全部序列。

对于 Fibonacci 前缀：

```text
0, 1, 1, 2, 3, 5
```

算法最终得到：

$$
C(x)=1-x-x^2,
$$

所以：

$$
c_1=1,\qquad c_2=1.
$$

## 从连接多项式恢复递推系数

扫描结束后：

$$
C(x)=1+C_1x+\cdots+C_Lx^L.
$$

原递推系数只是把后面的符号取反：

$$
c_i=-C_i.
$$

Berlekamp–Massey 的时间复杂度为 `O(mL)`；最坏情况下 `L` 与 `m` 同阶，因此通常写作
`O(m^2)`。空间复杂度为 `O(m)`。

## 已知递推以后计算第 n 项

设已经恢复：

$$
s_n=c_1s_{n-1}+\cdots+c_Ls_{n-L}.
$$

对应的特征多项式为：

$$
P(x)=x^L-c_1x^{L-1}-c_2x^{L-2}-\cdots-c_L.
$$

在模 `P(x)` 的多项式余数中，有：

$$
x^L\equiv
c_1x^{L-1}+c_2x^{L-2}+\cdots+c_L.
$$

用二进制快速幂计算：

$$
x^n\bmod P(x)
=q_0+q_1x+\cdots+q_{L-1}x^{L-1}.
$$

线性递推保证相同的关系也作用于数列，因此：

$$
s_n=q_0s_0+q_1s_1+\cdots+q_{L-1}s_{L-1}.
$$

两个次数小于 `L` 的多项式相乘后，从最高次项向下使用特征多项式消元，就能把结果
重新压回 `L` 项。单次乘法与消元是 `O(L^2)`，快速幂共进行 `O(log n)` 次，所以求
第 `n` 项的复杂度为：

$$
O(L^2\log n).
$$

## 完整代码

输入：

```text
m n
s_0 s_1 ... s_(m-1)
```

已知序列在质数 `998244353` 的模意义下由某个线性递推生成，并保证给出的项足以唯一
确定所需递推。程序依次输出最短阶数、递推系数和 `s_n`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 998244353;

ll power(ll base, ll exponent) {
    ll result = 1;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }

    return result;
}

vector<ll> berlekamp_massey(const vector<ll>& sequence) {
    vector<ll> connection(1, 1);
    vector<ll> previous(1, 1);
    int length = 0;
    int shift = 1;
    ll previous_discrepancy = 1;

    for (int n = 0; n < (int)sequence.size(); ++n) {
        ll discrepancy = sequence[n];
        for (int i = 1; i <= length; ++i) {
            discrepancy = (discrepancy + connection[i] * sequence[n - i]) % MOD;
        }

        if (discrepancy == 0) {
            ++shift;
            continue;
        }

        vector<ll> old_connection = connection;
        ll scale = discrepancy * power(previous_discrepancy, MOD - 2) % MOD;

        int required_size = previous.size() + shift;
        if ((int)connection.size() < required_size) {
            connection.resize(required_size, 0);
        }

        for (int i = 0; i < (int)previous.size(); ++i) {
            connection[i + shift] =
                (connection[i + shift] - scale * previous[i]) % MOD;
            if (connection[i + shift] < 0) {
                connection[i + shift] += MOD;
            }
        }

        if (2 * length <= n) {
            length = n + 1 - length;
            previous = old_connection;
            previous_discrepancy = discrepancy;
            shift = 1;
        } else {
            ++shift;
        }
    }

    connection.resize(length + 1);
    vector<ll> recurrence(length);
    for (int i = 1; i <= length; ++i) {
        recurrence[i - 1] = (MOD - connection[i]) % MOD;
    }
    return recurrence;
}

vector<ll> multiply_polynomials(const vector<ll>& a, const vector<ll>& b,
                                const vector<ll>& recurrence) {
    int length = recurrence.size();
    vector<ll> product(2 * length - 1, 0);

    for (int i = 0; i < length; ++i) {
        for (int j = 0; j < length; ++j) {
            product[i + j] = (product[i + j] + a[i] * b[j]) % MOD;
        }
    }

    for (int degree = 2 * length - 2; degree >= length; --degree) {
        for (int i = 1; i <= length; ++i) {
            product[degree - i] =
                (product[degree - i] + product[degree] * recurrence[i - 1]) %
                MOD;
        }
    }

    product.resize(length);
    return product;
}

ll linear_recurrence_nth(const vector<ll>& initial,
                         const vector<ll>& recurrence, ll n) {
    int length = recurrence.size();
    if (length == 0) {
        return 0;
    }
    if (n < (ll)initial.size()) {
        return initial[n];
    }

    vector<ll> result(length, 0);
    vector<ll> base(length, 0);
    result[0] = 1;

    if (length == 1) {
        base[0] = recurrence[0];
    } else {
        base[1] = 1;
    }

    while (n > 0) {
        if (n % 2 == 1) {
            result = multiply_polynomials(result, base, recurrence);
        }
        base = multiply_polynomials(base, base, recurrence);
        n /= 2;
    }

    ll answer = 0;
    for (int i = 0; i < length; ++i) {
        answer = (answer + result[i] * initial[i]) % MOD;
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int m;
    ll n;
    cin >> m >> n;

    vector<ll> sequence(m);
    for (ll& value : sequence) {
        cin >> value;
        value %= MOD;
        if (value < 0) {
            value += MOD;
        }
    }

    vector<ll> recurrence = berlekamp_massey(sequence);
    cout << recurrence.size() << '\n';
    for (int i = 0; i < (int)recurrence.size(); ++i) {
        if (i > 0) {
            cout << ' ';
        }
        cout << recurrence[i];
    }
    cout << '\n';
    cout << linear_recurrence_nth(sequence, recurrence, n) << '\n';
    return 0;
}
```

## 边界与限制

- 全零序列的最短递推阶数是 `0`，其所有后续项仍为 `0`；
- 若 `n` 已在输入前缀内，程序直接返回已知项；
- 连接多项式使用 `C_i=-c_i`，输出时必须再取一次相反数；
- 序列下标从 `0` 开始，这是多项式指数和递推项自然对应的少数场景；
- `MOD` 必须让算法中出现的非零偏差可逆；固定质数模数最简单；
- 有限前缀只能保证拟合当前样本，不能证明题目背后一定存在同一条无限递推；
- 若真实阶数为 `L`，用于恢复的前缀太短，求出的递推可能只是暂时成立。

## 常见错误

- 把连接多项式系数直接当成递推系数，忘记二者符号相反；
- 计算偏差时漏掉 `C_0s_n=s_n`；
- 修正时没有乘 `d/b`，只能碰巧消掉某些偏差；
- `2L <= n` 时更新长度，却忘记保存修改前的 `C`；
- 把 `shift` 理解成多项式长度，而不是两次关键更新之间的位置差；
- 在合数模数下仍用费马小定理求逆元；
- 多项式降次时从低次向高次处理，使刚产生的高次项没有继续消去；
- 只给很少的样本项，就把拟合结果当成真实规律。

## 需要记住什么

- Berlekamp–Massey 解决的输入和输出分别是什么？
- 连接多项式的系数为什么与递推系数符号相反？
- 偏差 `d` 怎样判断当前递推能否解释新的一项？
- 为什么 `C-(d/b)x^mB` 能恰好消掉当前偏差？
- `2L <= n` 时为什么必须扩大递推阶数？
- 为什么算法要求在域上工作？
- 得到递推以后，怎样通过特征多项式求很远的一项？
