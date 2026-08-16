# Nim、SG 函数与基础博弈论

> 最近修订：2026-08-17 11:08 +10:00（未审阅）

桌上有若干堆石子。两名玩家轮流选择一堆，拿走至少一颗石子；拿走最后一颗石子
的人获胜。双方都采用最优策略，先手是否必胜？若必胜，第一步应该怎样走？

这是 Nim 游戏。枚举整局游戏树会产生大量重复状态，而一个简单的按位异或就能
判断胜负。SG 函数进一步说明：许多由若干独立子游戏组成的公平组合游戏，都可以
转换成 Nim。

本篇只讨论正常规则下的有限公平组合游戏：

- 两名玩家轮流行动；
- 任一状态下双方拥有完全相同的合法操作；
- 游戏一定会在有限步内结束；
- 无法行动的人失败。

若双方可用操作不同、允许无限循环或采用“最后行动者失败”等规则，本文结论不能
直接套用。

## 从胜态与败态开始

不先猜公式，只看一个状态能走向哪些后继状态：

- **败态**：无论怎样行动，都会把胜态留给对手；
- **胜态**：至少存在一步能把败态留给对手。

终止状态没有合法操作，所以是败态。由此可以从小状态向大状态递推：

1. 能走到至少一个败态的状态是胜态；
2. 只能走到胜态的状态是败态。

所有博弈公式最终都必须符合这两个定义。

## Nim 的异或和

设各堆石子数为：

$$
a_1,a_2,\ldots,a_n.
$$

定义 Nim 和：

$$
X=a_1\oplus a_2\oplus\cdots\oplus a_n.
$$

结论是：

- $X=0$：当前状态是败态；
- $X\ne0$：当前状态是胜态。

## 为什么异或和为零时无法保持为零

一次操作只会把某一堆 `a[i]` 减小为 `b`。新异或和为：

$$
X'=X\oplus a_i\oplus b.
$$

若原来 $X=0$，则：

$$
X'=a_i\oplus b.
$$

因为 `b != a[i]`，两数异或不为 0。也就是说，从异或和为 0 的状态走一步，
一定进入异或和非 0 的状态。

## 为什么非零状态一定能走到零

设 $X\ne0$，取 $X$ 的最高位 1。因为这一位在全部石子堆中异或后为 1，至少
存在一堆 `a[i]` 的同一位也是 1。

令：

$$
b=a_i\oplus X.
$$

在最高不同位上，`a[i]` 为 1、`X` 也为 1，异或以后 `b` 变成 0；更高位完全
不变。因此：

$$
b<a_i,
$$

可以合法地从这堆拿走 `a[i]-b` 颗石子。新异或和为：

$$
X\oplus a_i\oplus b
=X\oplus a_i\oplus(a_i\oplus X)
=0.
$$

所以每个非零状态至少有一步走到零状态。结合上一节，异或和为 0 与非 0 恰好
分别满足败态和胜态的递推定义。

## Nim 完整代码

输入各堆石子数。若先手必败，输出 `Second`；若先手必胜，输出 `First`，并给出
一组 `pile remove_count`，表示从哪一堆拿走多少颗。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

void solve() {
    int n;
    cin >> n;

    vector<ll> pile(n + 5, 0);
    ll xor_sum = 0;

    for (int i = 1; i <= n; i++) {
        cin >> pile[i];
        xor_sum ^= pile[i];
    }

    if (xor_sum == 0) {
        cout << "Second\n";
        return;
    }

    cout << "First\n";

    for (int i = 1; i <= n; i++) {
        ll target = pile[i] ^ xor_sum;
        if (target < pile[i]) {
            cout << i << ' ' << pile[i] - target << '\n';
            return;
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 一堆石子的规则不再任意拿取

现在每堆石子只允许拿走集合 $S$ 中指定的数量。例如 $S=\{1,3,4\}$：一堆有
`x` 颗石子时，可以走到 `x-1`、`x-3` 或 `x-4`，但不能任意减小。

这时一堆大小 `x` 不再等价于 Nim 中大小为 `x` 的堆。需要为每个状态计算一个
新的等价 Nim 值，这就是 SG 函数。

## mex 与 SG 函数

`mex` 表示一个非负整数集合中没有出现的最小非负整数。例如：

```text
mex({1, 2, 4}) = 0
mex({0, 1, 3}) = 2
mex({0, 1, 2}) = 3
```

定义状态 `u` 的 SG 值：

$$
sg(u)=\mathrm{mex}\{sg(v)\mid u\to v\}.
$$

终止状态没有后继，后继 SG 集合为空，所以：

$$
sg(terminal)=\mathrm{mex}(\varnothing)=0.
$$

若 `sg(u) != 0`，mex 定义保证后继集合中包含 0，状态 `u` 可以走到败态；
若 `sg(u) == 0`，说明所有后继 SG 值都非零，只能走到胜态。因此：

> 一个状态是败态，当且仅当它的 SG 值为 0。

## 独立子游戏为什么仍然异或

若完整游戏由若干个互不影响的子游戏组成，每一步只在其中一个子游戏内行动，
则完整状态的 SG 值等于各子游戏 SG 值的异或：

$$
sg(G_1+G_2+\cdots+G_k)
=sg(G_1)\oplus sg(G_2)\oplus\cdots\oplus sg(G_k).
$$

这就是 Sprague–Grundy 定理。每个子游戏都等价于一堆大小为其 SG 值的 Nim
石子，因此组合游戏再次变成 Nim 和是否为 0 的判断。

“互不影响”很重要：一步操作必须只改变一个子游戏，不能同时改变两堆，也不能
让一堆的合法操作依赖另一堆当前状态。

## 减法游戏完整代码

输入允许拿走的正石子数量、若干堆大小，判断先手还是后手必胜。所有堆使用相同
的拿取集合，先预处理 `0..maximum_pile` 的 SG 值。

```cpp
#include <bits/stdc++.h>
using namespace std;

int move_count;
int pile_count;
vector<int> allowed_moves;
vector<int> pile;
vector<int> sg;

void build_sg(int maximum_pile) {
    sg.assign(maximum_pile + 5, 0);
    vector<int> seen(move_count + 5, 0);

    for (int stones = 1; stones <= maximum_pile; stones++) {
        for (int move : allowed_moves) {
            if (move <= stones) {
                seen[sg[stones - move]] = stones;
            }
        }

        int value = 0;
        while (seen[value] == stones) {
            value++;
        }
        sg[stones] = value;
    }
}

void solve() {
    cin >> move_count;

    allowed_moves.resize(move_count);
    for (int& move : allowed_moves) {
        cin >> move;
    }

    cin >> pile_count;
    pile.assign(pile_count + 5, 0);

    int maximum_pile = 0;
    for (int i = 1; i <= pile_count; i++) {
        cin >> pile[i];
        maximum_pile = max(maximum_pile, pile[i]);
    }

    build_sg(maximum_pile);

    int xor_sum = 0;
    for (int i = 1; i <= pile_count; i++) {
        xor_sum ^= sg[pile[i]];
    }

    cout << (xor_sum == 0 ? "Second\n" : "First\n");
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

一个状态最多只有 `move_count` 个不同后继 SG 值，所以 mex 不超过
`move_count`。`seen` 数组用当前石子数作为时间戳，避免每个状态重新清空整段
布尔数组。

预处理时间为 $O(M|S|)$，其中 $M$ 是最大石子数，空间为 $O(M+|S|)$。组合
若干堆只需再做一次异或。

## 怎样识别可以使用 SG 的问题

先检查规则，而不是看到“轮流操作”就套模板：

1. 双方在同一状态拥有相同操作；
2. 游戏不会无限进行；
3. 无法行动者失败；
4. 若要异或多个 SG 值，各子游戏必须彼此独立；
5. 状态转移图足够小，或 SG 值存在可利用的规律。

棋盘上双方拥有不同棋子、带隐藏信息、可以回到旧状态或最后行动者失败的问题，
需要其他博弈模型。SG 函数不是所有游戏的万能标签。

## 常见错误

- 把异或写成普通加法；
- 只判断 Nim 和非零，却不会构造走到零的第一步；
- Nim 和为零时仍声称存在一步保持为零；
- 把 `mex` 误写成集合中的最小元素；
- SG 状态有环时直接从小到大递推，没有处理循环；
- 组合子游戏的一步可以同时改变多个部分，却仍把 SG 值直接异或；
- 忽略“最后行动者获胜”的正常规则，套到反常游戏；
- 状态空间巨大且没有规律时，仍试图枚举全部状态计算 SG。

## 需要记住什么

- 胜态与败态怎样由后继状态递推定义？
- 为什么 Nim 和为 0 时任何一步都会变成非 0？
- Nim 和非 0 时怎样构造一步走到 0？
- `mex` 与 SG 函数怎样定义，为什么 SG 为 0 等价于败态？
- 多个独立子游戏的 SG 值怎样合并？
- 使用 SG 函数前必须检查哪些规则条件？
