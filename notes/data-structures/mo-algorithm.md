# 莫队算法

> 最近修订：2026-08-17 08:08 +10:00（未审阅）

给定一个不会再修改的数组，需要回答许多个离线区间询问：

> 闭区间 `[l,r]` 中有多少个不同的数？

若每次建立一个集合并扫描整个区间，单次询问需要 $O(n)$ 时间。前缀和也不能
直接解决：同一个数可能在区间内出现许多次，却只能贡献一次答案。

但是，若已经知道 `[l,r]` 的答案，区间只移动一个端点时，答案很容易维护：

- 加入一个数后，它的出现次数从 0 变成 1，答案增加 1；
- 删除一个数后，它的出现次数从 1 变成 0，答案减少 1；
- 其他情况下，不同数字的数量不变。

莫队算法利用的正是这个性质。它不改变询问本身，只在允许离线处理时重新排列
询问顺序，让相邻询问的区间端点尽量少移动。

## 为什么输入顺序可能很慢

设当前维护的区间为 `[current_l,current_r]`。处理新询问 `[l,r]` 时，可以通过
四种单步操作移动到目标区间：

```cpp
add(--current_l);
add(++current_r);
remove(current_l++);
remove(current_r--);
```

每次移动只加入或删除一个位置，代价为 $O(1)$。

若仍按输入顺序回答，连续两个询问可能分别位于数组两端。两个指针会反复跨越
整个数组，总移动次数仍可能达到 $O(nq)$。因此，关键不是“怎样移动”，而是
“按照什么顺序移动”。

## 按左端点分块

选择块长 $B$，按照询问左端点所在块分类：

$$
block(l)=\left\lfloor\frac{l-1}{B}\right\rfloor+1.
$$

排序询问时：

1. 左端点所属块较小的询问在前；
2. 位于同一左端点块内时，按右端点排序。

于是，同一组询问中：

- 左端点始终停留在一个长度为 $B$ 的范围内；
- 右端点沿一个方向依次移动，不会在整个数组上来回跳跃。

左端点在全部 $q$ 个询问间最多贡献 $O(qB)$ 次移动。左端点共有约 $n/B$
个块，每个块内右端点最多走过整个数组，所以右端点最多贡献：

$$
O\left(\frac{n^2}{B}\right)
$$

次移动。取 $B\approx\sqrt n$，在常见的 $q=O(n)$ 情况下，总移动量为
$O((n+q)\sqrt n)$。询问排序还需要 $O(q\log q)$ 时间。

## 让右端点折返

若每个左端点块内都让 `r` 从小到大，处理完一块以后，`r` 可能要从数组末端
重新回到开头。可以使用奇偶块排序：

- 奇数块按 `r` 从小到大；
- 偶数块按 `r` 从大到小。

右端点于是像蛇一样往返，而不是每块结束后重新走回起点。这不会改变渐近
复杂度，却通常能减少实际移动次数。

```cpp
bool query_less(const Query& a, const Query& b) {
    if (a.block != b.block) {
        return a.block < b.block;
    }
    if (a.block % 2 == 1) {
        return a.r < b.r;
    }
    return a.r > b.r;
}
```

## 用出现次数维护答案

定义：

- `frequency[x]`：数值 `x` 在当前区间内出现多少次；
- `distinct_count`：当前区间内出现次数大于 0 的数值数量。

加入位置 `position` 时：

```cpp
int x = a[position];
if (frequency[x] == 0) {
    distinct_count++;
}
frequency[x]++;
```

删除位置时必须先减少出现次数，再判断它是否变成 0：

```cpp
int x = a[position];
frequency[x]--;
if (frequency[x] == 0) {
    distinct_count--;
}
```

这里维护的不是某个固定模板，而是当前区间的统计状态。若换成其他问题，只要
“加入一个位置”和“删除一个位置”都能快速更新答案，莫队的区间移动框架就
仍然可用。

## 先离散化数值

数组元素可能是很大的整数或负数，不能直接作为 `frequency` 的下标。先复制
所有元素，排序并去重，再把每个值替换为它在有序值表中的编号。

离散化只保留相等关系和相对顺序。本文只关心两个数是否相等，所以替换编号
不会改变任何询问答案。

## 回到原询问顺序

莫队会打乱询问。读入第 `id` 个询问时保存它的原编号：

```cpp
queries.push_back({l, r, id, block});
```

处理完排序后的询问，将答案写入 `answer[id]`。最后按照 `id=1..q` 输出，
就恢复了输入要求的顺序。

## 完整代码

下面的程序回答每个区间中不同数字的数量。数组和询问都使用 1-based 下标，
区间是闭区间。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
    int l;
    int r;
    int id;
    int block;
};

int n, q;
int block_size;
int current_l = 1;
int current_r = 0;
int distinct_count = 0;
vector<int> a;
vector<int> frequency;
vector<int> answer;
vector<Query> queries;

bool query_less(const Query& a, const Query& b) {
    if (a.block != b.block) {
        return a.block < b.block;
    }
    if (a.block % 2 == 1) {
        return a.r < b.r;
    }
    return a.r > b.r;
}

void add(int position) {
    int x = a[position];
    if (frequency[x] == 0) {
        distinct_count++;
    }
    frequency[x]++;
}

void remove(int position) {
    int x = a[position];
    frequency[x]--;
    if (frequency[x] == 0) {
        distinct_count--;
    }
}

void compress_values() {
    vector<int> values;
    values.reserve(n);

    for (int i = 1; i <= n; i++) {
        values.push_back(a[i]);
    }

    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());

    for (int i = 1; i <= n; i++) {
        a[i] = lower_bound(values.begin(), values.end(), a[i]) -
               values.begin() + 1;
    }

    frequency.assign((int)values.size() + 5, 0);
}

void solve() {
    cin >> n >> q;

    a.assign(n + 5, 0);
    answer.assign(q + 5, 0);
    queries.clear();
    queries.reserve(q);

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    compress_values();
    block_size = max(1, (int)sqrt(n));

    for (int id = 1; id <= q; id++) {
        int l, r;
        cin >> l >> r;
        int block = (l - 1) / block_size + 1;
        queries.push_back({l, r, id, block});
    }

    sort(queries.begin(), queries.end(), query_less);

    current_l = 1;
    current_r = 0;
    distinct_count = 0;

    for (const Query& query : queries) {
        while (current_l > query.l) {
            add(--current_l);
        }
        while (current_r < query.r) {
            add(++current_r);
        }
        while (current_l < query.l) {
            remove(current_l++);
        }
        while (current_r > query.r) {
            remove(current_r--);
        }
        answer[query.id] = distinct_count;
    }

    for (int id = 1; id <= q; id++) {
        cout << answer[id] << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 莫队算法适合什么问题

基础莫队适合同时满足以下条件的问题：

1. 数组不会修改；
2. 所有区间询问可以离线读取并重新排序；
3. 从当前区间加入或删除一个位置时，答案能较快更新；
4. $O((n+q)\sqrt n)$ 级别的时间能够通过。

它的优势是能维护许多无法直接使用前缀和合并的统计，例如不同数数量、某些
出现次数函数或满足特定频率条件的数值数量。

若问题可以在线使用 $O(\log n)$ 数据结构解决，或加入、删除一个元素本身就
很慢，莫队通常不是首选。带修改莫队、树上莫队等变体会增加额外维度或转换，
只有遇到自然对应的问题时再学习。

## 常见错误

- 忘记保存询问原编号，按莫队排序后的顺序输出；
- 当前区间为空时错误地设成 `[0,0]`，访问不存在的 `a[0]`；
- 加入元素时先增加频率再判断 `frequency[x] == 0`；
- 删除元素时在减少频率以前判断它是否等于 0；
- 数值很大或为负数时直接拿它作为频率数组下标；
- 只按左端点块排序，却没有在同块内继续按右端点排序；
- 把离线算法用于必须立即回答、后续输入依赖当前答案的问题；
- 只背排序方式，却没有先设计好 `add`、`remove` 和当前统计状态。

## 需要记住什么

- 莫队为什么要重新排列询问，而不是按输入顺序移动区间？
- 左端点分块以后，两个端点的总移动量为什么会降低？
- 奇偶块排序怎样减少右端点折返？
- 怎样用出现次数维护当前区间的不同数字数量？
- 为什么必须保存询问原编号？
- 一个新问题至少满足哪些条件，才适合考虑基础莫队？
