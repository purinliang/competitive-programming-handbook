# 本质不同子串计数

> 最近修订：2026-08-23 08:36 +10:00（未审阅）

长度为 `n` 的字符串共有：

$$
\frac{n(n+1)}2
$$

个非空子串区间，但不同区间可能得到相同内容。例如 `aaaa` 的十个子串区间只产生：

```text
a, aa, aaa, aaaa
```

四个本质不同子串。

“本质不同”只比较字符串内容，不比较它在原文本中的起点和终点。直接把所有子串放进
集合需要平方级枚举和存储；[后缀自动机](suffix-automaton.md) 已经把拥有相同结束位置
集合的子串压缩成线性数量的状态，并且每个状态还给出一段连续长度区间。

把所有状态的区间长度相加，就能在线性时间得到答案。

## 一个状态贡献多少个子串

后缀自动机的普通状态 `u` 保存：

- `max_length[u]`：状态中最长子串长度；
- `link[u]`：最长严格后缀所属状态。

状态 `u` 代表的子串长度恰好是：

$$
max\_length[link[u]]+1,
max\_length[link[u]]+2,
\ldots,
max\_length[u].
$$

所以贡献数量为：

$$
max\_length[u]-max\_length[link[u]].
$$

## 为什么每个长度只对应一个子串

一个状态代表相同 `endpos` 的子串。取状态中最长子串 `T`，同状态的其他子串都是 `T`
的后缀。

后缀长度一旦确定，内容也唯一确定。因此在状态的合法长度区间内：

- 每个长度恰好对应 `T` 的一个后缀；
- 不同长度得到不同字符串；
- 不同状态拥有不同 `endpos` 等价类，不会表示同一个字符串。

所以全部普通状态的长度区间恰好把所有本质不同非空子串划分一次。

## 总公式

根节点表示空串，不计入答案。设普通状态编号为 `2..size`，则：

$$
answer
=
\sum_{u=2}^{size}
\left(
max\_length[u]-max\_length[link[u]]
\right).
$$

本文代码只使用一个根节点，编号为 `1`；编号 `0` 表示不存在的状态。

以 `aaaa` 为例，自动机普通状态依次贡献长度区间：

```text
[1,1], [2,2], [3,3], [4,4]
```

总数为 `4`。

出现克隆状态时，区间可能一次包含多个长度，但公式不变。克隆正是为了把不同
`endpos` 行为需要的长度边界拆分正确；不能在计数时忽略它。

## 完整代码

输入一个只含小写英文字母的非空字符串，输出本质不同非空子串数量。长度不超过
`2*10^5`，答案使用 64 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct SuffixAutomaton {
    int size;
    int last;
    vector<array<int, 26>> child;
    vector<int> link;
    vector<int> max_length;

    SuffixAutomaton(int text_length) {
        int capacity = 2 * text_length + 5;
        child.assign(capacity, array<int, 26>{});
        link.assign(capacity, 0);
        max_length.assign(capacity, 0);
        size = 1;
        last = 1;
    }

    int new_state() {
        ++size;
        child[size].fill(0);
        link[size] = 0;
        max_length[size] = 0;
        return size;
    }

    void extend(char letter) {
        int c = letter - 'a';
        int current = new_state();
        max_length[current] = max_length[last] + 1;

        int p = last;
        while (p != 0 && child[p][c] == 0) {
            child[p][c] = current;
            p = link[p];
        }

        if (p == 0) {
            link[current] = 1;
        } else {
            int q = child[p][c];
            if (max_length[p] + 1 == max_length[q]) {
                link[current] = q;
            } else {
                int clone = new_state();
                child[clone] = child[q];
                link[clone] = link[q];
                max_length[clone] = max_length[p] + 1;

                while (p != 0 && child[p][c] == q) {
                    child[p][c] = clone;
                    p = link[p];
                }

                link[q] = clone;
                link[current] = clone;
            }
        }

        last = current;
    }

    ll count_distinct_substrings() const {
        ll answer = 0;

        for (int u = 2; u <= size; ++u) {
            answer += max_length[u] - max_length[link[u]];
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    cin >> text;

    SuffixAutomaton automaton(text.size());
    for (char letter : text) {
        automaton.extend(letter);
    }

    cout << automaton.count_distinct_substrings() << '\n';
    return 0;
}
```

## 正确性

后缀自动机构造完成后，每个本质不同非空子串属于唯一 `endpos` 等价类，也就是唯一普通
状态。

状态 `u` 中的合法长度从 `max_length[link[u]]+1` 到 `max_length[u]`。每个长度唯一
确定该状态最长代表串的一个后缀，因此状态贡献恰好：

$$
max\_length[u]-max\_length[link[u]]
$$

个不同子串。不同状态不会重复表示同一子串，所有子串也都能从根沿自动机转移读出，
所以对全部普通状态求和无遗漏、无重复。

## 复杂度

固定小写字母表时：

- 构造后缀自动机：`O(n)`；
- 汇总状态贡献：`O(n)`；
- 空间复杂度：`O(n)`。

答案最大为 `n(n+1)/2`，`n=2*10^5` 时超过 32 位整数范围，因此必须使用 64 位整数。

## 另一种后缀数组公式

后缀数组也能解决同一问题。所有后缀一共提供 `n(n+1)/2` 个前缀，但当前后缀与前一个
后缀的 `lcp` 长度已经在更早字典序后缀中出现，因此：

$$
answer
=
\frac{n(n+1)}2
-\sum_{i=2}^{n}lcp[i].
$$

两种公式观察的是同一件事：

- 后缀数组按字典序扣除与前驱重复的前缀；
- 后缀自动机按 `endpos` 等价类统计新增长度区间。

只求数量时两者都合适；若后续还要沿字符转移或统计出现次数，后缀自动机通常更自然。

## 常见错误

- 把本质不同理解成区间不同，直接输出 `n(n+1)/2`；
- 每个状态只贡献一个子串，忽略状态代表连续长度区间；
- 把贡献写成 `max_length[u]-max_length[link[u]]+1`，多算一个边界；
- 把根节点的空串计入非空子串答案；
- 忽略克隆状态，破坏等价类长度区间划分；
- 使用 32 位整数保存答案；
- 在后缀数组公式中减去所有两两 LCP，而不是只减相邻后缀 LCP；
- 既使用自动机区间公式又减一次 LCP，重复去重。

## 需要记住什么

- “本质不同子串”比较的是内容还是出现区间？
- 后缀自动机状态 `u` 代表怎样的长度区间？
- 为什么区间内每个长度恰好对应一个子串？
- 为什么不同状态不会重复表示同一个子串？
- 单个状态的贡献公式是什么？
- 为什么答案必须使用 64 位整数？
- 后缀数组和后缀自动机的计数公式分别怎样消除重复？
