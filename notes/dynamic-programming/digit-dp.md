# 数位 DP

> 最近修订：2026-08-17 08:05 +10:00（未审阅）

要统计 `0..N` 中满足某种数位性质的整数，直接枚举每个数需要 $O(N)$。当
$N$ 接近 $10^{18}$ 时不可行，但十进制表示最多只有 `19` 位。

数位 DP 不枚举整数本身，而是从高位到低位构造数字。状态记录已经处理到哪一位、
当前性质的统计量，以及前缀是否仍贴着上界。大量拥有相同后续条件的前缀会合并
到同一个状态。

本篇统计闭区间 `[L,R]` 中十进制数位和等于 `target` 的整数数量。

## 从区间变成前缀

先定义：

$$
F(N)=\#\{x\mid0\le x\le N,\ digit\_sum(x)=target\}.
$$

那么：

$$
answer(L,R)=F(R)-F(L-1).
$$

这与前缀和相同：两个上界计数之差得到闭区间答案。只需解决“统计不超过一个
上界”的问题。

当 `N < 0` 时定义 `F(N)=0`，从而 `L=0` 时的 `F(L-1)` 不需要额外分支。

## 固定长度与前导零

设 `N` 有 `m` 位。所有较短的非负整数都可以在左侧补零，统一成长度 `m`：

```text
7    -> 0007
42   -> 0042
105  -> 0105
```

前导零不改变数位和，因此本题不需要额外记录“数字是否已经开始”。

若性质涉及：

- 实际位数；
- 第一个非零数字；
- 数字中是否出现 `0`；
- 相邻真实数位关系；

前导零就不能总当普通零，需要增加 `started` 状态区分尚未开始与真实数字中的
零。

## 阶段、状态与决策

从最高位向最低位填写。

### 阶段

`pos` 表示当前准备填写第 `pos` 位，范围为 `1..m`。

### 状态

`current_sum` 表示已填写前缀的数位和。

`tight` 表示此前前缀是否与上界 `N` 的对应前缀完全相同：

- `tight = true`：当前位不能超过 `N` 的这一位；
- `tight = false`：此前已经更小，当前位可以任取 `0..9`。

### 决策

选择当前位数字 `digit`。

因此递归状态是：

```cpp
dfs(pos, current_sum, tight)
```

它返回从当前状态继续填写，最终数位和等于 `target` 的方案数。

## 上界限制

当前位最大可选数字：

```cpp
int upper = tight ? digits[pos] : 9;
```

枚举：

```cpp
for (int digit = 0; digit <= upper; digit++) {
    bool next_tight =
        tight && digit == digits[pos];
}
```

只有原来仍贴着上界，并且当前位也选择上界对应数字，下一位才继续受限。

若当前位选得更小，整个前缀已经严格小于 `N`；无论后面怎样填都不会超过上界，
`next_tight` 永远变成 `false`。

## 结束状态

当 `pos > m` 时，所有数位都已填写：

```cpp
if (pos > digit_count) {
    return current_sum == target;
}
```

布尔表达式会转换成 `0` 或 `1`：

- 数位和恰好等于目标，得到一种合法整数；
- 否则没有合法方案。

若 `current_sum > target`，后续数位非负，不可能再减回来，可以提前返回 `0`。

## 为什么只缓存非受限状态

`tight = false` 时，后续只取决于：

```text
pos 和 current_sum
```

可以使用：

```cpp
memo[pos][current_sum]
```

`tight = true` 的状态依赖当前上界具体前缀。在一次 `F(N)` 中每层最多只有一个
受限状态，直接计算即可；不缓存还能避免不同上界调用之间误用旧结果。

本篇每次调用 `count_up_to` 都重新初始化 `digits` 与 `memo`，因此两次前缀
计数彼此独立。

## 转移

```cpp
ll answer = 0;

for (int digit = 0; digit <= upper; digit++) {
    bool next_tight =
        tight && digit == digits[pos];
    answer += dfs(
        pos + 1,
        current_sum + digit,
        next_tight);
}
```

不同 `digit` 代表当前位不同，生成的整数互不重复；所有不超过上界的整数在每一
位又都有唯一选择，因此不会遗漏。

## 完整代码

输入 `L,R,target`，统计闭区间 `[L,R]` 中数位和等于 `target` 的非负整数
数量。保证 `0 <= L <= R <= 10^18`，答案在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int digit_count;
int target;
vector<int> digits;
vector<vector<ll>> memo;

ll dfs(int pos, int current_sum, bool tight) {
    if (current_sum > target) {
        return 0;
    }

    if (pos > digit_count) {
        return current_sum == target;
    }

    if (!tight && memo[pos][current_sum] != -1) {
        return memo[pos][current_sum];
    }

    int upper = tight ? digits[pos] : 9;
    ll answer = 0;

    for (int digit = 0; digit <= upper; digit++) {
        bool next_tight =
            tight && digit == digits[pos];
        answer += dfs(
            pos + 1,
            current_sum + digit,
            next_tight);
    }

    if (!tight) {
        memo[pos][current_sum] = answer;
    }
    return answer;
}

ll count_up_to(ll limit) {
    if (limit < 0) {
        return 0;
    }

    string text = to_string(limit);
    digit_count = text.size();

    if (target < 0 || target > 9 * digit_count) {
        return 0;
    }

    digits.assign(digit_count + 5, 0);

    for (int i = 1; i <= digit_count; i++) {
        digits[i] = text[i - 1] - '0';
    }

    memo.assign(
        digit_count + 5,
        vector<ll>(target + 1, -1));
    return dfs(1, 0, true);
}

void solve() {
    ll l, r;
    cin >> l >> r >> target;
    cout << count_up_to(r) -
            count_up_to(l - 1)
         << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

`string` 原生下标为 0-based。代码在 `count_up_to` 的边界一次性转换成
1-based `digits`，此后 DP 阶段统一使用位置 `1..digit_count`。

## 复杂度

数位数为 $m$，目标和为 $S$。非受限状态数为 $O(mS)$，每个状态枚举十个数字：

- 单次 `F(N)` 时间复杂度：$O(10mS)$；
- 空间复杂度：$O(mS)$。

对 64 位整数，$m\le19$，因此状态数量远小于上界 `N` 本身。

## 常见错误

- 直接枚举 `0..N`，没有利用数位长度很小；
- `tight` 更新成 `digit == upper`，却忘记原状态可能已经不受限；
- 当前前缀变小以后仍用上界数字限制后续位；
- 区间答案忘记减去 `F(L-1)`；
- 性质涉及真实位数或数字 `0` 时仍忽略 `started`；
- 缓存受限状态并跨不同上界复用；
- 在 `string` 与自定义数位数组之间反复混用 0-based 和 1-based。

## 需要记住什么

- 为什么 `[L,R]` 计数可以转成两个前缀上界计数？
- `pos`、`current_sum` 和 `tight` 分别表达什么？
- `tight` 在什么条件下继续为真？
- 为什么本题可以把前导零当成普通零，哪些性质不可以？
- 为什么只缓存 `tight = false` 的状态就足够？

