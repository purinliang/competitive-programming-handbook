# 后缀数组：最长公共前缀数组

> 最近修订：2026-08-23 18:15 +10:00（未审阅）

## 为什么需要最长公共前缀数组

[后缀数组](suffix-array.md) 已经用 `sa` 保存全部后缀的字典序，并用 `rk` 保存每个后缀的排名。它可以直接比较两个完整后缀的先后顺序，也可以在后缀顺序中二分查找模式串。

但是 `sa` 和 `rk` 没有回答另一个重要问题：两个后缀开头有多少个字符相同？若每次查询都从第一个字符开始比较，单次最坏需要 $O(n)$ 时间；若对许多对后缀重复这样做，已经比较过的字符会被反复扫描。

后缀数组把相似的后缀排列在一起。只要补充相邻后缀的最长公共前缀，就能进一步处理重复子串、公共子串、不同子串计数和任意两个后缀的最长公共前缀查询。

## 最长公共前缀数组是什么

最长公共前缀（Longest Common Prefix，LCP）是两个字符串从开头开始完全相同的最长一段。本文中的 `lcp` 数组专门与后缀数组配套：

```text
lcp[order] = 从 sa[order - 1] 和 sa[order] 开始的两个后缀
             的最长公共前缀长度
```

`sa[1]` 没有字典序前驱，因此规定 `lcp[1] = 0`。`banana` 的后缀顺序和 `lcp` 是：

```text
order = [1, 2, 3, 4, 5, 6]
sa    = [6, 4, 2, 1, 5, 3]
lcp   = [0, 1, 3, 0, 0, 2]
```

例如 `sa[3] = 2`，从位置 2 开始的后缀是 `anana`；它的字典序前驱从 `sa[2] = 4` 开始，对应 `ana`。两个后缀的最长公共前缀是 `ana`，所以 `lcp[3] = 3`。

`lcp` 只显式保存相邻后缀的答案，但后面会看到，任意两个后缀之间的答案都可以转化为一段连续 `lcp` 的最小值。

## 怎样构造最长公共前缀数组

### 直接比较的重复工作

按照 `sa` 的顺序逐对比较相邻后缀当然能够得到答案，但每一对都从第一个字符开始。对 `aaaaa` 这类字符串，相邻后缀的公共前缀依次很长，总比较次数会达到 $O(n^2)$。

我们需要复用前一个位置已经得到的公共前缀，而不是重新扫描整段字符。

### 删除首字符后的下界

按照字符串位置从左到右处理后缀。设从位置 `pos` 开始的后缀与它的字典序前驱已经有 `height` 个相同字符。若 `height > 0`，同时删除两个后缀的首字符后，剩下的两个后缀仍然至少有 `height - 1` 个开头字符相同。

删除后的另一个后缀未必恰好是 `pos + 1` 的字典序前驱，但所有以同一个字符串为前缀的后缀在字典序中连续。既然字典序中较早的位置存在一个与 `pos + 1` 共享 `height - 1` 个字符的后缀，那么 `pos + 1` 与它的直接前驱也至少共享这么长的前缀。

因此处理下一个位置时，可以先令：

```cpp
if (height > 0) {
    --height;
}
```

然后只从这个已经确定的下界继续比较。`height` 每处理一个位置至多减少 1，每次字符相等又只会让它增加 1，因此全部向后扩展的总次数为 $O(n)$。这就是 Kasai 算法的核心。

### 按起点顺序计算

`rk[pos]` 给出从 `pos` 开始的后缀排名。若 `rk[pos] > 1`，它的字典序前驱起点就是：

```cpp
int prev = sa[rk[pos] - 1];
```

从已有的 `height` 继续比较两个后缀：

```cpp
while (pos + height <= n && prev + height <= n &&
       s[pos + height - 1] == s[prev + height - 1]) {
    ++height;
}
lcp[rk[pos]] = height;
```

这里的 `pos`、`prev` 和 `lcp` 使用 1-based 逻辑位置；原生 `string s` 使用 0-based，因此访问第 `pos + height` 个逻辑字符时要写成 `s[pos + height - 1]`。

### 完整代码

下面的代码在《后缀数组》的完整实现上增加 `lcp` 和 `build_lcp()`。输入一个只含小写拉丁字母的非空字符串，按字典序输出每个后缀的 1-based 逻辑起点及其 `lcp`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;

int n;
string s;

namespace SuffixArray {
    int sa[MAXN];
    int rk[MAXN];
    int lcp[MAXN];

    int rank_at(int pos) {
        if (pos > n) {
            return 0;
        }
        return rk[pos];
    }

    void counting_sort(vector<int>& ord, int offset, int rk_cnt) {
        static vector<int> buf(MAXN);
        static vector<int> cnt(MAXN);

        fill(cnt.begin(), cnt.begin() + rk_cnt + 1, 0);

        for (int i = 1; i <= n; ++i) {
            ++cnt[rank_at(ord[i] + offset)];
        }
        for (int val = 1; val <= rk_cnt; ++val) {
            cnt[val] += cnt[val - 1];
        }
        for (int i = n; i >= 1; --i) {
            int key = rank_at(ord[i] + offset);
            buf[cnt[key]--] = ord[i];
        }
        for (int i = 1; i <= n; ++i) {
            ord[i] = buf[i];
        }
    }

    int rebuild_rk(const vector<int>& ord, vector<int>& nrk, int width) {
        int rk_cnt = 1;
        nrk[ord[1]] = 1;

        for (int i = 2; i <= n; ++i) {
            int prev = ord[i - 1];
            int cur = ord[i];
            bool different = rk[prev] != rk[cur];

            if (width > 0 &&
                rank_at(prev + width) != rank_at(cur + width)) {
                different = true;
            }
            if (different) {
                ++rk_cnt;
            }
            nrk[cur] = rk_cnt;
        }

        for (int pos = 1; pos <= n; ++pos) {
            rk[pos] = nrk[pos];
        }
        return rk_cnt;
    }

    void build_sa() {
        static vector<int> ord(MAXN);
        static vector<int> nrk(MAXN);

        for (int i = 1; i <= n; ++i) {
            int pos = i;
            ord[i] = pos;
            rk[pos] = s[pos - 1] - 'a' + 1;
        }
        counting_sort(ord, 0, 26);

        int rk_cnt = rebuild_rk(ord, nrk, 0);

        for (int width = 1; width < n && rk_cnt < n; width *= 2) {
            for (int i = 1; i <= n; ++i) {
                ord[i] = i;
            }

            counting_sort(ord, width, rk_cnt);
            counting_sort(ord, 0, rk_cnt);
            rk_cnt = rebuild_rk(ord, nrk, width);
        }

        for (int i = 1; i <= n; ++i) {
            sa[i] = ord[i];
        }
    }

    void build_lcp() {
        int height = 0;
        lcp[1] = 0;

        for (int pos = 1; pos <= n; ++pos) {
            if (rk[pos] == 1) {
                height = 0;
                continue;
            }

            int prev = sa[rk[pos] - 1];
            while (pos + height <= n && prev + height <= n &&
                   s[pos + height - 1] == s[prev + height - 1]) {
                ++height;
            }
            lcp[rk[pos]] = height;

            if (height > 0) {
                --height;
            }
        }
    }

    void build() {
        build_sa();
        build_lcp();
    }
} // namespace SuffixArray

using namespace SuffixArray;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> s;
    n = s.size();

    build();
    for (int i = 1; i <= n; ++i) {
        cout << sa[i] << ' ' << lcp[i] << '\n';
    }

    return 0;
}
```

构造后缀数组需要 $O(n\log n)$ 时间，Kasai 算法需要 $O(n)$ 时间；两部分的保留结果和工作区都占 $O(n)$ 空间。若题目只需要后缀顺序，使用基础篇中不含 `lcp` 的版本即可。

## 最长公共前缀数组的应用

### 查询任意两个后缀

设两个不同后缀的排名分别为 `left` 和 `right`，并且 `left < right`。从 `sa[left]` 走到 `sa[right]` 时，每一对相邻后缀都必须保留某段公共前缀；两端后缀能够共同保留的长度由途中最短的一段决定。因此：

$$
\operatorname{LCP}(\mathrm{sa}[left],\mathrm{sa}[right])
=
\min_{left<i\le right}\mathrm{lcp}[i].
$$

若查询的是起点 `x` 和 `y`，先用 `rk[x]`、`rk[y]` 得到排名，再查询对应 `lcp` 闭区间的最小值。`x = y` 时，答案就是后缀自身长度 $n-x+1$。

这把任意后缀的最长公共前缀查询转化成静态区间最小值查询。可以根据题目使用 [稀疏表](../data-structures/sparse-table.md)、线段树或其他 RMQ 结构；例如稀疏表预处理 $O(n\log n)$，随后每次查询 $O(1)$。

知道两个后缀的 LCP 后，还可以比较两个等长子串：若公共前缀长度不小于子串长度，它们相等；否则比较公共前缀之后的第一个不同字符即可判断字典序。

### 子串问题

`lcp` 把许多子串问题变成对相邻后缀或一段排名区间的处理：

- 最长重复子串是 `lcp[2..n]` 的最大值，完整推导见 [最长重复子串](longest-repeated-substring.md)；
- 把两个字符串用独立分隔符连接后，只检查来自不同字符串的相邻后缀，可以求 [最长公共子串](longest-common-substring.md)；
- 排名为 `order` 的后缀新增 $n-\mathrm{sa}[order]+1-\mathrm{lcp}[order]$ 个本质不同子串；
- 同一份新增贡献可以进一步寻找 [字典序第 k 小子串](kth-lexicographic-substring.md)。

这些问题各自还有边界、答案恢复和题目变体，因此分别成篇；本文只负责建立它们共同依赖的 `lcp` 信息。
