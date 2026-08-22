# 杜教筛

> 最近修订：2026-08-23 07:41 +10:00（未审阅）

欧拉筛可以在线性时间求出 `1..n` 的全部欧拉函数或莫比乌斯函数值。但有些问题只问
一个很大的前缀和：

$$
\Phi(n)=\sum_{i=1}^{n}\varphi(i),
\qquad
M(n)=\sum_{i=1}^{n}\mu(i).
$$

若仍然把每个函数值都筛出来，时间和内存都至少是 $O(n)$。杜教筛利用狄利克雷卷积
关系，把目标前缀和递归成若干个 $\lfloor n/i\rfloor$ 处的较小前缀和，再按相同商的
连续区间合并计算。

本文同时求 $\Phi(n)$ 和 $M(n)$，重点解释递推式从哪里来，以及为什么记忆化后只会
遇到很少的不同参数。

## 狄利克雷卷积的前缀和

对两个数论函数 $f,g$，它们的狄利克雷卷积定义为：

$$
(f*g)(n)=\sum_{d\mid n}f(d)g(n/d).
$$

设前缀和：

$$
F(x)=\sum_{i=1}^{x}f(i),
\qquad
G(x)=\sum_{i=1}^{x}g(i).
$$

对卷积结果求前缀和：

$$
\begin{aligned}
\sum_{k=1}^{n}(f*g)(k)
&=\sum_{k=1}^{n}\sum_{d\mid k}f(d)g(k/d)\\
&=\sum_{ab\le n}f(a)g(b).
\end{aligned}
$$

固定 `a`，可以写成：

$$
\sum_{a=1}^{n}f(a)G(\lfloor n/a\rfloor).
$$

也可以固定 `b`，写成：

$$
\sum_{b=1}^{n}g(b)F(\lfloor n/b\rfloor).
$$

杜教筛会选择一个卷积伙伴 `g`，使卷积 $f*g$ 的前缀和容易直接计算，再从第二个式子
中分离 `b=1` 的 $F(n)$。

## 选择常函数 1

定义常函数：

$$
\mathbf{1}(n)=1.
$$

它在 `1` 处也等于 `1`。若 $h=f*\mathbf{1}$，则：

$$
\sum_{k=1}^{n}h(k)
=
\sum_{i=1}^{n}F(\lfloor n/i\rfloor).
$$

记左侧为 $H(n)$。把 `i=1` 的一项单独拿出来：

$$
H(n)=F(n)+\sum_{i=2}^{n}F(\lfloor n/i\rfloor).
$$

因此得到通用递推：

$$
\boxed{
F(n)=H(n)-\sum_{i=2}^{n}F(\lfloor n/i\rfloor)
}
$$

只要 $H(n)$ 有简单公式，就能递归求 $F(n)$。

## 欧拉函数前缀和

欧拉函数满足经典约数和：

$$
\sum_{d\mid n}\varphi(d)=n.
$$

也就是：

$$
\varphi*\mathbf{1}=\mathrm{id},
$$

其中 $\mathrm{id}(n)=n$。卷积结果的前缀和为：

$$
H(n)=\sum_{i=1}^{n}i=\frac{n(n+1)}2.
$$

所以：

$$
\boxed{
\Phi(n)
=
\frac{n(n+1)}2
-\sum_{i=2}^{n}\Phi(\lfloor n/i\rfloor)
}
$$

## 莫比乌斯函数前缀和

莫比乌斯函数满足：

$$
\sum_{d\mid n}\mu(d)
=
\begin{cases}
1,&n=1,\\
0,&n>1.
\end{cases}
$$

右侧称为卷积单位函数 $\varepsilon$，因此：

$$
\mu*\mathbf{1}=\varepsilon.
$$

对任意 $n\ge1$，$\varepsilon$ 的前缀和恒为 `1`。所以：

$$
\boxed{
M(n)
=
1-\sum_{i=2}^{n}M(\lfloor n/i\rfloor)
}
$$

两个递推的结构完全相同，只有容易计算的 $H(n)$ 不同。

## 相同整除商形成连续区间

递推式仍然看似需要枚举 `i=2..n`。关键是：

$$
q=\left\lfloor\frac ni\right\rfloor
$$

只会取得 $O(\sqrt n)$ 个不同值。

若当前左端点为 `left`，令：

$$
q=\left\lfloor\frac n{left}\right\rfloor,
$$

那么所有满足相同商 `q` 的最大右端点为：

$$
right=\left\lfloor\frac nq\right\rfloor.
$$

因此整段贡献为：

$$
(right-left+1)F(q).
$$

代码按区间跳跃：

```cpp
for (ll left = 2, right; left <= n; left = right + 1) {
    ll quotient = n / left;
    right = n / quotient;
    answer -= (right - left + 1) * summatory(quotient);
}
```

## 小范围筛表，大范围递归

若递归一直算到 `n=1`，许多小参数仍会反复出现。先用欧拉筛预处理 `1..limit` 的
$\varphi$、$\mu$ 及其前缀和：

- 查询 `n <= limit` 时直接返回数组；
- 更大的 `n` 才使用递推；
- 每个大参数第一次算完后放入哈希表，后续直接复用。

从初始 `n` 出发，递归参数都形如：

$$
\left\lfloor\frac nd\right\rfloor.
$$

大于 $\sqrt n$ 的不同值至多约 $\sqrt n$ 个，小于等于预处理边界的值由数组接管，
不会形成指数递归树。

对单次查询，常取：

$$
limit\approx n^{2/3},
$$

使预处理与递归部分平衡，得到常见的约 $O(n^{2/3})$ 时间复杂度。

## 欧拉筛同时预处理 phi 与 mu

质数 `p` 第一次出现时：

```cpp
phi[p] = p - 1;
mu[p] = -1;
```

用 `p` 生成 `i*p`：

- 若 `p` 整除 `i`，则 `phi[i*p] = phi[i]*p`，且 `mu[i*p] = 0`；
- 否则新增一个不同质因数，`phi[i*p] = phi[i]*(p-1)`，并令 `mu[i*p] = -mu[i]`。

筛完后分别建立 64 位前缀和。单个 `mu[i]` 只需 `int`，但它的前缀和可能为负数，
统一使用 `long long`。

## 完整代码

输入 `n`，输出：

```text
sum(phi(1..n)) sum(mu(1..n))
```

保证 `1 <= n <= 10^9`。在这个范围内 $\Phi(n)$、中间乘积与 $M(n)$ 都能放入 64 位
整数。程序根据 `n` 选择约 $n^{2/3}$ 的预处理边界。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int sieve_limit;
vector<int> primes;
vector<int> phi;
vector<int> mu;
vector<char> is_composite;
vector<ll> prefix_phi;
vector<ll> prefix_mu;
unordered_map<ll, ll> phi_cache;
unordered_map<ll, ll> mu_cache;

void prepare_sieve() {
    phi.assign(sieve_limit + 5, 0);
    mu.assign(sieve_limit + 5, 0);
    is_composite.assign(sieve_limit + 5, 0);
    prefix_phi.assign(sieve_limit + 5, 0);
    prefix_mu.assign(sieve_limit + 5, 0);

    phi[1] = 1;
    mu[1] = 1;

    for (int i = 2; i <= sieve_limit; ++i) {
        if (!is_composite[i]) {
            primes.push_back(i);
            phi[i] = i - 1;
            mu[i] = -1;
        }

        for (int p : primes) {
            if (p > sieve_limit / i) {
                break;
            }

            int value = i * p;
            is_composite[value] = 1;
            if (i % p == 0) {
                phi[value] = phi[i] * p;
                mu[value] = 0;
                break;
            }

            phi[value] = phi[i] * (p - 1);
            mu[value] = -mu[i];
        }
    }

    for (int i = 1; i <= sieve_limit; ++i) {
        prefix_phi[i] = prefix_phi[i - 1] + phi[i];
        prefix_mu[i] = prefix_mu[i - 1] + mu[i];
    }
}

ll summatory_phi(ll n) {
    if (n <= sieve_limit) {
        return prefix_phi[n];
    }

    auto iterator = phi_cache.find(n);
    if (iterator != phi_cache.end()) {
        return iterator->second;
    }

    ll answer = n * (n + 1) / 2;
    for (ll left = 2, right; left <= n; left = right + 1) {
        ll quotient = n / left;
        right = n / quotient;
        answer -= (right - left + 1) * summatory_phi(quotient);
    }

    phi_cache[n] = answer;
    return answer;
}

ll summatory_mu(ll n) {
    if (n <= sieve_limit) {
        return prefix_mu[n];
    }

    auto iterator = mu_cache.find(n);
    if (iterator != mu_cache.end()) {
        return iterator->second;
    }

    ll answer = 1;
    for (ll left = 2, right; left <= n; left = right + 1) {
        ll quotient = n / left;
        right = n / quotient;
        answer -= (right - left + 1) * summatory_mu(quotient);
    }

    mu_cache[n] = answer;
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll n;
    cin >> n;

    ll suggested_limit = pow((long double)n, 2.0L / 3.0L);
    sieve_limit = min(n, max(1LL, suggested_limit));
    prepare_sieve();

    cout << summatory_phi(n) << ' ' << summatory_mu(n) << '\n';
    return 0;
}
```

`pow` 只用于选择性能参数 `sieve_limit`，向下取整一两个位置不会影响正确性。所有函数
值与递推仍完全使用整数运算。

## 复杂度

令预处理边界 $B\approx n^{2/3}$：

- 欧拉筛时间与数组空间为 $O(B)$；
- 记忆化递归配合相同整除商分块，单次查询常见时间复杂度约为 $O(n^{2/3})$；
- 哈希表只保存大于 `B` 的不同 $\lfloor n/d\rfloor$ 状态，数量为 $O(n/B)$ 量级。

复杂度常数会受到哈希表、查询数量和目标函数影响。多次查询共享同一最大范围时，应
统一选择预处理边界并复用筛表和缓存，而不是每次重新初始化。

## 怎样判断一个函数能否使用杜教筛

杜教筛不是“任何积性函数前缀和”的通用黑盒。需要找到一个函数 `g`，使：

1. 卷积 $h=f*g$ 的前缀和容易计算；
2. `g(1)` 可逆，通常直接等于 `1`；
3. 递推中按 $\lfloor n/i\rfloor$ 分块后，`g` 在区间上的和也容易取得。

本文选择 $g=\mathbf{1}$，所以区间权重只是长度。欧拉函数和莫比乌斯函数恰好拥有特别
简单的卷积结果。没有合适卷积关系时，强行套递推不会自动得到快速算法。

## 常见错误

- 把 $\varphi*\mathbf{1}=\mathrm{id}$ 写成逐项相乘；
- 莫比乌斯卷积结果的前缀和写成 `0`，忘记 `n=1` 的单位项；
- 通用递推没有分离 `i=1`，导致 `F(n)` 在右侧自我引用；
- 枚举每个 `i`，没有把相同 $\lfloor n/i\rfloor$ 合成连续区间；
- 右端点写成 `n / left`，而不是 `n / quotient`；
- 大参数递归结果没有记忆化；
- 预处理数组使用 `int` 保存欧拉函数前缀和；
- 输入范围超过 64 位安全范围，却仍直接计算 `n*(n+1)/2`；
- 看到积性函数就默认存在简单的杜教筛卷积伙伴。

## 需要记住什么

- 狄利克雷卷积前缀和怎样改写成双变量乘积区域上的求和？
- 为什么选择常函数 $\mathbf{1}$ 后能分离出目标前缀和 $F(n)$？
- 欧拉函数和莫比乌斯函数分别与 $\mathbf{1}$ 卷积成什么？
- 相同 $\lfloor n/i\rfloor$ 的最大右端点怎样计算？
- 预处理数组、递归和哈希缓存分别负责哪些参数范围？
- 为什么杜教筛必须先找到容易求前缀和的卷积结果？
