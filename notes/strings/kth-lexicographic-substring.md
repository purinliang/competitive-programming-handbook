# 字典序第 k 小子串

> 最近修订：2026-08-23 08:47 +10:00（未审阅）

给定一个字符串，把所有本质不同的非空子串按照字典序排列，询问第 `k` 个是什么。

这里相同内容只保留一次。例如 `aaa` 的候选是：

```text
a
aa
aaa
```

而不是把三个位置出现的 `a` 重复列出。

后缀数组已经把所有后缀按字典序排列。每个子串都是某个后缀的前缀；只要扣除与前面
后缀重复的前缀，就能把全部本质不同子串拆成若干个连续字典序块。

## 一个后缀提供哪些前缀

从位置 `pos` 开始的后缀长度为：

$$
n-pos+1.
$$

它的每个非空前缀都是一个子串：

```text
长度 1, 2, ..., n - pos + 1
```

若不去重，所有后缀的前缀数量之和正好是 `n(n+1)/2`，也就是全部子串区间数。

## 与前一个后缀重复多少

设当前后缀在后缀数组中排名为 `order`。`lcp[order]` 是它与字典序前驱的最长公共前缀
长度。

长度不超过 `lcp[order]` 的前缀已经由前驱提供；更长前缀第一次出现。因此当前后缀
新增：

```text
长度 lcp[order] + 1
到   n - sa[order] + 1
```

这些本质不同子串，数量为：

$$
n-sa[order]+1-lcp[order].
$$

## 为什么只比较直接前驱就够了

所有拥有同一个前缀的后缀在字典序中形成连续区间。

若当前后缀与某个更早后缀拥有长度为 `L` 的公共前缀，那么从那个后缀到当前后缀之间的
全部后缀也位于这个前缀区间内。当前后缀的直接前驱同样拥有至少长度 `L` 的公共前缀。

所以当前后缀与任意更早后缀的最大 LCP，一定由直接前驱达到。扣除 `lcp[order]` 就已经
删除全部旧前缀，不需要与所有早期后缀逐一比较。

## 每个后缀内部也是有序的

固定一个后缀，它的不同前缀互相存在包含关系。较短字符串是较长字符串的前缀，因此
字典序更小：

```text
a < ab < aba < abac
```

所以当前后缀新增的子串按照长度：

```text
lcp + 1, lcp + 2, ...
```

排列，恰好就是它们的字典序。

## 不同后缀的新增块为什么有序

取两个后缀 `A<B`。若 `A` 的某个新增前缀与 `B` 的某个新增前缀在首次不同字符以前都
没有结束，它们的大小与两个后缀相同，因此前者更小。

若某个前缀在首次不同以前结束，它就是另一个字符串的前缀，也仍然更小。唯一可能相等
的情况是两者拥有相同前缀内容，而这种重复已经被后一个后缀的 `lcp` 扣除。

因此按 `sa[1],sa[2],...` 依次列出每个后缀的新增前缀，得到的正是全部本质不同子串的
全局字典序。

## 定位第 k 个

扫描每个后缀的新增数量 `new_count`：

- 若 `k > new_count`，跳过整块并执行 `k -= new_count`；
- 否则答案就在当前块中。

块内第 `k` 个子串长度为：

$$
lcp[order]+k.
$$

起点是 `sa[order]`。从原字符串复制这段区间即可。

若扫描完全部后缀后 `k` 仍未落入任何块，说明询问超过本质不同子串总数，输出 `-1`。

## 完整代码

输入一个不含空白字符的非空字符串和 1-based 的 `k`，输出本质不同非空子串中字典序
第 `k` 小者；若不存在，输出 `-1`。

代码内联完整后缀数组与 LCP 构造，位置统一从 `1` 开始；只在最终调用 `string::substr`
时转换到 STL 的 0-based 下标。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct SuffixArray {
    string text;
    int n;
    vector<int> sa;
    vector<int> rank_value;
    vector<int> lcp;

    SuffixArray(const string& text) : text(text) {
        n = text.size();
        sa.assign(n + 5, 0);
        rank_value.assign(n + 5, 0);
        lcp.assign(n + 5, 0);
        build_suffix_array();
        build_lcp();
    }

    void counting_sort(const vector<int>& order, int maximum_rank) {
        vector<int> count(max(n, maximum_rank) + 5, 0);

        for (int i = 1; i <= n; ++i) {
            ++count[rank_value[order[i]]];
        }
        for (int value = 1; value <= maximum_rank; ++value) {
            count[value] += count[value - 1];
        }
        for (int i = n; i >= 1; --i) {
            int pos = order[i];
            sa[count[rank_value[pos]]--] = pos;
        }
    }

    void build_suffix_array() {
        vector<int> order(n + 5, 0);
        vector<int> new_rank(n + 5, 0);

        for (int i = 1; i <= n; ++i) {
            order[i] = i;
            rank_value[i] = (unsigned char)text[i - 1] + 1;
        }
        counting_sort(order, 256);

        int maximum_rank = 256;
        for (int width = 1; width < n; width *= 2) {
            int count = 0;

            for (int pos = n - width + 1; pos <= n; ++pos) {
                order[++count] = pos;
            }
            for (int i = 1; i <= n; ++i) {
                if (sa[i] > width) {
                    order[++count] = sa[i] - width;
                }
            }

            counting_sort(order, maximum_rank);

            int class_count = 1;
            new_rank[sa[1]] = 1;

            for (int i = 2; i <= n; ++i) {
                int previous = sa[i - 1];
                int current = sa[i];
                int previous_second =
                    previous + width <= n ? rank_value[previous + width] : 0;
                int current_second =
                    current + width <= n ? rank_value[current + width] : 0;

                if (rank_value[previous] != rank_value[current] ||
                    previous_second != current_second) {
                    ++class_count;
                }
                new_rank[current] = class_count;
            }

            rank_value.swap(new_rank);
            maximum_rank = class_count;
            if (class_count == n) {
                break;
            }
        }

        for (int order_index = 1; order_index <= n; ++order_index) {
            rank_value[sa[order_index]] = order_index;
        }
    }

    void build_lcp() {
        int height = 0;

        for (int pos = 1; pos <= n; ++pos) {
            int order = rank_value[pos];
            if (order == 1) {
                height = 0;
                continue;
            }

            int previous = sa[order - 1];
            while (pos + height <= n && previous + height <= n &&
                   text[pos + height - 1] == text[previous + height - 1]) {
                ++height;
            }
            lcp[order] = height;

            if (height > 0) {
                --height;
            }
        }
    }

    string kth_distinct_substring(ll k) const {
        for (int order = 1; order <= n; ++order) {
            int suffix_length = n - sa[order] + 1;
            ll new_count = suffix_length - lcp[order];

            if (k > new_count) {
                k -= new_count;
                continue;
            }

            int answer_length = lcp[order] + k;
            return text.substr(sa[order] - 1, answer_length);
        }
        return "";
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    ll k;
    cin >> text >> k;

    SuffixArray suffix_array(text);
    string answer = suffix_array.kth_distinct_substring(k);

    if (answer.empty()) {
        cout << -1 << '\n';
    } else {
        cout << answer << '\n';
    }

    return 0;
}
```

## 正确性

对每个后缀，全部前缀覆盖以该位置开始的所有子串。当前后缀与任意更早后缀重复的最长
前缀长度等于它与直接前驱的 `lcp`，因此只保留更长前缀后，每个本质不同子串恰好出现
一次。

同一后缀的新前缀按长度递增就是字典序；不同后缀的新前缀块继承后缀数组顺序，重复的
公共前缀已经删除，所以全部块首尾连接后严格递增。

扫描时每跳过一块，就从 `k` 中减去这一块准确的子串数量。第一次满足 `k<=new_count`
的块包含原询问答案，块内长度 `lcp+k` 恰好选中第 `k` 个。若没有块包含它，则总数小于
原 `k`，输出 `-1` 正确。

## 复杂度

- 构造后缀数组：`O(n log n)`；
- 构造 LCP 与扫描新增块：`O(n)`；
- 复制答案：`O(answer_length)`；
- 空间复杂度：`O(n)`。

`k` 最大可能接近 `n(n+1)/2`，必须使用 64 位整数。

## 常见错误

- 没说明是否按出现区间重复计数，导致 `k` 的定义不一致；
- 当前后缀贡献全部前缀，没有扣除 `lcp[order]`；
- 误以为要减去与所有早期后缀的 LCP，重复删除；
- 块内第 `k` 个长度写成 `k`，漏加已经重复的 `lcp`；
- 把 `k` 当成 0-based，产生整体偏移；
- 使用 32 位整数保存 `k` 或新增子串总数；
- 找到答案后返回完整后缀，而不是所需长度的前缀；
- 调用 `substr` 时仍传入 1-based 起点；
- 用空字符串表示不存在，却又把空串纳入合法候选。

## 需要记住什么

- 本文的第 `k` 小是否按相同内容去重？
- 一个后缀共有多少个非空前缀？
- 当前后缀为什么只需扣除与直接前驱的 LCP？
- 每个后缀新增子串的长度范围和数量是什么？
- 为什么块内按长度递增就是字典序？
- 为什么按后缀数组顺序连接各块能得到全局字典序？
- 落入当前块以后，答案长度为什么是 `lcp+k`？
