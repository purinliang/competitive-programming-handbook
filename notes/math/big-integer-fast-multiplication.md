# 高精度整数：快速乘法

> 最近修订：2026-08-17 02:04 +10:00（未审阅）

朴素竖式会让两个操作数的每一对数字块相乘，复杂度是 $O(nm)$。位数足够大时，
可以把大整数看成多项式：先用 FFT 或 NTT 求系数卷积，再统一处理进位，把乘法
降到 $O(n\log n)$ 量级。

这项优化不属于基础学习路线。本篇重点解释快速乘法怎样选择数字块、NTT 为什么能
精确恢复卷积，以及 FFT 的浮点误差为什么不能只凭“`double` 有 15 位精度”忽略。
完整模板使用单模数 NTT，并明确限制输入范围。

## 把整数看成多项式

以内部进制 `BASE` 保存两个非负整数：

$$
A=a_0+a_1BASE+a_2BASE^2+\cdots,
$$

$$
B=b_0+b_1BASE+b_2BASE^2+\cdots.
$$

先忽略进位，把数字块作为两个多项式的系数：

$$
P(x)=a_0+a_1x+a_2x^2+\cdots,
$$

$$
Q(x)=b_0+b_1x+b_2x^2+\cdots.
$$

乘积多项式第 `k` 项是卷积：

$$
c_k=\sum_{i+j=k}a_i b_j.
$$

最后令 `x=BASE`，从低项到高项统一进位：

```cpp
ll current = coefficient[i] + carry;
digit[i] = current % BASE;
carry = current / BASE;
```

因此快速高精度乘法可以拆成两步：

1. 精确计算整数系数卷积；
2. 按内部进制处理进位。

多项式常数项的指数就是 `0`，NTT 数组也原生使用 0-based 下标，所以本篇模板用
`digit[0]` 保存最低块。这不是普通题目编号改成 0-based，而是直接使用多项式系数
下标与标准 NTT 接口。

## 快速乘法不能直接使用九位块

[压位高精度](packed-big-integer.md) 的朴素乘法每加入一个块乘积就立即进位，因此
`BASE=10^9` 时中间值仍小于 $10^{18}$。

卷积却会先把同一项的所有块乘积累加，再统一进位。若两个操作数分别有 `n,m` 个块，
任意卷积系数满足：

$$
c_k\leq \min(n,m)(BASE-1)^2.
$$

这个上界随着块数增加。普通竖式模板的九位块不能原样搬进单模数 NTT。

## 单模数 NTT 的精确条件

NTT 在模数 `MOD` 下计算卷积，得到的是：

$$
c_k\bmod MOD.
$$

若要把结果直接当作真实整数系数，必须事先证明：

$$
0\leq c_k<MOD.
$$

否则真实系数与它相差若干个 `MOD`，这些信息已经在取模时丢失，后续进位无法恢复。

本篇使用常见 NTT 模数：

```cpp
const int MOD = 998244353;
const int ROOT = 3;
```

并选择：

```cpp
const int WIDTH = 2;
const int BASE = 100;
```

每个块只保存两位十进制数字。若两个输入都不超过一万位，各自最多有 5000 个块，
所以：

$$
c_k\leq 5000\times 99^2=49005000<998244353.
$$

单次 NTT 得到的模数结果就是精确卷积系数。

模板不会只依赖文字范围，还在运行时检查：

```cpp
ll coefficient_bound = (ll)min(a.size(), b.size())
    * (BASE - 1) * (BASE - 1);
assert(coefficient_bound < MOD);
```

若扩大输入范围或 `BASE`，断言会直接暴露单模数已经不够。

## NTT 求卷积

NTT 与 FFT 都使用分治快速计算离散变换。区别在于 NTT 的旋转因子位于有限域中，
所有加减乘都对 `MOD` 精确进行，没有浮点舍入误差。

把两个系数数组补零到同一个二次幂长度：

```cpp
int length = 1;
while (length < a.size() + b.size()) {
    length *= 2;
}
```

分别做正变换，逐点相乘，再做逆变换，就得到卷积。`998244353-1` 含有因子
$2^{23}$，所以变换长度不能超过 $2^{23}$；模板也对此断言。

## 统一处理进位

逆 NTT 得到的 `coefficient[i]` 还可能大于 `BASE-1`。从低位到高位处理：

```cpp
ll carry = 0;
for (int i = 0; i < coefficient.size() || carry > 0; i++) {
    if (i == coefficient.size()) {
        coefficient.push_back(0);
    }

    ll current = coefficient[i] + carry;
    coefficient[i] = current % BASE;
    carry = current / BASE;
}
```

进位以后，每个块重新落在 `[0,BASE)`。最后删除最高位多余的零块，但至少保留
一个零块表示整数零。

## 完整代码

下面的程序计算两个不超过一万位的非负十进制整数乘积。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MOD = 998244353;
const int ROOT = 3;
const int WIDTH = 2;
const int BASE = 100;

int power(int a, int b) {
    ll result = 1;
    ll base = a;
    while (b > 0) {
        if (b % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        b /= 2;
    }
    return result;
}

void ntt(vector<int>& a, bool inverse) {
    int n = a.size();

    for (int i = 1, j = 0; i < n; i++) {
        int bit = n / 2;
        while (j & bit) {
            j ^= bit;
            bit /= 2;
        }
        j ^= bit;
        if (i < j) {
            swap(a[i], a[j]);
        }
    }

    for (int len = 2; len <= n; len *= 2) {
        int root = power(ROOT, (MOD - 1) / len);
        if (inverse) {
            root = power(root, MOD - 2);
        }

        for (int l = 0; l < n; l += len) {
            ll current_root = 1;
            for (int i = 0; i < len / 2; i++) {
                int left = a[l + i];
                int right = current_root * a[l + i + len / 2]
                    % MOD;

                a[l + i] = left + right;
                if (a[l + i] >= MOD) {
                    a[l + i] -= MOD;
                }

                a[l + i + len / 2] = left - right;
                if (a[l + i + len / 2] < 0) {
                    a[l + i + len / 2] += MOD;
                }

                current_root = current_root * root % MOD;
            }
        }
    }

    if (inverse) {
        int inverse_n = power(n, MOD - 2);
        for (int& value : a) {
            value = (ll)value * inverse_n % MOD;
        }
    }
}

vector<int> parse(const string& s) {
    vector<int> digit;
    for (int r = s.size(); r > 0; r -= WIDTH) {
        int l = max(0, r - WIDTH);
        int value = 0;
        for (int i = l; i < r; i++) {
            value = value * 10 + s[i] - '0';
        }
        digit.push_back(value);
    }
    while (digit.size() > 1 && digit.back() == 0) {
        digit.pop_back();
    }
    return digit;
}

vector<int> multiply(vector<int> a, vector<int> b) {
    ll coefficient_bound = (ll)min(a.size(), b.size())
        * (BASE - 1) * (BASE - 1);
    assert(coefficient_bound < MOD);

    int length = 1;
    while (length < (int)a.size() + (int)b.size()) {
        length *= 2;
    }
    assert(length <= (1 << 23));

    a.resize(length);
    b.resize(length);
    ntt(a, false);
    ntt(b, false);

    vector<int> coefficient(length);
    for (int i = 0; i < length; i++) {
        coefficient[i] = (ll)a[i] * b[i] % MOD;
    }
    ntt(coefficient, true);

    ll carry = 0;
    for (int i = 0; i < (int)coefficient.size() || carry > 0; i++) {
        if (i == (int)coefficient.size()) {
            coefficient.push_back(0);
        }

        ll current = coefficient[i] + carry;
        coefficient[i] = current % BASE;
        carry = current / BASE;
    }

    while (coefficient.size() > 1 && coefficient.back() == 0) {
        coefficient.pop_back();
    }
    return coefficient;
}

string format(const vector<int>& digit) {
    string result = to_string(digit.back());
    for (int i = (int)digit.size() - 2; i >= 0; i--) {
        string part = to_string(digit[i]);
        int padding = WIDTH - (int)part.size();
        result += string(padding, '0') + part;
    }
    return result;
}

int main() {
    string sa, sb;
    cin >> sa >> sb;

    vector<int> a = parse(sa);
    vector<int> b = parse(sb);
    cout << format(multiply(a, b)) << '\n';
    return 0;
}
```

输入：

```text
12345678901234567890 98765432109876543210
```

输出：

```text
1219326311370217952237463801111263526900
```

## 为什么 NTT 以后还要检查模数上界

NTT 的每一步都是精确模运算，但“精确模 `MOD`”不等于“精确整数”。假设真实卷积
系数是 `MOD+7`，NTT 只会返回 `7`。它没有浮点误差，却仍然发生了模数回绕。

因此 NTT 高精度乘法至少要同时满足：

1. 变换长度受当前 NTT 模数支持；
2. 单模数或多模数的总范围大于真实卷积系数上界；
3. 进位中间类型能保存卷积系数与 carry 的和。

## 想压更多位怎么办

有三种常见办法。

### 使用多个 NTT 模数

分别在多个两两互质的 NTT 友好模数下计算卷积，再用中国剩余定理恢复真实系数。
若模数乘积为 `M`，需要证明：

$$
c_k<M.
$$

两个约十亿的模数乘积接近 $10^{18}$，重建时通常需要 `__int128` 避免中间乘法
溢出。每个模数支持的最大二次幂变换长度也可能不同，必须取共同可用范围。

### 拆分数字块

把一个较大块拆成高半与低半，分别计算若干次卷积，再按权值组合。这样能继续使用
单个模数，但需要更多次 NTT。

### 减小 `BASE`

这是最简单稳健的方法。本篇用 `BASE=100`，牺牲一部分块数，换来一眼可验证的
单模数精确范围。

## FFT 的精度能否忽略

不能只根据“`double` 大约有 15 到 16 位十进制有效数字”就忽略误差。

复数 FFT 的旋转因子是浮点近似值，变换会执行多层加减乘。误差会随长度、系数大小、
实现方式和数据分布累计。逆变换后，只有当每个真实整数系数与计算结果的误差都小于
`0.5`，四舍五入才一定恢复正确答案。

因此 `2^53` 附近的整数能被 `double` 精确表示，只是必要背景，不是“卷积系数小于
`2^53` 就必然正确”的充分条件。常见工程方法包括：

- 使用较小 `BASE`，让卷积系数远离精度极限；
- 把系数拆成高低部分，降低每次卷积的动态范围；
- 使用 `long double`；
- 对具体实现与最大规模进行误差分析和压力测试。

NTT 没有浮点舍入，但有模数范围限制；FFT 没有固定模数回绕，却有近似误差。两者
不是谁无条件更正确，而是需要证明不同的安全条件。竞赛中已经有可靠 NTT 模板时，
整数大数乘法优先使用 NTT 往往更容易建立精确性证明。

## 是否一万位就必须使用 NTT

不一定。一万位十进制整数若使用九位压位，只有约 1112 个块；朴素压位乘法只处理
约 124 万个块对。NTT 还包含变换、模幂、位逆序和补零常数，在某些环境中反而不如
简单竖式。

真正的切换阈值取决于实现与机器。成熟大整数库通常先从朴素乘法切换到 Karatsuba，
再到 Toom，规模更大时才使用 FFT。模板应按题目范围实测，而不是把某个十进制位数
当成永远正确的分界。

## 复杂度

设补零后的 NTT 长度是 `N`。正变换、逐点乘法和逆变换总时间复杂度是
$O(N\log N)$，空间复杂度是 $O(N)$。`N` 是不小于两个块数之和的最小二次幂。

使用多个模数时，复杂度再乘以 NTT 次数；使用较小 `BASE` 会增加块数和变换长度。

## 需要记住什么

1. 高精度乘法为什么可以转化为整数系数卷积？
2. 卷积完成后为什么还要统一进位？
3. 快速乘法的数字块为什么不能直接沿用朴素乘法的 `10^9`？
4. 单模数 NTT 要怎样证明卷积结果没有模数回绕？
5. 为什么本篇对一万位输入选择 `BASE=100`？
6. 多模数 NTT 怎样扩大可以恢复的系数范围？
7. 为什么 `double` 的有效位数不能单独保证 FFT 整数卷积正确？

## 扩展阅读

[GMP 乘法算法](https://gmplib.org/manual/Multiplication-Algorithms) 展示了成熟库怎样
按规模切换朴素乘法、Karatsuba、Toom 与 FFT；[OI Wiki：高精度计算](https://oi-wiki.org/math/bignum/)
也从多项式卷积解释了快速大整数乘法。
