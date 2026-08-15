# 组合数：阶乘与逆元预处理

> 最近修订：2026-08-15 22:55 +10:00（未审阅）

[组合数：定义与递推](binomial-coefficients.md) 可以使用 Pascal 递推计算 $C(n,k)$。它只需要加法，适用于任意正模数，但单次计算需要 $O(nk)$ 时间。

若一道题要回答大量询问，例如每次给出 `n,k`，求：

$$
C(n,k)\bmod 1000000007,
$$

为每次询问重新递推就太慢了。我们希望先做一次预处理，此后每次询问只进行常数次运算。

本篇处理一个常见且明确的场景：模数 `MOD` 是固定质数，所有询问都满足：

$$
0\le n\le \text{max\_n}<MOD.
$$

## 从阶乘公式开始

组合数的阶乘公式是：

$$
C(n,k)=\frac{n!}{k!(n-k)!}.
$$

若预先保存每个阶乘：

```cpp
factorial[0] = 1;
for (int i = 1; i <= max_n; i++) {
    factorial[i] = factorial[i - 1] * i % MOD;
}
```

就能立刻取得 `n!`、`k!` 与 `(n-k)!`。

但是取模以后不能直接使用 C++ 的整数除法。要把除法改写成乘法，需要使用[模逆元](modular-inverse.md)：

$$
C(n,k)\equiv n!\times(k!)^{-1}\times((n-k)!)^{-1}\pmod {MOD}.
$$

因此除了 `factorial[i]`，还需要保存：

$$
\text{inverse\_factorial}[i]=(i!)^{-1}\pmod {MOD}.
$$

## 为什么要求 max_n 小于 MOD

`MOD` 是质数，并不意味着每个整数都能取逆。模 `MOD` 等于 `0` 的数没有逆元。

若 `max_n>=MOD`，那么 `factorial[max_n]` 含有因子 `MOD`：

$$
\text{factorial}[\text{max\_n}]\equiv0\pmod {MOD}.
$$

此时不能求它的逆元，下面的预处理方法失效。

当 `0<=max_n<MOD` 时，`1..max_n` 都不被 `MOD` 整除，每个阶乘都与 `MOD` 互质，因此都存在逆元。

> `n>=MOD` 时，组合数本身仍然有意义，只是不能直接使用本篇的阶乘表。后续的 Lucas 定理等方法会处理这类范围。

## 先求最大的逆阶乘

按照定义逐个快速幂求每个逆阶乘，需要 `max_n` 次 $O(\log MOD)$ 运算。其实只需求一次逆元。

先根据[费马小定理](fermat-little-theorem.md)，用快速幂求出最大阶乘的逆元：

```cpp
inverse_factorial[max_n] = power(factorial[max_n], MOD - 2);
```

这一步得到：

$$
\text{inverse\_factorial}[\text{max\_n}]=(\text{max\_n}!)^{-1}.
$$

接下来要从它推出前一个逆阶乘。

## 从 i! 倒推 (i-1)!

阶乘满足：

$$
i!=(i-1)!\times i.
$$

两边取逆：

$$
(i!)^{-1}=((i-1)!)^{-1}\times i^{-1}.
$$

为了求 `((i-1)!)^{-1}`，两边再乘 `i`：

$$
((i-1)!)^{-1}=(i!)^{-1}\times i.
$$

于是可以从大到小递推：

```cpp
for (int i = max_n; i >= 1; i--) {
    inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
}
```

这里没有再次求逆。已知 `i!` 的逆元，只乘一次 `i` 就得到 `(i-1)!` 的逆元，所以整张逆阶乘表只需要一次快速幂。

## 回答组合数询问

预处理完成后，直接翻译公式：

```cpp
ll choose(int n, int k) const {
    if (k < 0 || k > n) {
        return 0;
    }

    return factorial[n] * inverse_factorial[k] % MOD * inverse_factorial[n - k] % MOD;
}
```

非法的选择数量没有方案，因此返回 `0`。合法调用还必须满足构造对象时约定的 `0<=n<=max_n`。

`factorial[0]` 与 `inverse_factorial[0]` 都表示 $0!=1$，所以位置 `0` 是有意义的数学状态，不是被浪费的下标。`vector` 仍统一额外保留 `+5` 个空间。

## 为什么使用 struct

阶乘表、逆阶乘表、预处理上界与 `choose` 共同维护同一个对象：先按一个上界建立表，再反复查询。

因此使用 `struct Combinations` 把持续状态和操作封装在一起，避免把两张表作为共享全局变量散落在程序中：

```cpp
struct Combinations {
    int max_n;
    vector<ll> factorial;
    vector<ll> inverse_factorial;

    Combinations(int max_n) : max_n(max_n), factorial(max_n + 5), inverse_factorial(max_n + 5) {
        init();
    }

    void init() {
        // 建立两张表。
    }

    ll choose(int n, int k) const {
        // 回答一次询问。
    }
};
```

这与无状态的单次 `gcd` 或快速幂不同：组合数对象会在多次 `choose` 调用之间持续保存预处理结果。

## 完整代码

下面的程序先读入最大 `n` 和询问数，再回答每个组合数询问。模数固定为竞赛中常见的质数 `1000000007`。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

ll power(ll a, ll b) {
    ll answer = 1;
    while (b > 0) {
        if (b % 2 == 1) {
            answer = answer * a % MOD;
        }
        a = a * a % MOD;
        b /= 2;
    }
    return answer;
}

struct Combinations {
    int max_n;
    vector<ll> factorial;
    vector<ll> inverse_factorial;

    Combinations(int max_n) : max_n(max_n), factorial(max_n + 5), inverse_factorial(max_n + 5) {
        init();
    }

    void init() {
        factorial[0] = 1;
        for (int i = 1; i <= max_n; i++) {
            factorial[i] = factorial[i - 1] * i % MOD;
        }

        inverse_factorial[max_n] = power(factorial[max_n], MOD - 2);
        for (int i = max_n; i >= 1; i--) {
            inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
        }
    }

    ll choose(int n, int k) const {
        if (k < 0 || k > n) {
            return 0;
        }

        return factorial[n] * inverse_factorial[k] % MOD * inverse_factorial[n - k] % MOD;
    }
};

int main() {
    int max_n, q;
    scanf("%d%d", &max_n, &q);

    Combinations combinations(max_n);
    while (q--) {
        int n, k;
        scanf("%d%d", &n, &k);
        printf("%lld\n", combinations.choose(n, k));
    }
    return 0;
}
```

输入：

```text
5 4
5 2
5 0
5 6
3 1
```

输出：

```text
10
1
0
3
```

## 正确性

预处理结束后，对每个 `0<=i<=max_n`：

- `factorial[i]` 等于 $i!\bmod MOD$；
- `inverse_factorial[i]` 等于 $(i!)^{-1}\bmod MOD$。

第一条由阶乘递推直接成立。第二条先通过费马小定理在 `i=max_n` 时成立；若它对 `i` 成立，则倒序转移乘以 `i`，根据 $i!=(i-1)!i$ 得到 `(i-1)!` 的逆元，因此归纳到 `0` 都成立。

对于合法询问，`choose` 返回：

$$
n!\times(k!)^{-1}\times((n-k)!)^{-1}\equiv C(n,k)\pmod {MOD}.
$$

对于 `k<0` 或 `k>n`，不存在合法选择，返回 `0`。所以所有满足适用条件的询问都得到正确结果。

## 复杂度

阶乘表需要 $O(max\_n)$ 次乘法，最大逆阶乘需要一次 $O(\log MOD)$ 的快速幂，倒推逆阶乘表再需要 $O(max\_n)$ 次乘法。

因此预处理时间复杂度为：

$$
O(max\_n+\log MOD),
$$

空间复杂度为 $O(max\_n)$。预处理后，每次 `choose` 只做常数次数组访问与乘法，时间复杂度为 $O(1)$。

## 常见错误

### 在模意义下直接使用除法

`factorial[n]/factorial[k]` 是 C++ 整数除法，不是模除法。必须乘对应的模逆元。

### 没有确认模数是质数

`power(a,MOD-2)` 来自费马小定理，只能在 `MOD` 是质数且 `a%MOD!=0` 时作为逆元使用。

### 忽略 max_n 小于 MOD

若 `max_n>=MOD`，最大阶乘模 `MOD` 已经是 `0`，没有逆元。本篇方法不能直接使用。

### 每个逆阶乘都单独快速幂

这样虽然正确，却把预处理变成 $O(max\_n\log MOD)$。只求最大阶乘的逆元，再向下乘 `i` 即可。

### 忘记 0!

$0!=1$，而且 `C(n,0)`、`C(n,n)` 都会访问 `inverse_factorial[0]`。阶乘表必须从 `factorial[0]=1` 开始。

### 查询超过预处理上界

构造时只建立到 `max_n` 的表。调用 `choose(n,k)` 前必须保证 `n<=max_n`，不能从带有 `+5` 余量的 `vector.size()` 推断合法上界。

## 基础练习

1. 手算模 `7` 下 `factorial[0..5]` 与 `inverse_factorial[0..5]`。
2. 从 $i!=(i-1)!i$ 独立推出逆阶乘的倒序转移。
3. 说明为什么只需要一次快速幂，而不是为每个 `i` 求一次逆元。
4. 使用代码验证 `C(n,k)=C(n,n-k)`。
5. 使用代码验证 Pascal 递推在模 `MOD` 下仍然成立。
6. 解释 `max_n>=MOD` 时具体是哪一个数首先使阶乘变成 `0`。

## 需要记住什么

1. 为什么取模后的组合数公式需要逆阶乘？
2. `factorial[i]` 与 `inverse_factorial[i]` 分别保存什么？
3. 为什么能从 `inverse_factorial[i]` 乘 `i` 得到 `inverse_factorial[i-1]`？
4. 整张逆阶乘表需要多少次快速幂？
5. 本篇方法对 `MOD` 和 `max_n` 有什么条件？
6. 预处理与单次询问的时间复杂度分别是什么？

若 `n>=MOD`，可以继续阅读 [组合数：Lucas 定理（正文待写）](../CATALOG.md#05-数学)。
