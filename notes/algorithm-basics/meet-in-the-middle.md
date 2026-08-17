# Meet-in-the-Middle

> 最近修订：2026-08-17 05:02 +10:00（未审阅）

[子集与位掩码枚举](subset-bitmask-enumeration.md) 可以在 $O(n2^n)$ 时间枚举全部
子集。$n=20$ 时约有一百万个子集，通常可行；$n=40$ 时却有约一万亿个子集，
无法直接枚举。

Meet-in-the-Middle 的中文常称**折半搜索**或**折半枚举**。它把一个候选拆成
独立的左右两半，分别枚举，再用排序和二分把两半重新配对。指数从 $2^n$ 降为
约 $2^{n/2}$。

## 问题：统计目标子集和

给定 $n$ 个整数 `a[1..n]` 和目标 `target`，统计有多少个下标子集的元素和
等于 `target`。

直接枚举需要 $2^n$ 个候选。折半后令：

```text
左半部分：a[1..mid]
右半部分：a[mid+1..n]
```

任意完整子集都能唯一拆成：

```text
一个左半子集 + 一个右半子集
```

若两半的元素和分别是 $x,y$，完整子集合法当且仅当：

$$
x+y=target.
$$

也就是在枚举到左半和 $x$ 时，需要知道右半有多少个子集和等于：

$$
target-x.
$$

## 分别枚举两半

长度为 $k$ 的一半只有 $2^k$ 个子集。生成闭区间 `a[l..r]` 的全部子集和：

```cpp
vector<ll> generate_sums(int l, int r) {
    if (l > r) {
        return {0};
    }

    int length = r - l + 1;
    int total_masks = 1 << length;
    vector<ll> sums;
    sums.reserve(total_masks);

    for (int mask = 0; mask < total_masks; mask++) {
        ll sum = 0;

        for (int bit = 0; bit < length; bit++) {
            if ((mask & (1 << bit)) != 0) {
                sum += a[l + bit];
            }
        }
        sums.push_back(sum);
    }
    return sums;
}
```

空集对应 `mask = 0`，其和为 `0`，必须保留。否则所有只选择另一半元素的答案
都会被漏掉。

当 $n\le40$ 时，每半最多 `20` 个元素和约一百万个子集，能够存进内存。

## 排序后寻找另一半

将右半全部子集和排序：

```cpp
sort(right_sums.begin(), right_sums.end());
```

对每个左半和 `left_sum`，目标右半和是：

```cpp
ll needed = target - left_sum;
```

右半数组可能含重复值，而且不同下标子集必须分别计数。因此不能只用
`binary_search` 判断存在性，而要找到等于 `needed` 的整个区间：

```cpp
auto first = lower_bound(
    right_sums.begin(), right_sums.end(), needed);
auto last = upper_bound(
    right_sums.begin(), right_sums.end(), needed);
answer += last - first;
```

`lower_bound` 找第一个不小于 `needed` 的位置，`upper_bound` 找第一个大于
`needed` 的位置，二者距离就是出现次数。

## 为什么不会遗漏或重复

一个完整下标子集与下面这对选择一一对应：

```text
(它在左半选择的下标集合，它在右半选择的下标集合)
```

算法枚举每个左半子集一次；对固定左半和，又统计所有和为
`target-left_sum` 的右半子集。因此：

- 每个合法完整子集都会在其唯一左半选择处被计数；
- 同一个完整子集不可能对应两对不同的左右选择；
- 右半相同的数值若来自不同子集，会由有序数组中的重复元素分别计数。

## 复杂度

设左右两半长度约为 $n/2$。按本篇的直接位掩码求和：

- 生成子集和：$O(n2^{n/2})$；
- 排序右半：$O(2^{n/2}\log 2^{n/2})$；
- 每个左半和二分两次：$O(2^{n/2}\log 2^{n/2})$；
- 空间复杂度：$O(2^{n/2})$。

使用递归或从低位转移可以把生成所有和的部分降为 $O(2^{n/2})$，但不会改变
折半后最关键的指数规模。本文保留与前置位掩码枚举一致的写法。

## 什么时候能够折半

折半不是把任意指数算法机械切开。它要求：

1. 一个完整候选能够拆成两个相对独立的部分；
2. 每一半都能枚举出一份简洁信息；
3. 两份信息能够快速判断是否兼容。

子集和中，每半信息只是一个“和”，兼容条件是两数相加等于目标。其他题目可能
保存最大值、状态、端点或若干统计量，再通过排序、二分、双指针或哈希表配对。

若两半仍需逐对检查，复杂度会重新变成
$2^{n/2}\times2^{n/2}=2^n$，折半就没有收益。

## 完整代码

下面统计和为 `target` 的下标子集数量。保证 $1\le n\le40$，任意子集和与答案
均在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int n;
ll target;
vector<ll> a;

vector<ll> generate_sums(int l, int r) {
    if (l > r) {
        return {0};
    }

    int length = r - l + 1;
    int total_masks = 1 << length;
    vector<ll> sums;
    sums.reserve(total_masks);

    for (int mask = 0; mask < total_masks; mask++) {
        ll sum = 0;

        for (int bit = 0; bit < length; bit++) {
            if ((mask & (1 << bit)) != 0) {
                sum += a[l + bit];
            }
        }
        sums.push_back(sum);
    }
    return sums;
}

void solve() {
    cin >> n >> target;

    a.assign(n + 5, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    int mid = n / 2;
    vector<ll> left_sums = generate_sums(1, mid);
    vector<ll> right_sums = generate_sums(mid + 1, n);

    sort(right_sums.begin(), right_sums.end());

    ll answer = 0;

    for (ll left_sum : left_sums) {
        ll needed = target - left_sum;
        auto first = lower_bound(
            right_sums.begin(), right_sums.end(), needed);
        auto last = upper_bound(
            right_sums.begin(), right_sums.end(), needed);
        answer += last - first;
    }

    cout << answer << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

当 `n = 1` 时，左半区间为空。函数直接返回只含 `0` 的结果，表示这一半唯一
可选的子集是空集。

## 常见错误

- 忘记把空集的和 `0` 放进两半结果；
- 只判断右半目标和是否存在，没有统计重复值；
- 两半枚举后仍然逐对检查，复杂度退回 $O(2^n)$；
- 使用 32 位整数保存子集和或答案；
- 把数组位置与位掩码位数的对应关系写错；
- 没有处理其中一半为空的边界；
- 认为任何指数搜索都能无条件折半。

## 需要记住什么

- 为什么 $2^{n/2}$ 与 $2^n$ 在实际可处理规模上差异巨大？
- 一个完整子集怎样唯一拆成左右两个子集？
- 为什么计数问题要使用 `lower_bound` 和 `upper_bound`？
- 折半有效需要候选满足哪三个条件？
- 为什么左右结果不能再逐对组合？
