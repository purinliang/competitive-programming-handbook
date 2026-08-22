# 最长重复子串

> 最近修订：2026-08-23 09:08 +10:00（未审阅）

给定一个字符串，寻找至少出现两次的最长非空子串。本文允许两次出现互相重叠；若有
多个最长答案，输出字典序最小者。

例如 `banana` 中，`ana` 分别从位置 `2` 和 `4` 开始，长度为 `3`，是最长重复子串。

子串 `t` 从位置 `pos` 出现，等价于 `t` 是后缀 `suffix(pos)` 的前缀。因此 `t` 至少
出现两次，等价于至少两个后缀拥有公共前缀 `t`。问题转化成：所有后缀中，哪一对拥有
最长公共前缀？

后缀数组只需检查字典序相邻后缀。

## 为什么相邻后缀足够

假设两个后缀 `A` 和 `B` 共享长度为 `L` 的前缀 `t`。所有以 `t` 开头的后缀在字典序
中形成一个连续区间，`A,B` 都位于其中。

若区间内不止两个后缀，任意相邻两项仍都以 `t` 开头，因此它们的 LCP 至少为 `L`。
所以每个重复子串都会被某一对相邻后缀见证。

反过来，若相邻后缀 LCP 为 `L`，它们开头长度为 `L` 的字符串就在两个不同起点出现，
确实是重复子串。

因此最长重复子串长度恰好是：

$$
\max_{2\le order\le n} lcp[order].
$$

## 怎样恢复答案

若最大值出现在 `lcp[order]`，那么：

```text
suffix(sa[order - 1])
和
suffix(sa[order])
```

开头 `lcp[order]` 个字符相同。从任一后缀起点截取这段长度即可。

代码按后缀数组顺序扫描，并且只在发现严格更长 LCP 时更新答案。于是最终保留达到全局
最大长度的第一组相邻后缀。

后缀数组本身按字典序排列，这一组的公共前缀也是所有最长重复子串中字典序最小者。

## 重叠为什么不影响

字符串 `aaaa` 中，长度为 `3` 的 `aaa` 从位置 `1` 和 `2` 出现，两段区间重叠。对应
后缀：

```text
aaaa
aaa
```

仍然是两个不同起点，LCP 为 `3`。后缀数组只关心起点和字符内容，不会排除重叠。

若题目要求两次出现不重叠，还必须保证两个起点距离至少为答案长度，需要另外检查位置
跨度；不能直接使用本文答案。

## 完整代码

输入一个不含空白字符的非空字符串。输出出现至少两次、允许重叠的最长非空子串；平局
时输出字典序最小者。若没有重复非空子串，输出 `-1`。

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

    string longest_repeated_substring() const {
        int best_length = 0;
        int best_pos = 0;

        for (int order = 2; order <= n; ++order) {
            if (lcp[order] > best_length) {
                best_length = lcp[order];
                best_pos = sa[order];
            }
        }

        if (best_length == 0) {
            return "";
        }
        return text.substr(best_pos - 1, best_length);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    cin >> text;

    SuffixArray suffix_array(text);
    string answer = suffix_array.longest_repeated_substring();

    if (answer.empty()) {
        cout << -1 << '\n';
    } else {
        cout << answer << '\n';
    }

    return 0;
}
```

## 正确性

任意重复子串是至少两个后缀的公共前缀。拥有这个前缀的后缀形成连续字典序区间，所以
区间中至少一对相邻后缀的 LCP 不短于该子串。因此最大相邻 LCP 不小于任何重复子串
长度。

任意相邻后缀的 LCP 又确实在两个不同起点出现，所以最大相邻 LCP 自身对应合法重复
子串。两边结合，最大值恰好是最长重复子串长度。

扫描按字典序遇到第一组最大 LCP 时保留其公共前缀。所有相同长度候选的相对顺序与所在
后缀块一致，因此保留的是字典序最小的最长答案。

## 复杂度

- 构造后缀数组：`O(n log n)`；
- 构造并扫描 LCP：`O(n)`；
- 空间复杂度：`O(n)`。

若后缀数组和 LCP 已经由其他查询构造，本问题只需要一次 `O(n)` 扫描。

## 常见错误

- 枚举所有子串再放入集合，使用平方级空间；
- 比较任意后缀对，忽略共享前缀后缀在字典序中的连续性；
- 把最大 `lcp` 的下标当成原字符串起点；
- 恢复答案时复制完整后缀，而不是最大 LCP 长度；
- 没说明两次出现是否允许重叠；
- 题目要求不重叠时仍只取最大 LCP；
- 平局时使用 `>=` 持续覆盖，得到字典序更后的候选；
- 最大 LCP 为 `0` 时输出空行，没有明确表示不存在非空答案。

## 需要记住什么

- 重复子串怎样转化为两个后缀的公共前缀？
- 为什么任意重复前缀都能由某对相邻后缀见证？
- 最长重复子串长度与 LCP 数组是什么关系？
- 怎样从最大 LCP 的位置恢复原字符串内容？
- 为什么严格更新能保留字典序最小的最长答案？
- 允许重叠与要求不重叠的版本有什么区别？
