# Stirling 数

> 最近修订：2026-08-17 12:02 +10:00（未审阅）

Stirling 数有两类，解决的是两个不同但结构相似的问题：

- 第二类 Stirling 数：把 $n$ 个不同元素分成 $k$ 个非空、无标号集合；
- 无符号第一类 Stirling 数：$n$ 个不同元素的排列中，恰好含 $k$ 个排列环。

两类递推都可以从“第 $n$ 个元素是单独形成新结构，还是加入已有结构”得到。
共同学习它们的价值不是记住相似名字，而是看清两个乘法系数分别在选择什么。

## 第二类：把人分成非空组

用：

$$
\left\{\begin{matrix}n\\k\end{matrix}\right\}
$$

表示把 $n$ 个不同元素分成 $k$ 个非空、彼此没有编号的集合的方案数。

例如把 `{1,2,3}` 分成两个集合，共有：

```text
{1} | {2, 3}
{2} | {1, 3}
{3} | {1, 2}
```

左右交换组的书写顺序不产生新方案。

## 第二类递推

观察第 $n$ 个元素：

1. 它单独组成一个新集合：其余 $n-1$ 个元素分成 $k-1$ 组，方案数为
   $\left\{\begin{smallmatrix}n-1\\k-1\end{smallmatrix}\right\}$；
2. 它加入已有集合：先把其余元素分成 $k$ 组，再从这 $k$ 组中选择一组加入，
   方案数为
   $k\left\{\begin{smallmatrix}n-1\\k\end{smallmatrix}\right\}$。

所以：

$$
\left\{\begin{matrix}n\\k\end{matrix}\right\}
=
\left\{\begin{matrix}n-1\\k-1\end{matrix}\right\}
+k\left\{\begin{matrix}n-1\\k\end{matrix}\right\}.
$$

组没有固定名字，但在一份已经形成的具体划分中，确实存在 $k$ 个可以让新元素
加入的集合，因此乘数仍然是 $k$。

## 第一类：排列中有多少个环

任意排列都能唯一分解成若干个不相交的环。例如排列：

```text
1 -> 3, 3 -> 1
2 -> 4, 4 -> 2
```

写成环为：

```text
(1 3)(2 4)
```

它含有两个排列环。

用：

$$
\left[\begin{matrix}n\\k\end{matrix}\right]
$$

表示 $n$ 个元素的排列中恰好含 $k$ 个环的方案数。本文全部使用**无符号第一类
Stirling 数**；有些代数公式会给它附加 $(-1)^{n-k}$ 符号，不能混为同一数列。

## 第一类递推

同样观察第 $n$ 个元素：

1. 它单独形成新环 `(n)`：其余元素需要恰好形成 $k-1$ 个环，方案数为
   $\left[\begin{smallmatrix}n-1\\k-1\end{smallmatrix}\right]$；
2. 它插入已有环：先让其余元素形成 $k$ 个环，再把 `n` 插入某个元素后面。

一份含 $n-1$ 个元素的环分解中，每个旧元素后面都是一个不同插入位置，总共有
$n-1$ 个位置。因此：

$$
\left[\begin{matrix}n\\k\end{matrix}\right]
=
\left[\begin{matrix}n-1\\k-1\end{matrix}\right]
+(n-1)\left[\begin{matrix}n-1\\k\end{matrix}\right].
$$

注意第一类乘的是 $n-1$ 个环内位置，不是 $k$ 个环；即使只存在一个长环，
其中仍有许多不同插入位置。

## 共同边界

两类数都使用：

$$
S(0,0)=1.
$$

把零个元素组织成零个结构有一种空方案。对 $n>0$：

$$
S(n,0)=0,
$$

因为非空元素无法分成零组，也无法形成零个排列环。若 $k>n$，答案同样为 0。

## 一维递推为什么倒序

两类递推都只依赖上一层 `n-1`。使用一维数组时，`group` 必须从大到小更新：

```cpp
for (int group = min(i, k); group >= 1; group--) {
    // group-1 与 group 此时都仍是上一层的值
}
```

若从小到大更新，`dp[group-1]` 已经属于当前层，会在同一次加入元素时重复使用
第 `i` 个元素。

## 完整代码

输入 `n k mod`，依次输出第二类 Stirling 数与无符号第一类 Stirling 数模
`mod` 的结果。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

pair<ll, ll> stirling_numbers(int n, int k, ll mod) {
    vector<ll> second(k + 5, 0);
    vector<ll> first(k + 5, 0);
    second[0] = first[0] = 1 % mod;

    for (int i = 1; i <= n; i++) {
        for (int group = min(i, k); group >= 1; group--) {
            second[group] = (second[group - 1] + group * second[group]) % mod;
            first[group] = (first[group - 1] + (i - 1LL) * first[group]) % mod;
        }

        second[0] = 0;
        first[0] = 0;
    }

    return {second[k], first[k]};
}

void solve() {
    int n, k;
    ll mod;
    cin >> n >> k >> mod;

    auto [second, first] = stirling_numbers(n, k, mod);
    cout << second << ' ' << first << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

时间复杂度为 $O(nk)$，空间复杂度为 $O(k)$。乘法中一个因子可能达到 `n` 或
`k`；代码假设模数和规模使 64 位乘法安全，超出时应按题目范围替换安全模乘。

## 两类数怎样避免混淆

可以始终问“已有结构中，新元素有多少个加入位置”：

- 集合划分：选择已有的 $k$ 个集合之一，所以乘 $k$；
- 排列环：选择已有的 $n-1$ 个元素之一，并插在它后面，所以乘 $n-1$。

如果只背大括号与中括号，很容易在题目换一种记号时失效；从加入新元素的操作
重新推导，系数会自然出现。

## 常见关联

第二类 Stirling 数可以把“使用了多少个不同非空类别”分层计数；乘上 $k!$ 后，
就把无标号的 $k$ 组分配给 $k$ 个不同标签，得到满射数量。

第一类 Stirling 数按排列环数量分类所有排列，因此：

$$
\sum_{k=0}^{n}
\left[\begin{matrix}n\\k\end{matrix}\right]
=n!.
$$

第二类把全部集合划分按组数分类，其行和是 Bell 数。Bell 数只作为关系说明；
遇到真正需要的计数问题时，再决定是否单独维护。

## 常见错误

- 把第二类的无标号集合误当成有编号盒子，额外乘上 $k!$；
- 第二类递推把“加入已有组”的系数写成 `n-1`；
- 第一类递推把环数量 `k` 误当成插入位置数量；
- 混淆有符号与无符号第一类 Stirling 数；
- 忘记 `S(0,0)=1` 或让 `S(n,0)` 在 `n>0` 时继续保持 1；
- 一维递推从小到大，错误使用本层刚更新的状态；
- `k>n` 时访问不存在状态，或误认为仍有方案。

## 需要记住什么

- 第二类 Stirling 数计算什么，为什么组没有标号？
- 第二类递推中的两类方案是什么，系数为什么是 $k$？
- 无符号第一类 Stirling 数计算什么？
- 第一类递推中，新元素为什么有 $n-1$ 个环内插入位置？
- 两类数共同的空结构边界是什么？
- 一维递推为什么必须倒序更新组数？
