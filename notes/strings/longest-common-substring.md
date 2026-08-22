# 最长公共子串

> 最近修订：2026-08-23 09:18 +10:00（未审阅）

给定两个字符串，寻找同时在两者中连续出现的最长非空字符串。若有多个最长答案，输出
字典序最小者。

例如：

```text
first  = ababc
second = babca
```

最长公共子串是 `babc`，长度为 `4`。

公共子串必须连续，这与最长公共子序列不同。子序列允许跳过字符，需要二维 DP；子串
则可以转化成两个后缀的公共前缀。

## 把两个字符串放进同一个后缀数组

在两个字符串中间加入一个从未出现的分隔符：

```text
combined = first + '{' + second
```

本文输入只含小写英文字母，所以字符 `{` 不会与正文字符相同。

为每个后缀起点记录来源：

- 位于 `first`：来源 `1`；
- 位于分隔符：来源 `0`，忽略；
- 位于 `second`：来源 `2`。

两个原字符串的公共子串，恰好是一个来源 `1` 后缀和一个来源 `2` 后缀的公共前缀。

## 分隔符为什么不会进入答案

来源 `1` 的后缀向右扫描时最终可能到达分隔符；来源 `2` 的后缀只位于分隔符之后，
不会再遇到它。

由于分隔符与所有普通字符不同，两类后缀的 LCP 会在来源 `1` 后缀到达分隔符时停止。
因此跨来源 LCP 不会穿过第一个字符串边界，不需要额外裁剪长度。

若字符集不止小写英文字母，必须另外选择一个保证不在输入中的符号，或把字符离散化后
加入独立编号。

## 为什么只检查相邻的不同来源后缀

假设某个公共子串 `t` 长度为 `L`。所有以 `t` 开头的后缀在字典序中形成连续块，并且
块中同时存在来源 `1` 和来源 `2`。

从块左端向右观察，来源第一次发生变化的位置形成一对相邻、来源不同的后缀。这一对仍
都以 `t` 开头，所以 LCP 至少为 `L`。

反过来，任意一对来源不同后缀的 LCP 都同时出现在两个字符串中。因此：

$$
answer\_length
=
\max
\{lcp[order]\mid owner(sa[order-1])\ne owner(sa[order])\},
$$

并且两个来源都不能是分隔符 `0`。

## 怎样处理平局

后缀数组从小到大扫描。遇到来源不同的相邻后缀时，只在 LCP 严格变长时更新答案。

达到全局最大长度的第一组后缀，其公共前缀在所有同长度公共子串中字典序最小。后续
相同长度候选不再覆盖它。

若最大长度始终为 `0`，两个字符串没有公共非空字符，输出 `-1`。

## 完整代码

输入两个只含小写英文字母的非空字符串，输出它们字典序最小的最长公共非空子串；若
不存在，输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

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
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string first, second;
    cin >> first >> second;

    int first_length = first.size();
    string combined = first + '{' + second;
    SuffixArray suffix_array(combined);

    vector<int> owner(suffix_array.n + 5, 0);
    for (int pos = 1; pos <= first_length; ++pos) {
        owner[pos] = 1;
    }
    for (int pos = first_length + 2; pos <= suffix_array.n; ++pos) {
        owner[pos] = 2;
    }

    int best_length = 0;
    int best_pos = 0;

    for (int order = 2; order <= suffix_array.n; ++order) {
        int left_pos = suffix_array.sa[order - 1];
        int right_pos = suffix_array.sa[order];

        if (owner[left_pos] == 0 || owner[right_pos] == 0 ||
            owner[left_pos] == owner[right_pos]) {
            continue;
        }

        if (suffix_array.lcp[order] > best_length) {
            best_length = suffix_array.lcp[order];
            best_pos = right_pos;
        }
    }

    if (best_length == 0) {
        cout << -1 << '\n';
    } else {
        cout << combined.substr(best_pos - 1, best_length) << '\n';
    }

    return 0;
}
```

`best_pos` 可以取相邻两后缀中的任意一个，因为前 `best_length` 个字符完全相同。代码
统一取后一个后缀起点。

## 正确性

任意公共子串都是一个来源 `1` 后缀和一个来源 `2` 后缀的公共前缀。拥有该前缀的后缀
形成连续块，块中来源从一种变成另一种时必然产生一对相邻不同来源后缀，其 LCP 不短于
该公共子串。

任意相邻不同来源后缀的 LCP 又确实同时出现在两个原字符串中。分隔符唯一，公共前缀
不会跨越边界。因此所有候选中的最大 LCP 恰好是最长公共子串长度。

按后缀字典序扫描并只在严格变长时更新，会保留全局最大长度第一次出现的公共前缀，
也就是字典序最小的最长答案。

## 复杂度

设两个字符串总长度为 `N`：

- 构造后缀数组：`O(N log N)`；
- 构造 LCP 和扫描相邻后缀：`O(N)`；
- 空间复杂度：`O(N)`。

另一种方法是为第一个字符串建立后缀自动机，再扫描第二个字符串维护当前可匹配长度，
可以做到固定字符集下 `O(N)`。若项目已经需要后缀字典序和 LCP，本文后缀数组方案更
容易复用。

## 常见错误

- 把最长公共子串与允许跳过字符的最长公共子序列混淆；
- 直接连接两个字符串，却没有加入唯一分隔符，产生跨边界伪子串；
- 分隔符可能出现在输入字符集中；
- 检查所有相邻后缀，却没有要求来自不同字符串；
- 把分隔符自身的后缀当作某个来源；
- 认为需要枚举两个字符串的所有后缀对；
- 平局时用 `>=` 覆盖，失去字典序最小约定；
- 最大长度为 `0` 时输出空行，没有明确表示不存在非空公共子串；
- 使用后缀自动机方案时只记录状态，不维护当前匹配长度。

## 需要记住什么

- 最长公共子串与最长公共子序列有什么区别？
- 为什么要在两个字符串之间加入唯一分隔符？
- 为什么跨来源 LCP 不会穿过分隔符？
- 一个公共子串为什么能由相邻的不同来源后缀见证？
- 扫描时应排除哪些来源组合？
- 怎样恢复字典序最小的最长答案？
- 后缀数组方案与后缀自动机方案各有什么复用优势？
