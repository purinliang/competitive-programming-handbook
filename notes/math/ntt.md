# 多项式：NTT

> 最近修订：2026-08-17 13:04 +10:00（未审阅）

FFT 能在 $O(n\log n)$ 时间内计算卷积，但使用复数浮点运算，整数结果需要舍入。
若题目要求多项式系数模某个质数的精确结果，希望保留同样的快速蝶形结构，同时
完全避免浮点误差。

快速数论变换（Number Theoretic Transform，NTT）把复数单位根换成有限域中的
单位根。加法、减法、乘法和逆变换全部使用模整数运算，结果在指定模数下精确。

本篇使用竞赛中最常见的 NTT 质数：

$$
MOD=998244353=119\cdot2^{23}+1,
$$

它的一个原根是 3。因此它支持长度不超过 $2^{23}$ 的 2 的幂次变换。

## 有限域中的单位根

FFT 需要长度 `length` 的单位根，满足：

$$
w^{length}=1
$$

且更小的正指数不会提前得到 1。

模质数 `MOD` 的非零余数构成大小为 `MOD-1` 的乘法群。若 `g` 是原根，那么：

$$
w=g^{(MOD-1)/length}\bmod MOD
$$

在 `length` 整除 `MOD-1` 时具有所需阶数。

`998244353-1` 含有因子 $2^{23}$，所以长度 2、4、8 一直到 $2^{23}$ 都有对应
单位根，正好适合不断翻倍的迭代变换。

## 蝶形结构没有改变

对一对值 `even` 与 `odd`，NTT 仍计算：

```text
left  = even + root * odd
right = even - root * odd
```

区别只是：

- 复数乘法变成模乘法；
- 超过 `MOD` 的加法减回 `MOD`；
- 负数加上 `MOD` 规范回 `[0,MOD)`。

按指数奇偶分治、位逆序排列和逐层长度翻倍全部与 FFT 相同。

## 逆变换需要什么

正变换使用单位根 `root`。逆变换使用它的模逆元：

$$
root^{-1}=root^{MOD-2}\bmod MOD,
$$

这里使用费马小定理，因为 `MOD` 是质数且单位根非零。

全部蝶形完成后，每个结果还要乘以变换长度 `n` 的模逆元：

$$
n^{-1}=n^{MOD-2}\bmod MOD.
$$

这与逆 FFT 最后除以 `n` 是同一件事，只是在有限域中“除法”必须写成乘模逆元。

## 为什么仍要补零

长度为 `p` 和 `q` 的系数数组，普通卷积有 `p+q-1` 项。NTT 长度选择不小于
结果长度的最小 2 的幂。

若长度不足，高次项会模 $x^N-1$ 折回低次位置，得到循环卷积。补足零并选择
足够长度，才能让循环卷积在有效范围内等于普通卷积。

还必须检查长度不超过 $2^{23}$。超过以后，这个模数中不存在更高 2 的幂次单位
根，继续运行相同代码不会得到合法 NTT。

## 完整代码

输入两个整系数多项式，输出乘积系数模 `998244353` 的结果。输入系数可以为负，
读入后统一规范到 `[0,MOD)`；输入保证补零后的长度不超过 $2^{23}$。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 998244353;
const ll PRIMITIVE_ROOT = 3;
const int MAX_NTT_LENGTH = 1 << 23;

ll power_mod(ll a, ll exponent) {
    ll result = 1;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * a % MOD;
        }
        a = a * a % MOD;
        exponent /= 2;
    }

    return result;
}

void ntt(vector<ll>& value, bool inverse) {
    int n = value.size();

    for (int i = 1, j = 0; i < n; i++) {
        int bit = n / 2;

        while (j & bit) {
            j ^= bit;
            bit /= 2;
        }
        j ^= bit;

        if (i < j) {
            swap(value[i], value[j]);
        }
    }

    for (int length = 2; length <= n; length *= 2) {
        ll step = power_mod(PRIMITIVE_ROOT, (MOD - 1) / length);
        if (inverse) {
            step = power_mod(step, MOD - 2);
        }

        for (int start = 0; start < n; start += length) {
            ll root = 1;
            int half = length / 2;

            for (int offset = 0; offset < half; offset++) {
                ll even = value[start + offset];
                ll odd = value[start + offset + half] * root % MOD;

                value[start + offset] = even + odd;
                if (value[start + offset] >= MOD) {
                    value[start + offset] -= MOD;
                }

                value[start + offset + half] = even - odd;
                if (value[start + offset + half] < 0) {
                    value[start + offset + half] += MOD;
                }

                root = root * step % MOD;
            }
        }
    }

    if (inverse) {
        ll inverse_n = power_mod(n, MOD - 2);
        for (ll& x : value) {
            x = x * inverse_n % MOD;
        }
    }
}

vector<ll> convolution(const vector<ll>& a, const vector<ll>& b) {
    int needed = a.size() + b.size() - 1;
    int size = 1;

    while (size < needed) {
        size *= 2;
    }

    assert(size <= MAX_NTT_LENGTH);

    vector<ll> transformed_a(size, 0);
    vector<ll> transformed_b(size, 0);

    for (int i = 0; i < (int)a.size(); i++) {
        transformed_a[i] = (a[i] % MOD + MOD) % MOD;
    }
    for (int i = 0; i < (int)b.size(); i++) {
        transformed_b[i] = (b[i] % MOD + MOD) % MOD;
    }

    ntt(transformed_a, false);
    ntt(transformed_b, false);

    for (int i = 0; i < size; i++) {
        transformed_a[i] = transformed_a[i] * transformed_b[i] % MOD;
    }

    ntt(transformed_a, true);
    transformed_a.resize(needed);
    return transformed_a;
}

vector<ll> read_polynomial() {
    int degree;
    cin >> degree;

    vector<ll> coefficient(degree + 1);
    for (ll& value : coefficient) {
        cin >> value;
    }
    return coefficient;
}

void solve() {
    vector<ll> a = read_polynomial();
    vector<ll> b = read_polynomial();
    vector<ll> result = convolution(a, b);

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

## 为什么 NTT 是精确的

所有中间值都是模 `998244353` 的整数。乘法结果小于约 $10^{18}$，仍在 64 位
整数范围内；加减也立即规范到合法余数。因此没有复数近似、三角函数误差或最终
舍入。

精确指的是“模 `998244353` 的结果完全正确”，不表示能够直接恢复任意大的普通
整数系数。若真实系数可能超过模数，不同整数会得到相同余数，需要额外模数与
中国剩余定理才能恢复足够范围。

## 模数为什么不能随意替换

将 `MOD` 改成常见的 `1000000007`，这份 NTT 不再成立。它的 `MOD-1` 中只有
一个因子 2，无法提供长 2 的幂次单位根。

目标答案要求模其他数时，常见方案有：

- 若目标模数本身 NTT 友好，使用它对应的原根与最大长度；
- 在若干 NTT 友好质数下分别卷积，再用中国剩余定理合并；
- 系数与长度足够安全时使用 FFT 并舍入；
- 规模较小时直接使用朴素卷积。

选择方案取决于长度、系数范围和目标模数，不存在只改一行常量的万能 NTT。

## NTT 与 FFT 怎样选择

- 需要 `998244353` 等友好质数下精确卷积：NTT 最直接；
- 需要普通整数卷积且误差范围可证明安全：FFT 较灵活；
- 目标模数任意且必须精确：多模数 NTT 与 CRT；
- 一边很短或规模不大：朴素卷积。

NTT 通常比复数 FFT 更容易保证模结果正确，但模数与最大长度限制更强。

## 常见错误

- 认为任意质数都存在足够长的 2 的幂次单位根；
- 修改模数后仍保留原根 3 和最大长度 $2^{23}$；
- NTT 长度小于 `p+q-1`，得到循环卷积；
- 逆变换只使用逆单位根，却忘记乘 `n` 的模逆元；
- 模减法得到负数后没有加回 `MOD`；
- 输入系数为负时没有先规范化；
- 把模 `998244353` 的精确结果误当成任意大整数的完整系数；
- 小规模卷积仍承担 NTT 的实现和常数成本。

## 需要记住什么

- NTT 用什么代替 FFT 的复数单位根？
- 为什么变换长度必须整除 `MOD-1`？
- `998244353` 为什么最多支持 $2^{23}$ 长度？
- 逆 NTT 中单位根和整体长度分别怎样求逆？
- NTT 的“精确”具体指哪个模数意义？
- 目标模数不支持 NTT 时有哪些可靠替代方案？
