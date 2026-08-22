# 后缀数组

> 最近修订：2026-08-23 08:02 +10:00（未审阅）

字符串 `banana` 有六个非空后缀：

```text
1  banana
2  anana
3  nana
4  ana
5  na
6  a
```

把它们按照字典序排列：

```text
6  a
4  ana
2  anana
1  banana
5  na
3  nana
```

后缀数组保存的就是这列起点：

```text
6, 4, 2, 1, 5, 3
```

它把字符串的所有后缀变成一个有序序列。子串是某个后缀的前缀，因此很多子串问题可以
转成：在后缀顺序中查找一段连续区间，或比较相邻后缀的最长公共前缀。

## 三个数组的定义

字符串长度为 `n`，正文使用从 `1` 开始的位置。

### 后缀数组

`sa[order]` 表示字典序第 `order` 小的后缀起点。

对 `banana`：

```text
sa[1..6] = 6, 4, 2, 1, 5, 3
```

### 排名数组

`rank_value[pos]` 表示从 `pos` 开始的后缀排第几。它与 `sa` 互为逆映射：

```cpp
rank_value[sa[order]] = order;
```

### 最长公共前缀数组

`lcp[order]` 表示：

```text
suffix(sa[order - 1])
和
suffix(sa[order])
```

的最长公共前缀长度。规定 `lcp[1]=0`。

对 `banana`：

```text
lcp[1..6] = 0, 1, 3, 0, 0, 2
```

例如 `anana` 与前一个后缀 `ana` 的最长公共前缀是 `ana`，所以对应值为 `3`。

## 为什么不能直接比较整个后缀

若把每个后缀当成普通字符串排序，一次比较最坏会逐字符扫描 `O(n)`，排序又需要
`O(n log n)` 次比较，总时间可能达到：

$$
O(n^2\log n).
$$

倍增算法逐轮建立排名。第 `round` 轮只比较每个后缀开头长度为 `2^round` 的部分，并
复用上一轮已经得到的短前缀排名，不再反复扫描字符。

## 第一次排序：只看一个字符

初始时，每个位置的排名只由当前字符决定：

```cpp
rank_value[i] = (unsigned char)text[i - 1] + 1;
```

`text` 是 C++ 的 `string`，原生下标从 `0` 开始；构造时一次转换成正文使用的 1-based
位置。

字符编号额外加 `1`，把排名 `0` 留给“已经越过字符串结尾”的空部分。空字符串比任何
非空字符串小，这个哨兵排名会让短后缀自然排在拥有相同前缀的长后缀前面。

## 倍增长度

假设已经知道每个位置开头、长度为 `width` 的字符串排名。长度为 `2*width` 的部分可
拆成两半：

```text
[pos, pos + width - 1]
[pos + width, pos + 2 * width - 1]
```

所以位置 `pos` 的新排序关键字是二元组：

$$
(rank[pos],\ rank[pos+width]).
$$

若第二段越过结尾，就使用排名 `0`。

比较两个整数二元组是 `O(1)`。本轮排序完成后，把相同二元组压成同一个新排名，不同
二元组依次编号为 `1,2,...`。

当排名种类达到 `n` 时，所有后缀已经互不相同，可以提前结束。

## 怎样在线性时间排序二元组

直接用 `sort` 比较二元组，每轮是 `O(n log n)`，总计 `O(n log^2 n)`。后缀排名始终是
不超过 `n` 的整数，可以使用稳定计数排序把每轮降为 `O(n)`。

已知后缀已经按照第二段排名排列。构造待排序起点 `second`：

1. 先放入最后 `width` 个位置，它们的第二段为空，排名为 `0`；
2. 再按照旧 `sa` 顺序，把每个大于 `width` 的起点减去 `width`。

第二类位置 `pos=sa[i]-width` 的第二段恰好从 `sa[i]` 开始，因此仍保持旧后缀排名顺序。
整个 `second` 已按二元组第二关键字稳定有序。

再只按第一关键字 `rank_value[second[i]]` 做一次稳定计数排序，就得到两个关键字共同的
顺序。这相当于二元组的基数排序。

## 构造 LCP 数组

后缀数组完成后，还需要相邻后缀的最长公共前缀。

设从位置 `pos` 开始的后缀与它的字典序前驱已有 `height` 个相同字符。移动到
`pos+1` 后，两边都删除首字符，若原来至少有一个匹配字符，就还剩至少：

$$
height-1
$$

个相同字符。因此下一位置不必从 `0` 重新比较，只需先把 `height` 减一，再继续向后
扩展。

`height` 在整个过程中增加总次数不超过 `n`，减少总次数也不超过 `n`，所以构造全部
`lcp` 的时间复杂度是 `O(n)`。这通常称为 Kasai 算法。

## 完整代码

输入一个不含空白字符的非空字符串。按字典序输出每个后缀的 1-based 起点，以及它与
前一个后缀的最长公共前缀长度。

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

    string text;
    cin >> text;

    SuffixArray suffix_array(text);
    for (int order = 1; order <= suffix_array.n; ++order) {
        cout << suffix_array.sa[order] << ' ' << suffix_array.lcp[order]
             << '\n';
    }

    return 0;
}
```

## 正确性

倍增阶段保持归纳不变量：进入宽度 `width` 的一轮时，`rank_value[pos]` 正确表示从
`pos` 开始、长度不超过 `width` 的前缀顺序。

本轮用二元组：

$$
(rank[pos],\ rank[pos+width])
$$

完整表示长度不超过 `2*width` 的前缀。稳定计数排序先保留第二关键字顺序，再按第一
关键字排序，得到二元组字典序；重新编号后归纳不变量对双倍宽度成立。

当 `width >= n`，比较范围已经覆盖任意两个后缀首次不同的位置或其中一个结尾，因此
顺序就是完整后缀字典序。若提前得到 `n` 个不同排名，同样说明顺序已经唯一确定。

LCP 阶段对每个后缀只与字典序前驱比较，直接得到定义中的相邻最长公共前缀。复用
`height-1` 只跳过已经由上一位置证明相同的字符，不会越过新的失配位置，因此结果保持
正确。

## 复杂度

后缀前缀长度每轮翻倍，共 `O(log n)` 轮。每轮构造顺序、计数排序和重新编号都是
`O(n)`：

- 构造后缀数组：`O(n log n)`；
- 构造 LCP：`O(n)`；
- 空间复杂度：`O(n)`。

若把每轮计数排序换成比较排序，代码可以更短，但复杂度会变成 `O(n log^2 n)`。

## 常见错误

- 混淆 `sa[order]` 与 `rank_value[pos]` 的方向；
- 忘记 `lcp[order]` 比较的是 `sa[order-1]` 和 `sa[order]`；
- 越过字符串结尾的第二段没有使用比正常排名更小的 `0`；
- 二元组只按第一关键字排序，没有保持第二关键字的稳定顺序；
- 重新编号时漏比较第二段排名；
- 字符值直接存入有符号 `char`，扩展字符可能得到负数；
- `string` 的 0-based 下标与正文 1-based 位置混用；
- LCP 每个位置都从 `0` 开始比较，使构造退化到 `O(n^2)`；
- 查询普通子串时忘记它是某个后缀的前缀，而不是一个完整后缀。

## 需要记住什么

- `sa`、`rank_value` 和 `lcp` 分别以什么作为下标、保存什么？
- 为什么普通后缀比较可能导致平方级字符扫描？
- 倍增时一个新排名由哪两个旧排名组成？
- 排名 `0` 为什么留给越过字符串结尾的部分？
- 怎样用第二关键字已有顺序和一次计数排序完成二元组排序？
- Kasai 算法为什么能从上一位置的 LCP 减一开始比较？
- 后缀数组和 LCP 为后续子串问题分别提供了什么信息？
