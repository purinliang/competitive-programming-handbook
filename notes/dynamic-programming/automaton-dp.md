# 自动机 DP

> 最近修订：2026-08-23 07:18 +10:00（未审阅）

要统计长度为 `n` 的二进制字符串，并要求它不能包含任何给定模式串。直接枚举有：

$$
2^n
$$

种字符串。逐个构造时，判断下一个字符是否合法似乎需要记住整个前缀；但真正影响未来
的只有：当前前缀末尾与哪些模式串前缀相同。

AC 自动机已经把这段必要历史压缩成一个有限状态。读入下一字符以后，状态唯一转移到
另一个节点；一旦进入代表完整禁用模式的状态，这个前缀及其所有延伸都不合法。

在自动机状态上做动态规划，就能合并拥有相同未来条件的大量前缀。这类“有限状态压缩
历史，再按阶段推进”的方法统称自动机 DP。

## 前置知识

本文使用 [AC 自动机](../strings/aho-corasick.md) 处理多个禁用模式串。需要先理解：

- Trie 节点代表模式串前缀；
- 失败指针保留当前字符串中仍可能继续匹配的最长后缀；
- 补全转移后，读入一个字符只需一次数组访问。

动态规划部分只依赖一张确定转移表：

```text
next_state[u][symbol]
```

因此自动机不一定来自字符串。只要过去的信息能压缩成有限状态，同一套 DP 也能用于
数位限制、协议状态和有限步操作序列。

## 先标出不能进入的状态

模式串的结尾节点显然不能进入。但只标记结尾节点还不够。

例如禁用模式是 `01`，某个更长状态代表字符串 `101`。它本身不是 Trie 中 `01` 的
结尾节点，却拥有后缀 `01`，同样已经包含禁用模式。

若 `fail[u]` 已经是禁用状态，那么 `u` 也必须禁用：

```cpp
forbidden[u] = forbidden[u] || forbidden[fail[u]];
```

失败指针由浅到深构造，因此在 BFS 取出 `u` 时，`fail[u]` 的标记已经确定。一次传播
就能让每个状态知道：当前前缀的某个后缀是否已经构成完整禁用模式。

## 阶段、状态与决策

### 阶段

`length` 表示已经放入多少个字符，从 `0` 推进到 `n`。

### 状态

`u` 是读完当前前缀后所在的 AC 自动机节点。它完整概括了继续判断禁用模式所需的
历史；两个前缀只要到达同一状态，后续可选字符和转移结果就完全相同。

定义：

$$
dp[length][u]
$$

表示长度为 `length`、未出现禁用模式，并且自动机停在状态 `u` 的字符串数量。

### 决策

二进制字符串的下一位只能选择：

```text
0 或 1
```

设：

```cpp
v = child[u][digit];
```

若 `v` 没有被禁用，就执行：

$$
dp[length+1][v]
\mathrel{+}=
dp[length][u].
$$

## 初始状态与答案

空字符串位于自动机根节点，因此：

```cpp
dp[1] = 1;
```

这里数组下标 `1` 是根节点编号，不是字符串长度。长度由外层循环表示，代码只保留当前
层和下一层。

完成 `n` 个字符后，任何未禁用状态都对应合法字符串，答案是全部状态计数之和：

$$
answer=\sum_u dp[u].
$$

不同状态代表不同末尾匹配信息；同一状态中的不同构造过程仍通过计数相加保留，因此既
不会遗漏，也不会把一个字符串重复计算。

## 为什么只记自动机状态就够了

考虑两个不同前缀 `a` 和 `b`。若它们读完后都停在状态 `u`，那么对任意后续字符串
`t`：

1. 从 `u` 读入 `t` 的状态序列完全相同；
2. 是否进入禁用状态也完全相同；
3. 因而 `a+t` 与 `b+t` 的后续合法性一致。

这说明前缀的其他内容不会再影响决策，可以安全丢弃。自动机状态就是动态规划所需的
最小历史摘要之一。

这与普通 DP 的状态设计完全相同：状态不是保存已经发生的一切，而是保存会影响未来的
一切。

## 滚动数组

第 `length+1` 层只依赖第 `length` 层，不需要保存所有长度：

```cpp
vector<ll> dp(state_count + 5);
vector<ll> next_dp(state_count + 5);
```

每一层先清空 `next_dp`，完成所有转移后交换：

```cpp
fill(next_dp.begin(), next_dp.end(), 0);
// 转移
dp.swap(next_dp);
```

空间由 `O(nS)` 降为 `O(S)`，其中 `S` 是自动机状态数。

## 完整代码

输入目标长度 `n`、禁用模式数量 `pattern_count`，以及只含 `0`、`1` 的非空模式串。
统计不包含任何禁用模式的长度为 `n` 的二进制字符串数量，答案对 `10^9+7` 取模。

保证所有模式串总长度为 `S`，并且 `2nS` 在可接受范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

struct BinaryAhoCorasick {
    vector<array<int, 2>> child;
    vector<int> fail;
    vector<char> forbidden;

    BinaryAhoCorasick() {
        child.assign(2, array<int, 2>{});
        fail.assign(2, 1);
        forbidden.assign(2, 0);
    }

    int new_node() {
        child.push_back(array<int, 2>{});
        fail.push_back(1);
        forbidden.push_back(0);
        return child.size() - 1;
    }

    void insert(const string& pattern) {
        int u = 1;
        for (char symbol : pattern) {
            int digit = symbol - '0';
            if (child[u][digit] == 0) {
                child[u][digit] = new_node();
            }
            u = child[u][digit];
        }
        forbidden[u] = 1;
    }

    void build() {
        queue<int> q;
        fail[1] = 1;

        for (int digit = 0; digit <= 1; ++digit) {
            int v = child[1][digit];
            if (v != 0) {
                fail[v] = 1;
                q.push(v);
            } else {
                child[1][digit] = 1;
            }
        }

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            forbidden[u] = forbidden[u] || forbidden[fail[u]];

            for (int digit = 0; digit <= 1; ++digit) {
                int v = child[u][digit];
                if (v != 0) {
                    fail[v] = child[fail[u]][digit];
                    q.push(v);
                } else {
                    child[u][digit] = child[fail[u]][digit];
                }
            }
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, pattern_count;
    cin >> n >> pattern_count;

    BinaryAhoCorasick automaton;
    for (int i = 1; i <= pattern_count; ++i) {
        string pattern;
        cin >> pattern;
        automaton.insert(pattern);
    }
    automaton.build();

    int state_count = automaton.child.size() - 1;
    vector<ll> dp(state_count + 5, 0);
    vector<ll> next_dp(state_count + 5, 0);
    dp[1] = 1;

    for (int length = 0; length < n; ++length) {
        fill(next_dp.begin(), next_dp.end(), 0);

        for (int u = 1; u <= state_count; ++u) {
            if (automaton.forbidden[u] || dp[u] == 0) {
                continue;
            }
            for (int digit = 0; digit <= 1; ++digit) {
                int v = automaton.child[u][digit];
                if (automaton.forbidden[v]) {
                    continue;
                }
                next_dp[v] += dp[u];
                if (next_dp[v] >= MOD) {
                    next_dp[v] -= MOD;
                }
            }
        }

        dp.swap(next_dp);
    }

    ll answer = 0;
    for (int u = 1; u <= state_count; ++u) {
        if (!automaton.forbidden[u]) {
            answer += dp[u];
            if (answer >= MOD) {
                answer -= MOD;
            }
        }
    }

    cout << answer << '\n';
    return 0;
}
```

## 正确性

对长度归纳。

长度为 `0` 时，只有空字符串，自动机位于根节点，所以 `dp[1]=1` 正确。

假设当前 `dp[u]` 正确统计了所有长度为 `length` 的合法字符串。每个这样的字符串都能
唯一选择下一位 `0` 或 `1`，自动机转移唯一确定新状态 `v`：

- `v` 被禁用时，新字符串恰好已经包含某个禁用模式，不应计数；
- `v` 未被禁用时，转移把它恰好加入 `next_dp[v]` 一次。

任何长度为 `length+1` 的合法字符串删去末位后，都唯一来自一个长度为 `length` 的合法
字符串和一个末位选择。因此转移无遗漏、无重复，归纳成立。最后汇总全部未禁用状态，
正好得到所有长度为 `n` 的合法字符串。

## 复杂度

设自动机状态数为 `S`，字符集大小为 `alphabet`。构造自动机需要 `O(S*alphabet)`，
动态规划需要：

$$
O(nS\cdot alphabet).
$$

本文 `alphabet=2`，因此通常写成 `O(nS)`。滚动数组空间复杂度为 `O(S)`，自动机转移
表也为 `O(S)`。

若 `n` 极大而 `S` 较小，可以把状态转移次数写成 `S*S` 矩阵，再用矩阵快速幂计算；
这属于同一状态模型的另一种加速，不改变自动机 DP 的核心。

## 常见变体

- 把“禁止进入”改成“必须最终位于接受状态”，就能统计被自动机接受的字符串；
- 给每次转移增加代价，可求最小代价或最大收益；
- 把计数改成概率，可计算有限步后到达某类状态的概率；
- 数位 DP 的状态中再加入自动机节点，可统计某个整数区间内满足字符串模式限制的数；
- 多模式计数可以使用 AC 自动机，单个模式也可以只构造 KMP 状态转移。

## 常见错误

- 只禁用模式串结尾节点，没有沿失败指针传播禁用标记；
- DP 状态保存整个前缀，失去合并相同未来条件的意义；
- 把 Trie 的真实孩子当作完整自动机转移，遇到空边时错误回根；
- 转移到禁用状态后仍继续保留计数；
- 忘记空字符串从根节点开始；
- 每层没有清空 `next_dp`，把更早长度的计数重复带入；
- 最后只读取根节点，而不是汇总所有未禁用状态；
- 性质依赖额外信息时仍只记录自动机节点，导致状态不足。

## 需要记住什么

- 自动机 DP 适合哪类“历史影响未来”的问题？
- 为什么模式串结尾节点的失败指针后代也可能是禁用状态？
- `dp[length][u]` 的精确定义是什么？
- 为什么两个到达同一自动机状态的前缀可以合并？
- 初始状态和最终答案怎样确定？
- 为什么可以用滚动数组把空间降到 `O(S)`？
- `n` 极大时，怎样继续加速固定状态转移？
