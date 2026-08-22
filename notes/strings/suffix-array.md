# 后缀数组

> 最近修订：2026-08-23 09:55 +10:00（未审阅）

## 为什么需要后缀数组

给定一个不会修改的字符串 $s$，我们可能需要反复回答一类与连续子串有关的问题：某个模式串是否出现、出现在哪里，哪些子串重复出现，或者不同子串按照字典序怎样排列。最直接的统一做法是枚举并保存所有子串；有了这张完整的表，查找、计数和排序都会变得容易。但是长度为 $n$ 的字符串共有 $n(n+1)/2$ 个非空子串，较长字符串无法承担这样的预处理时间和存储空间。

关键的观察是：子串不必单独保存。例如 `banana` 中从位置 2 到位置 4 的子串 `ana`，就是后缀 `anana` 的前三个字符。一般地，子串 $s[l..r]$ 一定是后缀 $s[l..n]$ 的前 $r-l+1$ 个字符。只要找到这个后缀，就能在它的开头找到原来的子串。

长度为 $n$ 的字符串只有 $n$ 个后缀。后缀数组把这些后缀按照字典序排列，但数组中只保存每个后缀的起点。排序以后，以同一个模式串开头的后缀会连续出现，所以查找模式串可以转化为寻找一段连续区间；重复子串则可以通过相邻后缀的公共前缀发现。这就是后缀数组的核心思路。

## 后缀数组是什么

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

后缀数组保存的就是排序后的起点。用方括号依次列出从 1 到 6 的值：

```text
order = [1, 2, 3, 4, 5, 6]
sa    = [6, 4, 2, 1, 5, 3]
```

一般地，正文使用从 1 开始的位置，并定义：

```text
sa[order] = 字典序第 order 小的后缀起点
```

已知起点、需要反过来查询排名时，使用它的逆映射 `rk`：

```text
rk[pos] = 从 pos 开始的后缀排名
```

对 `banana`：

```text
pos = [1, 2, 3, 4, 5, 6]
rk  = [4, 3, 6, 2, 5, 1]
```

因此始终有：

```cpp
rk[sa[order]] = order;
```

相邻后缀之间的相似程度由最长公共前缀数组 `lcp` 保存：

```text
lcp[order] = 从 sa[order - 1] 和 sa[order] 开始的两个后缀
             的最长公共前缀长度
```

规定 `lcp[1] = 0`。对 `banana`：

```text
order = [1, 2, 3, 4, 5, 6]
lcp   = [0, 1, 3, 0, 0, 2]
```

例如 `anana` 与前一个后缀 `ana` 的最长公共前缀是 `ana`，所以对应值为 `3`。严格来说，`sa` 才是后缀数组；`rk` 和 `lcp` 是经常与它配套使用的数组。

## 怎样构造后缀数组

### 直接排序的瓶颈

若把每个后缀当成普通字符串排序，一次比较最坏会逐字符扫描 $O(n)$，排序又需要 $O(n\log n)$ 次比较，总时间可能达到：

$$
O(n^2\log n).
$$

倍增算法逐轮建立排名：先按第一个字符排名，随后依次确定长度不超过 $2,4,8,\ldots$ 的前缀排名。每一轮复用上一轮已经得到的短前缀排名，不再反复扫描字符。

### 按第一个字符排序

初始时，每个位置的排名只由当前字符决定：

```cpp
rk[i] = (unsigned char)s[i] + 1;
```

读入的 `string` 原生下标从 0 开始；构造函数在开头补一个不参与排序的占位字符，使成员 `s` 的有效字符位置与 `sa`、`rk` 和 `lcp` 一样从 1 开始。先把字符转成 `unsigned char`，可以避免实现将 `char` 解释为负数时得到错误排名。

字符编号额外加 `1`，把排名 `0` 留给“已经越过字符串结尾”的空部分。空字符串比任何非空字符串小，这个哨兵排名会让短后缀自然排在拥有相同前缀的长后缀前面。

### 倍增已经比较的长度

用 `width` 表示当前排名已经覆盖的长度。假设已经知道每个位置开头、长度为 `width` 的字符串排名，长度为 `2 * width` 的部分可以拆成两半：

```text
[pos, pos + width - 1]
[pos + width, pos + 2 * width - 1]
```

所以位置 `pos` 的新排序关键字是二元组（`rk[pos]`, `rk[pos + width]`）。

若第二段越过结尾，就使用排名 `0`。两个旧排名分别完整描述前半段和后半段，因此两个位置的二元组相同，当且仅当它们长度不超过 `2 * width` 的前缀相同。

比较两个整数二元组是 $O(1)$。本轮排序完成后，把相同二元组压成同一个新排名，不同二元组依次编号为 $1,2,\ldots$。当排名种类达到 $n$ 时，所有后缀已经互不相同，可以提前结束。

### 排序排名二元组

直接用 `sort` 比较二元组，每轮是 $O(n\log n)$，总计 $O(n\log^2 n)$。这是最容易理解的倍增实现。后缀排名始终是不超过 `n` 的整数，还可以使用稳定计数排序把每轮降为 $O(n)$。

首先构造已经按第二段排名排列的待排序起点 `order`：

1. 先放入最后 `width` 个位置，它们的第二段为空，排名为 `0`；
2. 再按照旧 `sa` 顺序，把每个大于 `width` 的起点减去 `width`。

第二类位置 `pos = sa[i] - width` 的第二段恰好从 `sa[i]` 开始，因此仍保持旧后缀排名顺序。整个 `order` 已按二元组第二关键字稳定有序。

再只按第一关键字 `rk[order[i]]` 做一次稳定计数排序，就得到两个关键字共同的顺序。这相当于先按第二关键字、再稳定地按第一关键字排序，因此结果就是二元组的字典序。

这里每一趟使用的是计数排序：统计每个整数排名出现的次数，再通过前缀和确定稳定的写入位置。桶排序会先把元素分配到若干范围桶中，并可能继续在桶内排序；两者不应在正文中混用。对二元组先排第二关键字、再稳定地排第一关键字，整体采用的是基数排序思路。

### 构造 LCP 数组

后缀数组完成后，还需要计算相邻后缀的最长公共前缀。

设从位置 `pos` 开始的后缀与它的字典序前驱已有 `height` 个相同字符。若 `height > 0`，删除两个后缀的首字符后，剩余后缀仍有至少 `height - 1` 个相同字符，而且字典序关系不变。即使后一个位置的直接前驱换成了另一个后缀，它与前驱的 LCP 也不会小于这个已经得到的下界。

因此处理 `pos + 1` 时，不必从 `0` 重新比较，只需先把 `height` 减一，再继续向后扩展。每处理一个位置，`height` 至多减少一次；它始终非负，所以所有向后扩展的总次数也是 $O(n)$。这通常称为 Kasai 算法。

### 复杂度

后缀前缀长度每轮翻倍，共 $O(\log n)$ 轮。每轮构造顺序、计数排序和重新编号都是 $O(n)$：

- 构造后缀数组：$O(n\log n)$；
- 构造 LCP：$O(n)$；
- 空间复杂度：$O(n)$。

若把每轮计数排序换成比较排序，代码可以更短，但复杂度会变成 $O(n\log^2 n)$。还有能够在线性时间构造后缀数组的算法，但它们不属于本文的主线实现。

### 完整代码

输入一个不含空白字符的非空字符串。按字典序输出每个后缀的 1-based 起点，以及它与前一个后缀的最长公共前缀长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct SuffixArray {
    string s;
    int n;
    vector<int> sa;
    vector<int> rk;
    vector<int> lcp;

    SuffixArray(const string& source) {
        n = source.size();
        s = " " + source;
        sa.assign(n + 5, 0);
        rk.assign(n + 5, 0);
        lcp.assign(n + 5, 0);
        build_suffix_array();
        build_lcp();
    }

    void counting_sort(const vector<int>& order, int max_rank) {
        vector<int> count(max(n, max_rank) + 5, 0);

        for (int i = 1; i <= n; ++i) {
            ++count[rk[order[i]]];
        }
        for (int value = 1; value <= max_rank; ++value) {
            count[value] += count[value - 1];
        }
        for (int i = n; i >= 1; --i) {
            int pos = order[i];
            sa[count[rk[pos]]--] = pos;
        }
    }

    void build_suffix_array() {
        vector<int> order(n + 5, 0);
        vector<int> new_rk(n + 5, 0);

        for (int i = 1; i <= n; ++i) {
            order[i] = i;
            rk[i] = (unsigned char)s[i] + 1;
        }
        counting_sort(order, 256);

        int max_rank = 256;
        for (int width = 1; width < n; width *= 2) {
            int order_count = 0;

            for (int pos = n - width + 1; pos <= n; ++pos) {
                order[++order_count] = pos;
            }
            for (int i = 1; i <= n; ++i) {
                if (sa[i] > width) {
                    order[++order_count] = sa[i] - width;
                }
            }

            counting_sort(order, max_rank);

            int rank_count = 1;
            new_rk[sa[1]] = 1;

            for (int i = 2; i <= n; ++i) {
                int previous = sa[i - 1];
                int current = sa[i];
                int previous_second =
                    previous + width <= n ? rk[previous + width] : 0;
                int current_second =
                    current + width <= n ? rk[current + width] : 0;

                if (rk[previous] != rk[current] ||
                    previous_second != current_second) {
                    ++rank_count;
                }
                new_rk[current] = rank_count;
            }

            rk.swap(new_rk);
            max_rank = rank_count;
            if (rank_count == n) {
                break;
            }
        }

        for (int i = 1; i <= n; ++i) {
            rk[sa[i]] = i;
        }
    }

    void build_lcp() {
        int height = 0;

        for (int pos = 1; pos <= n; ++pos) {
            int order = rk[pos];
            if (order == 1) {
                height = 0;
                continue;
            }

            int previous = sa[order - 1];
            while (pos + height <= n && previous + height <= n &&
                   s[pos + height] == s[previous + height]) {
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

    string s;
    cin >> s;

    SuffixArray suffix_array(s);
    for (int order = 1; order <= suffix_array.n; ++order) {
        cout << suffix_array.sa[order] << ' ' << suffix_array.lcp[order]
             << '\n';
    }

    return 0;
}
```

### 实现时需要注意

- `sa[order]` 从排名映射到起点，`rk[pos]` 从起点映射到排名；
- `lcp[order]` 比较的是 `sa[order - 1]` 和 `sa[order]`；
- 越过字符串结尾的第二段使用比所有正常排名更小的 `0`；
- 构造函数只在接口边界给 `s` 补一次占位字符，算法内部的字符位置和三个数组统一使用 1-based 下标。

## 后缀数组的应用

### 查找模式串

在 `banana` 中查找 `ana` 时，以 `ana` 为前缀的后缀是：

```text
ana
anana
```

它们在后缀顺序中连续。比较模式串与一个后缀的前缀，并分别二分区间的左右边界，就能找到所有以模式串开头的后缀；这些后缀在 `sa` 中保存的起点，也就是模式串的全部出现位置。

若每次比较都直接扫描模式串，查询长度为 $m$ 的模式串需要 $O(m\log n)$ 时间。更复杂的实现可以利用 LCP 减少重复比较，但不改变“相同前缀形成连续区间”这个核心转换。

### 重复子串与公共子串

一个子串出现至少两次，意味着至少两个后缀以它为公共前缀。所有拥有这个前缀的后缀排列在同一个连续区间中，因此其中必然有一对相邻后缀仍然拥有这个前缀。最长重复子串的长度就是：

$$
\max_{2\le i\le n}\mathrm{lcp}[i].
$$

求两个字符串的最长公共子串时，可以用一个不会在原串中出现的分隔符把它们连接。只检查分别来自两个原字符串的相邻后缀，并取其中最大的 LCP，就能得到答案。

### 不同子串计数

排名为 $i$ 的后缀拥有 $n-\mathrm{sa}[i]+1$ 个非空前缀。它与排在前面的所有后缀能够共享的最长前缀，恰好是它与相邻前驱的 LCP；更早的后缀如果共享更长前缀，也会被排列到两者之间。因此前 $\mathrm{lcp}[i]$ 个前缀已经出现过，当前后缀新增的不同子串数量是：

$$
n-\mathrm{sa}[i]+1-\mathrm{lcp}[i].
$$

把每个后缀的贡献相加，就能统计不同子串数量。对 `banana`，全部子串共有 21 个，相邻后缀的 LCP 之和为 6，所以不同子串共有 15 个。同一组贡献还可以继续用于寻找字典序第 $k$ 小的不同子串。

### 循环移位与最小表示

把字符串 `s` 复制一遍得到 `s + s`。原字符串的每一种循环移位，恰好是 `s + s` 中从位置 $1$ 到 $n$ 开始、长度为 $n$ 的子串，也就是这些后缀长度为 $n$ 的前缀。

构造 `s + s` 的后缀数组后，从字典序最小的一端开始，找到第一个起点位于 $[1,n]$ 的后缀，取出它的前 $n$ 个字符，就得到字典序最小循环表示。若原串具有周期，可能有多个起点得到相同的最小字符串；只需要最小字符串时任选一个即可，若还要求最小起点，则需要继续处理这些并列结果。

这个转换能够直接复用后缀数组，但只解决最小循环表示时，线性的 Booth 算法更直接。

### 后缀数组的能力边界

后缀数组最擅长处理静态字符串中与以下关系有关的问题：

- 配合 LCP 的区间最小值查询，判断两个连续子串是否相等；
- 子串或后缀的字典序；
- 两个后缀共享多长的前缀；
- 由公共前缀得到的重复子串、公共子串和不同子串统计。

这里的“静态”很重要：原字符串发生插入、删除或修改后，原有后缀顺序通常不再有效，不能像平衡树那样局部维护。后缀数组也不会直接解决不连续的子序列、允许失配的近似匹配，或与字典序和公共前缀无关的区间统计；这些问题需要动态规划、自动机或其他数据结构。即使一个问题能够转换到后缀数组，也应继续比较是否存在更直接的专用算法。
