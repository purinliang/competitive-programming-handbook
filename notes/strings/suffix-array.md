# 后缀数组

> 最近修订：2026-08-23 18:15 +10:00（已审阅）

## 为什么需要后缀数组

给定一个不会修改的字符串 $s$，我们可能需要反复回答一类与连续子串有关的问题：某个模式串是否出现、出现在哪里，哪些子串重复出现，或者不同子串按照字典序怎样排列。最直接的统一做法是枚举并保存所有子串；有了这张完整的表，查找、计数和排序都会变得容易。但是长度为 $n$ 的字符串共有 $n(n+1)/2$ 个非空子串，较长字符串无法承担这样的预处理时间和存储空间。

关键的观察是：子串不必单独保存。例如 `banana` 中从第 2 个字符到第 4 个字符的子串 `ana`，就是后缀 `anana` 的前三个字符。后缀数组作为本书自定义的结构，内部位置统一使用 1-based，因此子串 $s[l..r]$ 一定是后缀 $s[l..n]$ 的前 $r-l+1$ 个字符。只要找到这个后缀，就能在它的开头找到原来的子串。

长度为 $n$ 的字符串只有 $n$ 个后缀。后缀数组把这些后缀按照字典序排列，但数组中只保存每个后缀的起点。排序以后，以同一个模式串开头的后缀会连续出现，所以查找模式串可以转化为寻找一段连续区间。这就是后缀数组的核心思路。

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

后缀数组保存的就是排序后的起点。后缀排名和逻辑起点都使用 1-based：

```text
order = [1, 2, 3, 4, 5, 6]
sa    = [6, 4, 2, 1, 5, 3]
```

`sa[order]` 中的 `order` 和数组值都是后缀数组的逻辑下标。因此 `sa[1] = 6` 表示字典序最小的后缀从第 6 个字符开始；真正访问原生 `string` 时，第 `pos` 个字符对应 `s[pos - 1]`。一般地：

```text
sa[order] = 字典序第 order 小的后缀起点
```

已知起点、需要反过来查询排名时，使用它的逆映射 `rk`：

```text
rk[pos] = 从字符串位置 pos 开始的后缀排名
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

严格来说，`sa` 才是后缀数组，`rk` 是它的逆映射。它们共同保存后缀的字典序，却还没有记录两个后缀究竟有多少个开头字符相同。

## 怎样构造后缀数组

### 用排名代替重复比较

最直接的构造方法是把每个后缀当成普通字符串交给 `sort`。但是一次比较最坏会扫描 $O(n)$ 个字符，排序又需要 $O(n\log n)$ 次比较，总时间可能达到 $O(n^2\log n)$。

问题在于，同一段字符会在不同后缀比较中被反复扫描。我们可以先给短前缀排名，以后只比较排名，不再重新比较已经处理过的字符。初始时只看第一个字符；对 `banana`，可以把 `a`、`b`、`n` 依次编号为 1、2、3：

```text
pos  = [1, 2, 3, 4, 5, 6]
char = [b, a, n, a, n, a]
rk   = [2, 1, 3, 1, 3, 1]
```

本文限定输入只包含小写拉丁字母 `a` 到 `z`，因此直接把字符编号为 1 到 26，并把排名 0 留给已经越过字符串结尾的空部分：

```cpp
rk[pos] = s[pos - 1] - 'a' + 1;
```

### 把已知长度翻倍

用 `width` 表示当前排名已经能够区分的前缀长度。假设长度为 `width` 的前缀已经有正确排名，那么长度为 `2 * width` 的前缀可以拆成两段：

```text
[pos, pos + width - 1]
[pos + width, pos + 2 * width - 1]
```

第一段的排名是 `rk[pos]`，第二段的排名是 `rk[pos + width]`，所以新的排序关键字是二元组（`rk[pos]`, `rk[pos + width]`）。若第二段越过字符串结尾，就把它的排名记为 0。

第一次进入倍增时 `width = 1`。对 `banana`，每个位置的二元组是：

```text
pos = [1,     2,     3,     4,     5,     6]
key = [(2,1), (1,3), (3,1), (1,3), (3,1), (1,0)]
```

按二元组排序后，位置顺序是 `[6, 2, 4, 1, 3, 5]`。其中位置 2 和位置 4 的关键字相同，说明前两个字符都是 `an`，暂时无法区分；位置 3 和位置 5 同理。把相同二元组赋予相同新排名，就得到：

```text
pos = [1, 2, 3, 4, 5, 6]
rk  = [3, 2, 4, 2, 4, 1]
```

下一轮令 `width = 2`，同一套过程就会比较长度为 4 的前缀。随后比较长度为 8、16、32，直到所有后缀的排名都不同，或者已比较长度覆盖整个字符串。

### 先用 `sort` 完成每一轮

知道二元组以后，最容易写出的版本就是直接排序所有起点：

```cpp
for (int i = 1; i <= n; ++i) {
    ord[i] = i;
}

sort(ord + 1, ord + n + 1, [&](int left, int right) {
    if (rk[left] != rk[right]) {
        return rk[left] < rk[right];
    }
    return rank_at(left + width) < rank_at(right + width);
});
```

`rank_at(pos)` 在 `pos > n` 时返回 0，否则返回 `rk[pos]`。排序完成后，`ord[1..n]` 就是当前轮的后缀顺序。接下来按这个顺序重新编号：

```cpp
int rk_cnt = 1;
nrk[ord[1]] = 1;

for (int i = 2; i <= n; ++i) {
    int prev = ord[i - 1];
    int cur = ord[i];

    if (rk[prev] != rk[cur] ||
        rank_at(prev + width) != rank_at(cur + width)) {
        ++rk_cnt;
    }
    nrk[cur] = rk_cnt;
}

for (int pos = 1; pos <= n; ++pos) {
    rk[pos] = nrk[pos];
}
for (int i = 1; i <= n; ++i) {
    sa[i] = ord[i];
}
```

每轮排序需要 $O(n\log n)$，一共进行 $O(\log n)$ 轮，因此这个直观版本已经能在 $O(n\log^2 n)$ 时间内构造后缀数组。

### 为什么改用计数排序

`sort` 不知道关键字的范围，只能不断比较两个元素。这里的正常排名却是从 1 开始的连续整数，最大值不超过 $n$，排名 0 只表示越过结尾的空部分。我们可以统计每个排名出现多少次，再用前缀和直接算出每个元素的写入位置。这就是计数排序能够把一轮排序降到 $O(n)$ 的原因。

二元组有两个关键字。先按第二关键字稳定排序，再按第一关键字稳定排序，最终顺序就是二元组的字典序。这是基数排序处理多关键字的通用方法：

```cpp
counting_sort(width, rk_cnt);
counting_sort(0, rk_cnt);
```

`offset = width` 表示读取第二段排名，`offset = 0` 表示读取第一段排名。一次稳定计数排序的核心过程是：

```cpp
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
```

从后向前写入保证排序稳定。本文故意保留两趟计数排序：有些模板会利用上一轮 `sa` 已有的顺序省去其中一趟，但那只是常数优化，会掩盖“先排第二关键字，再排第一关键字”的直接推导。

到这里可以明确区分两类知识：用短前缀排名组成二元组、每轮把已知长度翻倍、越过结尾时使用排名 0，是后缀数组倍增算法的结构；计数排序和稳定的多关键字排序是通用排序工具，并非后缀数组独有。

### 复杂度

后缀前缀长度每轮翻倍，共 $O(\log n)$ 轮。每轮构造顺序、计数排序和重新编号都是 $O(n)$：

- 构造后缀数组：$O(n\log n)$；
- 构造时的工作区：$O(n+\Sigma)$，其中 $\Sigma$ 是字符集大小；
- 构造完成后保留 `sa` 和 `rk`：$O(n)$。

若把每轮计数排序换成比较排序，代码可以更短，但复杂度会变成 $O(n\log^2 n)$。还有能够在线性时间构造后缀数组的算法，但它们不属于本文的主线实现。

本文的小写拉丁字母字符集有 $\Sigma=26$。后缀数组不会为每个位置永久保存一整张字符转移表；Trie、AC 自动机和后缀自动机若使用稠密转移数组，转移部分则需要 $O(\text{状态数}\times\Sigma)$ 空间。它们也可以换用稀疏转移，但时间常数和代码形态会随之改变。

### 完整代码

输入一个只含小写拉丁字母的非空字符串，按字典序输出每个后缀的 1-based 逻辑起点。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;

int n;
string s;

namespace SuffixArray {
    int sa[MAXN];
    int rk[MAXN];

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

    void build() {
        build_sa();
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
        cout << sa[i] << '\n';
    }

    return 0;
}
```

### 实现时需要注意

- `sa[order]` 从排名映射到起点，`rk[pos]` 从起点映射到排名；
- 越过字符串结尾的第二段使用比所有正常排名更小的 `0`；
- 后缀数组内部的起点和两个结果数组使用 1-based；访问原生 `string` 时，逻辑位置 `pos` 映射到 `s[pos - 1]`；
- `s` 和 `n` 属于题目，`build()` 负责构造索引；如果同一道题需要同时保存多份后缀数组，再改用 `struct` 封装每个实例。
- `sa` 和 `rk` 是构造结果。`ord` 和 `nrk` 属于 `build_sa()`，`buf` 和 `cnt` 属于 `counting_sort()`；这些工作区都是固定容量的局部 `static vector`，名称不离开所属函数，大块元素存储也不会进入调用栈。
- `ord`、`nrk` 和 `buf` 的本次有效范围都会在读取前完整覆写，因此不需要额外清空。`cnt` 会累加计数，所以每趟计数排序开始时必须使用 `fill` 重置实际排名范围。这套覆写规则也保证 `build()` 可以对新字符串重新调用。
- `rank_at()` 会把越过字符串结尾的第二段明确映射为排名 `0`。`+5` 只是少量容量余量，不能代替这个逻辑边界检查，因为 `pos + width` 最远可以接近 `2 * n`。
- `MAXN` 已经包含 `+5` 余量；题目上限不是 $10^6$ 时应直接修改这个容量常量。

## 后缀数组的应用

### 查找模式串

在 `banana` 中查找 `ana` 时，以 `ana` 为前缀的后缀是：

```text
ana
anana
```

它们在后缀顺序中连续。比较模式串与一个后缀的前缀，并分别二分区间的左右边界，就能找到所有以模式串开头的后缀；这些后缀在 `sa` 中保存的起点，也就是模式串的全部出现位置。

若每次比较都从第一个字符开始，查询长度为 $m$ 的模式串需要 $O(m\log n)$ 时间。还可以在二分时分别维护模式串与左右边界后缀已经匹配的前缀长度，检查中点时直接跳过已知相同的部分。整次查询新增的逐字符比较总数为 $O(m)$，再加上 $O(\log n)$ 次区间缩小，因此可以做到 $O(m+\log n)$。这只是查询时的边界优化，不改变“相同前缀形成连续区间”这个核心转换。

完整的二分边界、重叠出现次数和代码见 [子串出现次数](substring-occurrence-counting.md)。

### 后缀与循环移位的字典序

`rk[pos]` 已经给出从 `pos` 开始的后缀在全部后缀中的排名。因此比较两个完整后缀时，只需比较它们的 `rk`，不再扫描字符。

把字符串 `s` 复制一遍得到 `s + s`。原字符串的每一种循环移位，恰好是 `s + s` 中从位置 $1$ 到 $n$ 开始、长度为 $n$ 的子串，也就是这些后缀长度为 $n$ 的前缀。

构造 `s + s` 的后缀数组后，从字典序最小的一端开始，找到第一个起点位于 $[1,n]$ 的后缀，取出它的前 $n$ 个字符，就得到字典序最小循环表示。若原串具有周期，可能有多个起点得到相同的最小字符串；只需要最小字符串时任选一个即可，若还要求最小起点，则需要继续处理这些并列结果。

这个转换能够直接复用后缀数组，但只解决最小循环表示时，线性的 Booth 算法更直接。

### 后缀数组没有保存的信息

`sa` 和 `rk` 只记录后缀的字典序。若要知道两个后缀究竟有多少个开头字符相同，当前代码仍然只能从第一个字符开始比较，单次最坏需要 $O(n)$ 时间。重复进行这种比较时，已经比较过的字符会被反复扫描。

相邻后缀的最长公共前缀能够补上这部分信息。[后缀数组：最长公共前缀数组](suffix-array-lcp-array.md) 将定义 `lcp`，推导线性构造方法，并把任意两个后缀的最长公共前缀查询转化为区间最小值查询。

后缀数组仍然只适合不会修改的静态字符串。原字符串发生插入、删除或修改后，原有后缀顺序通常全部失效，不能像平衡树那样只更新局部。它也不会直接解决不连续的子序列、允许失配的近似匹配，或者与字典序和公共前缀无关的区间统计。
