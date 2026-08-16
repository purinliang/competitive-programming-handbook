# 多项式：卷积与朴素乘法

> 最近修订：2026-08-17 12:30 +10:00（未审阅）

有两组整数，分别从每组选择一个数。对每个 $k$，想知道两数之和等于 $k$ 的
选择方案数。

设 `a[i]` 是第一组中数值 `i` 的出现次数，`b[j]` 是第二组中数值 `j` 的出现
次数。若选择值 `i` 与 `j`，得到的和为 `i+j`，方案数贡献：

$$
a_i b_j.
$$

因此：

$$
c_k=\sum_{i+j=k}a_i b_j.
$$

这个“按下标和聚合乘积”的操作称为卷积。它也恰好就是多项式乘法的系数规则。

## 从单项式乘法开始

两个单项式相乘：

$$
(a_ix^i)(b_jx^j)=a_ib_jx^{i+j}.
$$

指数相加，系数相乘。将：

$$
A(x)=\sum_i a_ix^i,
\qquad
B(x)=\sum_j b_jx^j
$$

展开相乘，所有指数和相同的项合并：

$$
C(x)=A(x)B(x),
\qquad
c_k=\sum_{i+j=k}a_i b_j.
$$

所以多项式乘法与频次配对不是两个偶然相似的模板，而是同一个卷积结构。

## 结果需要多长

若 `A` 的次数为 `n`，`B` 的次数为 `m`，最高次项相乘得到：

$$
a_nb_mx^{n+m}.
$$

乘积次数至多为 `n+m`，系数数组需要：

$$
n+m+1
$$

个位置，对应下标 `0..n+m`。

用系数数组长度表示时，结果长度是：

```cpp
a.size() + b.size() - 1
```

少写或多写这个 `-1` 都是常见边界错误。

## 朴素乘法

枚举两边每一对系数：

```cpp
for (int i = 0; i < a.size(); i++) {
    for (int j = 0; j < b.size(); j++) {
        result[i + j] += a[i] * b[j];
    }
}
```

每一对 `(i,j)` 只向指数 `i+j` 贡献一次，恰好实现卷积定义。

若两多项式次数分别为 $n$ 和 $m$：

- 时间复杂度：$O((n+1)(m+1))$，通常简写为 $O(nm)$；
- 结果空间：$O(n+m)$。

## 一个配对和例子

第一组数为：

```text
0, 1, 1, 3
```

频次数组为：

```text
a = [1, 2, 0, 1]
```

第二组数为：

```text
1, 2
```

频次数组为：

```text
b = [0, 1, 1]
```

和为 2 的配对来自：

- `0+2`：`a[0]*b[2] = 1` 种；
- `1+1`：`a[1]*b[1] = 2` 种。

所以卷积结果 `c[2] = 3`。

这种建模可以把“枚举两个集合的所有配对”转换成“先统计值域频次，再做一次
卷积”。FFT 与 NTT 将加速的正是这一步，而不是改变配对计数的含义。

## 完整代码

输入两个整系数多项式的次数和从低次到高次的系数，输出乘积次数与全部系数。
代码保留零多项式的单元素表示，并删除乘积末尾无意义的零。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

void normalize(vector<ll>& coefficient) {
    while (coefficient.size() > 1 && coefficient.back() == 0) {
        coefficient.pop_back();
    }
}

vector<ll> multiply(const vector<ll>& a, const vector<ll>& b) {
    vector<ll> result(a.size() + b.size() - 1, 0);

    for (int i = 0; i < (int)a.size(); i++) {
        for (int j = 0; j < (int)b.size(); j++) {
            result[i + j] += a[i] * b[j];
        }
    }

    normalize(result);
    return result;
}

vector<ll> read_polynomial() {
    int degree;
    cin >> degree;

    vector<ll> coefficient(degree + 1);
    for (ll& value : coefficient) {
        cin >> value;
    }

    normalize(coefficient);
    return coefficient;
}

void solve() {
    vector<ll> a = read_polynomial();
    vector<ll> b = read_polynomial();
    vector<ll> result = multiply(a, b);

    cout << (int)result.size() - 1 << '\n';
    for (int i = 0; i < (int)result.size(); i++) {
        cout << result[i] << (i + 1 == (int)result.size() ? '\n' : ' ');
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 什么时候朴素乘法已经足够

若次数只有几百或一边多项式很短，$O(nm)$ 往往比 FFT/NTT 更简单、常数更小。
例如一边只有 20 项，另一边有十万项时，直接卷积约两百万次乘加，完全可能是
最佳选择。

快速卷积通常按两边总长度达到 $O(n\log n)$，但有固定的变换、补零和模运算
成本。算法选择应比较真实规模，不应因为已经学会 FFT 就替换所有双重循环。

## 取模卷积

若系数只关心模 `mod` 的结果，每次乘加都应取模：

```cpp
result[i + j] += a[i] * b[j] % mod;
result[i + j] %= mod;
```

这仍是同一朴素卷积。模数是否支持 NTT 只影响后续加速方法，不影响卷积定义。

普通整系数代码必须保证每个乘积和最终系数都在 64 位整数范围内；高精度系数或
极大组合计数需要另行选择数值表示。

## 卷积不只来自普通加法

本篇卷积按照下标普通相加聚合，因此也称加法卷积。某些问题会按照按位 OR、AND
或 XOR 合并下标，形成对应的集合卷积或位运算卷积；它们需要不同变换。

先识别“两个选择组合后，结果下标怎样由两个原下标得到”，再决定使用哪一种
卷积，不能把所有配对问题都交给普通多项式乘法。

## 常见错误

- 乘积系数写入 `result[max(i,j)]`，而不是 `result[i+j]`；
- 次数分别为 `n,m` 时只分配 `n+m` 个系数，漏掉下标 `n+m`；
- 用数组长度计算结果时忘记减 1；
- 频次数组没有覆盖完整值域，下标与真实数值不一致；
- 把有序配对与无序配对混淆，错误除以 2；
- 系数需要取模时等所有乘加结束才取模，中间已经溢出；
- 规模很小时仍强行使用复杂快速变换；
- 下标组合规则不是普通加法时仍套多项式卷积。

## 需要记住什么

- 为什么单项式相乘时指数相加、系数相乘？
- 卷积系数 $c_k$ 怎样由所有 `i+j=k` 的配对得到？
- 两多项式的次数和系数数组长度分别怎样计算？
- 频次数组卷积为什么能统计两组数的配对和？
- 朴素乘法的时间复杂度是什么，什么规模下已经足够？
- 怎样判断一个问题需要普通加法卷积还是其他下标合并方式？
