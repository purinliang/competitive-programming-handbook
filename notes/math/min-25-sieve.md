# Min_25 筛

> 最近修订：2026-08-23 07:58 +10:00（未审阅）

杜教筛需要找到一个合适的狄利克雷卷积伙伴，使卷积结果的前缀和容易计算。另一些积性
函数可以直接写出每个质数幂的值，质数处的函数值也是质数幂次的线性组合，却没有同样
简洁的卷积递推。

Min_25 筛先快速求出：

$$
\sum_{p\le x}f(p)
$$

在所有必要位置的值，再按照最小质因数唯一枚举合数及其质数幂指数，从而计算：

$$
\sum_{i=1}^{n}f(i).
$$

本文使用经典模板函数：

$$
f(1)=1,
\qquad
f(p^e)=p^{2e}-p^e
$$

并规定 `f` 是积性函数。这个例子不是因为函数公式本身特别常用，而是因为：

- $f(p)=p^2-p$，需要同时维护质数一次幂和二次幂前缀；
- $f(p^e)$ 不能只由 $f(p)^e$ 得到，必须正确枚举质数幂；
- 它完整覆盖 Min_25 模板的两阶段结构。

答案对质数 $10^9+7$ 取模。

## 什么条件适合 Min_25 筛

本文框架要求：

1. `f` 是积性函数；
2. 任意质数幂 $f(p^e)$ 能快速计算；
3. 质数处的 $f(p)$ 能写成少数个 $p^k$ 的线性组合；
4. 只需要单个或少量很大 `n` 的前缀和。

第三条使我们可以先筛出若干质数幂次和，再组合成 $\sum f(p)$。若质数处的函数值没有
可快速筛出的统一表达，Min_25 也不会自动解决问题。

## 只需要 O(sqrt(n)) 个参数位置

整除商：

$$
\left\lfloor\frac ni\right\rfloor
$$

只有 $O(\sqrt n)$ 个不同值。依次取：

$$
w=\left\lfloor\frac n{left}\right\rfloor,
$$

相同值延续到：

$$
right=\left\lfloor\frac nw\right\rfloor.
$$

把所有不同 `w` 按从大到小保存。后续出现的参数都是对已有整除商继续做整数除法，
仍然属于这张表。

为 $O(1)$ 找到某个 `w` 的位置，令：

- `w <= sqrt(n)` 时使用 `small_id[w]`；
- `w > sqrt(n)` 时使用 `large_id[n / w]`。

大整除商的 `n/w` 很小，两张长度约 $\sqrt n$ 的索引表足以覆盖全部状态。

## 先把所有整数当作候选质数

本文需要：

$$
G_1(x)=\sum_{p\le x}p,
\qquad
G_2(x)=\sum_{p\le x}p^2.
$$

初始化时还没有删除合数，先计算 `2..x` 中全部整数的一次幂和二次幂：

$$
g_1(x)=\frac{x(x+1)}2-1,
$$

$$
g_2(x)=\frac{x(x+1)(2x+1)}6-1.
$$

减去 `1` 是因为质数从 `2` 开始。所有运算都在模 `MOD` 下进行。

接下来模仿埃拉托斯特尼筛，按质数从小到大删除合数贡献。

## 用最小质因数删除合数

处理质数 `p` 以前，`g_k(x)` 中仍保留：

- 已经处理过的较小质数本身；
- 没有任何质因数小于 `p` 的整数。

对于 $x\ge p^2$，最小质因数恰好为 `p` 的合数都能唯一写成：

$$
p\cdot t,
\qquad p\le t\le x/p,
$$

其中 `t` 没有更小质因数。

`g_k(x/p)` 还包含所有小于 `p` 的质数，需要减去它们的真实前缀和。设：

$$
S_k(p-1)=\sum_{q<p}q^k,
$$

则这次应从 `g_k(x)` 删除：

$$
p^k\left(g_k(x/p)-S_k(p-1)\right).
$$

所以更新为：

$$
g_k(x)\mathrel{-}=
p^k\left(g_k(x/p)-S_k(p-1)\right).
$$

每个合数只在处理其最小质因数时被删除一次。所有不超过 $\sqrt x$ 的质数处理完后，
`g_k(x)` 中只剩质数贡献，正好成为 $G_k(x)$。

更新 `w` 时必须按从大到小顺序。当前需要读取的 `g_k(w/p)` 比 `w` 小，尚未被当前
质数 `p` 更新，仍保持公式要求的上一阶段状态。

## 得到质数处的函数值前缀

本文：

$$
f(p)=p^2-p.
$$

因此：

$$
\sum_{p\le x}f(p)
=
G_2(x)-G_1(x).
$$

第一阶段已经为所有必要 `x` 求出右侧两项，不需要再枚举到 `x` 的全部质数。

同时对不超过 $\sqrt n$ 的真实质数建立：

$$
prime\_prefix(i)
=
\sum_{j=1}^{i}f(p_j).
$$

递归时可以从 `G_2(x)-G_1(x)` 中减去编号更小的质数，只保留允许的最小质因数范围。

## 按最小质因数唯一分解合数

定义 `summatory(x, first)`：统计 `2..x` 中，最小质因数编号不小于 `first` 的所有
整数的 `f` 值之和。

先加入所有允许质数的一次幂贡献：

$$
\sum_{p_{first}\le p\le x}f(p).
$$

其余每个合数都能唯一写成：

$$
p_i^e\cdot m,
$$

其中：

- $i\ge first$；
- $e\ge1$；
- `m = 1`，或 `m` 的所有质因数都严格大于 $p_i$。

严格大于而不是大于等于，保证 $p_i$ 的全部指数都被收进 $p_i^e$，每个整数只出现
一次。

## 递归中怎样加入纯质数幂

固定 `p = p_i` 和当前 `power = p^e`。

若剩余部分 `m > 1`，贡献为：

$$
f(p^e)\cdot
summatory(\lfloor x/p^e\rfloor,i+1).
$$

纯质数 $p$ 已经在初始质数贡献中计数，但纯质数幂 $p^2,p^3,\ldots$ 还没有。因此在
当前指数 `e` 的循环中，再加入下一次幂：

$$
f(p^{e+1}).
$$

合起来：

$$
f(p^e)\cdot summatory(\lfloor x/p^e\rfloor,i+1)
+f(p^{e+1}).
$$

只要 $p^{e+1}\le x$ 就继续。这样：

- `e=1` 时加入含一个 `p` 的合数，以及纯 $p^2$；
- `e=2` 时加入含 $p^2$ 的更大合数，以及纯 $p^3$；
- 每种最小质因数和指数只出现一次。

最后加回 $f(1)=1$，得到完整前缀和。

## 完整代码

输入 `n`，计算上述积性函数的前缀和：

$$
\sum_{i=1}^{n}f(i)\pmod{10^9+7}.
$$

保证 `1 <= n <= 10^10`。代码只为不超过 $\sqrt n$ 的范围筛质数，并保存
$O(\sqrt n)$ 个不同整除商。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;
const ll INVERSE_TWO = (MOD + 1) / 2;
const ll INVERSE_SIX = 166666668;

ll n;
int root;
vector<int> primes;
vector<char> is_composite;
vector<ll> prefix_prime_one;
vector<ll> prefix_prime_two;
vector<ll> prefix_prime_function;

vector<ll> quotient_values;
vector<ll> prime_sum_one;
vector<ll> prime_sum_two;
vector<int> small_id;
vector<int> large_id;

ll normalize(ll value) {
    value %= MOD;
    if (value < 0) {
        value += MOD;
    }
    return value;
}

ll sum_first_powers(ll limit) {
    ll x = limit % MOD;
    return x * ((x + 1) % MOD) % MOD * INVERSE_TWO % MOD;
}

ll sum_second_powers(ll limit) {
    ll x = limit % MOD;
    return x * ((x + 1) % MOD) % MOD * ((2 * x + 1) % MOD) % MOD * INVERSE_SIX %
           MOD;
}

void prepare_primes() {
    is_composite.assign(root + 5, 0);

    for (int i = 2; i <= root; ++i) {
        if (!is_composite[i]) {
            primes.push_back(i);
        }

        for (int p : primes) {
            if (p > root / i) {
                break;
            }
            is_composite[i * p] = 1;
            if (i % p == 0) {
                break;
            }
        }
    }

    prefix_prime_one.assign(primes.size() + 1, 0);
    prefix_prime_two.assign(primes.size() + 1, 0);
    prefix_prime_function.assign(primes.size() + 1, 0);

    for (int i = 0; i < (int)primes.size(); ++i) {
        ll p = primes[i];
        ll p_squared = p * p % MOD;
        prefix_prime_one[i + 1] = (prefix_prime_one[i] + p) % MOD;
        prefix_prime_two[i + 1] = (prefix_prime_two[i] + p_squared) % MOD;
        prefix_prime_function[i + 1] =
            (prefix_prime_function[i] + p_squared - p + MOD) % MOD;
    }
}

int quotient_id(ll value) {
    if (value <= root) {
        return small_id[value];
    }
    return large_id[n / value];
}

void prepare_quotients() {
    small_id.assign(root + 5, 0);
    large_id.assign(root + 5, 0);

    for (ll left = 1, right; left <= n; left = right + 1) {
        ll value = n / left;
        right = n / value;

        int id = quotient_values.size();
        quotient_values.push_back(value);
        prime_sum_one.push_back(normalize(sum_first_powers(value) - 1));
        prime_sum_two.push_back(normalize(sum_second_powers(value) - 1));

        if (value <= root) {
            small_id[value] = id;
        } else {
            large_id[n / value] = id;
        }
    }
}

void sieve_prime_sums() {
    for (int i = 0; i < (int)primes.size(); ++i) {
        ll p = primes[i];
        ll p_squared_integer = p * p;
        ll p_squared_mod = p_squared_integer % MOD;

        for (int id = 0; id < (int)quotient_values.size(); ++id) {
            ll value = quotient_values[id];
            if (value < p_squared_integer) {
                break;
            }

            int reduced_id = quotient_id(value / p);
            ll remove_one =
                p % MOD *
                normalize(prime_sum_one[reduced_id] - prefix_prime_one[i]) %
                MOD;
            ll remove_two =
                p_squared_mod *
                normalize(prime_sum_two[reduced_id] - prefix_prime_two[i]) %
                MOD;

            prime_sum_one[id] = normalize(prime_sum_one[id] - remove_one);
            prime_sum_two[id] = normalize(prime_sum_two[id] - remove_two);
        }
    }
}

ll prime_power_value(ll prime_power) {
    ll value = prime_power % MOD;
    return value * normalize(value - 1) % MOD;
}

ll prime_value_sum(ll limit) {
    if (limit < 2) {
        return 0;
    }
    int id = quotient_id(limit);
    return normalize(prime_sum_two[id] - prime_sum_one[id]);
}

ll summatory(ll limit, int first_prime) {
    if (limit < 2) {
        return 0;
    }
    if (first_prime < (int)primes.size() && primes[first_prime] > limit) {
        return 0;
    }

    ll answer =
        normalize(prime_value_sum(limit) - prefix_prime_function[first_prime]);

    for (int i = first_prime; i < (int)primes.size(); ++i) {
        ll p = primes[i];
        if (p > limit / p) {
            break;
        }

        ll power = p;
        while (power <= limit / p) {
            ll next_power = power * p;
            ll with_larger_primes = summatory(limit / power, i + 1);

            answer = (answer + prime_power_value(power) * with_larger_primes +
                      prime_power_value(next_power)) %
                     MOD;

            power = next_power;
        }
    }

    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    root = sqrt((long double)n);
    while (1LL * (root + 1) * (root + 1) <= n) {
        ++root;
    }
    while (1LL * root * root > n) {
        --root;
    }

    prepare_primes();
    prepare_quotients();
    sieve_prime_sums();

    cout << (summatory(n, 0) + 1) % MOD << '\n';
    return 0;
}
```

## 复杂度

Min_25 筛保存 $O(\sqrt n)$ 个整除商，并只预处理到 $\sqrt n$ 的质数。经典复杂度
分析给出：

- 第一阶段质数幂次和筛法约为 $O(n^{3/4}/\log n)$；
- 第二阶段最小质因数递归在常见可处理函数上处于同一量级；
- 空间复杂度为 $O(\sqrt n)$。

具体常数与需要维护的 $p^k$ 种类、质数幂函数计算成本有关。Min_25 比杜教筛模板长，
只有目标函数确实缺少更简单卷积递推时才值得使用。

## 与杜教筛的区别

杜教筛从一个容易求前缀和的卷积关系出发，把目标前缀和递归成较小前缀和。

Min_25 筛则分两步：

1. 用改造的质数筛求 $\sum_{p\le x}f(p)$；
2. 按最小质因数和指数枚举所有合数。

若欧拉函数、莫比乌斯函数等已经有非常简洁的杜教筛递推，优先使用更短的算法。
Min_25 的价值在于处理“质数处是多项式、质数幂可计算，但没有方便卷积伙伴”的积性
函数，不是无条件替换其他筛法。

## 常见错误

- 初始化 `g` 时忘记减去整数 `1`；
- 质数筛更新时没有减去“小于当前质数的真实质数前缀”；
- 按从小到大更新整除商，使 `g(value/p)` 已被当前质数污染；
- 把 $f(p)=p^2-p$ 错写成完全积性的 $f(p^e)=f(p)^e$；
- 递归允许剩余部分继续含当前质数，导致同一个整数重复分解；
- 初始质数贡献已经包含 $f(p)$，质数幂循环又重复加入一次；
- 漏掉纯质数幂 $p^2,p^3,\ldots$；
- 最终忘记加回 $f(1)=1$；
- 把所有乘法留在 64 位原值中，而不是及时对 `MOD` 取模；
- 对不满足适用条件的任意积性函数直接套模板。

## 需要记住什么

- Min_25 筛适合怎样的积性函数？
- 为什么只需保存 $O(\sqrt n)$ 个不同整除商？
- 质数前缀筛初始化时为什么先把所有 `2..x` 整数都算进去？
- 删除最小质因数为 `p` 的合数时，为什么要减去较小质数前缀？
- 怎样由 $G_1,G_2$ 得到本文的质数函数值前缀？
- 合数怎样按最小质因数、指数和更大质因数部分唯一分解？
- 递归式为什么同时加入“剩余部分非空”和“纯下一次质数幂”两类贡献？
