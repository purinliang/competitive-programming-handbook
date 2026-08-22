# 子串出现次数

> 最近修订：2026-08-23 08:57 +10:00（未审阅）

给定一篇固定文本和许多模式串，询问每个模式在文本中出现多少次，重叠出现也要计入。

模式 `pattern` 在位置 `pos` 出现，当且仅当它是从 `pos` 开始的后缀的前缀。因此一次
出现可以改写成一个后缀条件：

```text
suffix(pos) 以 pattern 开头
```

后缀数组已经把所有后缀按字典序排列。以同一个模式为前缀的字符串在字典序中连续，
所以每个模式对应后缀数组中的一个连续区间；两次二分找到区间左右边界，区间长度就是
出现次数。

## 为什么重叠出现不需要特判

文本 `aaaa` 中，模式 `aa` 从位置 `1,2,3` 开始，共出现三次。对应三个后缀：

```text
aaaa
aaa
aa
```

都以 `aa` 开头。每个后缀起点对应一个不同出现起点，即使区间彼此重叠，也仍然是三个
不同后缀，不会被合并。

因此只需统计匹配后缀数量，重叠与否不会改变算法。

## 匹配后缀为什么形成连续区间

任意两个以 `pattern` 开头的后缀 `A` 和 `B`，若字典序中有：

```text
A < C < B
```

那么 `C` 也必须以 `pattern` 开头。

否则 `C` 会在 `pattern` 尚未结束时出现第一个不同字符：

- 若这个字符更小，`C` 应排在所有 `pattern` 前缀字符串以前；
- 若这个字符更大，`C` 应排在它们以后。

它不可能夹在 `A,B` 之间。因此全部匹配后缀组成连续块。

## 比较一个后缀与模式

定义：

```cpp
compare_suffix_with_pattern(pos, pattern)
```

返回：

- `-1`：后缀字典序小于模式；
- `0`：模式是后缀的前缀，也就是匹配；
- `1`：后缀字典序大于模式，并且不匹配。

逐字符比较：

1. 遇到不同字符，直接由这两个字符决定大小；
2. 模式先结束，返回 `0`；
3. 后缀先结束，返回 `-1`。

第二条与普通完整字符串比较略有不同。普通比较中，`pattern` 先结束时后缀更大；本文却
需要把所有“以模式开头”的后缀统一归入匹配块，因此返回 `0`。

## 第一次二分：匹配区间左端

寻找第一个比较结果不小于 `0` 的后缀：

```text
first compare >= 0
```

此前所有后缀都严格小于模式；这个位置可能是第一个匹配，也可能已经大于模式。

## 第二次二分：匹配区间右端之后

寻找第一个比较结果大于 `0` 的后缀：

```text
first compare > 0
```

比较结果为 `0` 的整个连续块位于两条边界之间。若左边界为 `left`，右边界之后为
`right`，出现次数就是：

$$
right-left.
$$

若没有匹配，两次二分会落在同一位置，答案自然为 `0`。

## 完整代码

输入一篇只含小写英文字母的非空文本，以及若干非空模式串。对每个模式输出它在文本中
的出现次数。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct SuffixArray {
    string text;
    int n;
    vector<int> sa;
    vector<int> rank_value;

    SuffixArray(const string& text) : text(text) {
        n = text.size();
        sa.assign(n + 5, 0);
        rank_value.assign(n + 5, 0);
        build_suffix_array();
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

    int compare_suffix_with_pattern(int pos, const string& pattern) const {
        int text_index = pos - 1;
        int pattern_index = 0;

        while (text_index < n && pattern_index < (int)pattern.size() &&
               text[text_index] == pattern[pattern_index]) {
            ++text_index;
            ++pattern_index;
        }

        if (pattern_index == (int)pattern.size()) {
            return 0;
        }
        if (text_index == n) {
            return -1;
        }
        return text[text_index] < pattern[pattern_index] ? -1 : 1;
    }

    int count_occurrences(const string& pattern) const {
        int low = 1;
        int high = n + 1;

        while (low < high) {
            int middle = (low + high) / 2;
            if (compare_suffix_with_pattern(sa[middle], pattern) >= 0) {
                high = middle;
            } else {
                low = middle + 1;
            }
        }
        int left = low;

        low = 1;
        high = n + 1;
        while (low < high) {
            int middle = (low + high) / 2;
            if (compare_suffix_with_pattern(sa[middle], pattern) > 0) {
                high = middle;
            } else {
                low = middle + 1;
            }
        }
        int right = low;

        return right - left;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    cin >> text;

    SuffixArray suffix_array(text);

    int query_count;
    cin >> query_count;
    while (query_count--) {
        string pattern;
        cin >> pattern;
        cout << suffix_array.count_occurrences(pattern) << '\n';
    }

    return 0;
}
```

二分区间使用后缀数组的 1-based 闭区间候选位置，但把 `n+1` 作为“所有后缀之后”的
哨兵边界。循环只在 `middle<=n` 时访问 `sa[middle]`，不会读取哨兵位置。

## 正确性

模式在位置 `pos` 出现，当且仅当模式是 `suffix(pos)` 的前缀。因此问题等价于统计满足
该前缀条件的后缀数量。

所有以同一模式开头的后缀在字典序中连续。第一次二分找到第一个比较结果 `>=0` 的位置，
第二次找到第一个比较结果 `>0` 的位置；两者之间恰好是比较结果为 `0` 的匹配块。

每个匹配后缀起点唯一对应模式的一次出现，每次出现也唯一产生一个匹配后缀，所以区间
长度与出现次数相等，重叠出现同样被正确计入。

## 复杂度

设文本长度为 `n`，模式长度为 `m`：

- 构造后缀数组：`O(n log n)`；
- 每次后缀与模式比较：`O(m)`；
- 单次查询两次二分：`O(m log n)`；
- 空间复杂度：`O(n)`。

可以进一步复用二分过程中的公共前缀，把单次查询优化得更细，但普通竞赛约束下这份
实现更清楚，也更不容易写错。

## 与其他匹配结构的选择

- 单篇文本、许多模式查询：后缀数组和后缀自动机都适合；
- 许多模式、扫描一篇或多篇文本并分别统计模式：AC 自动机更自然；
- 只有一个模式和一篇文本：KMP、Z 函数通常代码更短；
- 还需要后缀字典序、LCP 或第 `k` 小子串：优先复用后缀数组。

结构的选择取决于后续需要的接口，不应为了单次普通匹配强行使用更复杂结构。

## 常见错误

- 把模式与完整后缀相等当成匹配条件，漏掉模式只是后缀前缀的情况；
- 模式先结束时仍返回“后缀更大”，无法形成统一匹配区间；
- 只做一次二分找到某个匹配，却没有统计完整连续块；
- 左边界和右边界使用相同的比较条件；
- `n+1` 哨兵参与实际 `sa` 访问；
- 后缀先结束时错误返回匹配；
- 统计不允许重叠，额外跳过已经覆盖的位置；
- 对单个短模式也构造复杂结构，没有考虑更简单的 KMP；
- 忽略字符集或大小写规则，使字典序比较与题意不一致。

## 需要记住什么

- 模式在位置 `pos` 出现怎样转换成后缀前缀条件？
- 为什么全部匹配后缀在后缀数组中连续？
- 自定义比较返回 `0` 的条件是什么？
- 两次二分分别寻找哪条边界？
- 为什么区间长度自然包含重叠出现？
- 单次查询的复杂度为什么包含模式长度？
- 后缀数组、后缀自动机、AC 自动机和 KMP 分别适合怎样的查询组合？
