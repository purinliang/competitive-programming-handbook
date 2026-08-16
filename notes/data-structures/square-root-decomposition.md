# 分块

> 最近修订：2026-08-17 07:50 +10:00（未审阅）

有一个长度为 $n$ 的数组，需要反复执行两种操作：

1. 给闭区间 `[l,r]` 中每个数加上 `delta`；
2. 询问闭区间 `[l,r]` 的元素和。

逐项修改或求和都需要 $O(n)$ 时间。线段树可以把两种操作都做到
$O(\log n)$，但如果我们希望使用更直接的数组结构，或后续操作很难合并成
线段树节点，可以先把数组分成若干个连续块。

分块的基本思想是：

> 区间两端不完整的零散部分逐项处理，中间的完整块一次处理。

它牺牲了一部分渐近复杂度，换来了简单、灵活且容易修改的结构。更重要的是，
“整块与零散部分分开”是莫队、根号分治和许多离线技巧的共同起点。

## 把数组分成连续块

选择块长 $B$。使用 1-based 下标时，位置 `i` 所属块号为：

$$
belong[i]=\left\lfloor\frac{i-1}{B}\right\rfloor+1.
$$

第 `block` 块的左右端点为：

```cpp
left[block] = (block - 1) * block_size + 1;
right[block] = min(n, block* block_size);
```

最后一块可能比其他块短。块数是：

$$
\left\lceil\frac{n}{B}\right\rceil.
$$

对每块保存：

- `sum[block]`：该块所有元素的真实总和；
- `lazy[block]`：尚未逐项写回块内元素的整块加值。

数组 `value[i]` 保存不包含 `lazy[belong[i]]` 的基础值。因此位置 `i`
的真实值是：

```cpp
value[i] + lazy[belong[i]]
```

## 整块修改

若修改区间完整覆盖一块，不需要遍历块内所有元素。只要：

```cpp
lazy[block] += delta;
sum[block] += delta * block_length(block);
```

块内每个元素都增加 `delta`，所以块和增加“元素数量乘修改量”。
`lazy` 让这次修改不必立即写进每个 `value[i]`。

这与线段树懒标记的思路相似：当修改完整覆盖一个已经维护统计信息的
结构单元时，先更新该单元的统计和统一标记。

## 零散修改

区间只覆盖一块的一部分时，不能修改整块 `lazy`，否则会影响区间外的
元素。对每个被覆盖的位置：

```cpp
value[i] += delta;
sum[belong[i]] += delta;
```

不需要先把 `lazy` 下放。`value[i]` 和这块的 `lazy` 分别保存局部修改与整块
修改，真实值仍然是两者之和。`sum` 保存真实总和，所以每个被修改元素都要
使它增加 `delta`。

## 修改一个任意区间

设 `l` 和 `r` 分别位于 `left_block` 和 `right_block`。

若两个端点在同一块，整个区间都是零散部分，直接遍历 `[l,r]`。

若端点分属不同块，拆成三部分：

1. 左端零散部分 `[l,right[left_block]]`；
2. 中间所有完整块；
3. 右端零散部分 `[left[right_block],r]`。

两端逐项修改，中间每块只更新一次 `lazy` 和 `sum`。

## 查询区间和

查询使用同样的三段拆分：

- 零散位置加上 `value[i] + lazy[belong[i]]`；
- 完整块直接加上 `sum[block]`。

`sum` 已经包含整块懒标记的影响，查询完整块时不能再额外加一次
`lazy * block_length`，否则会重复计算。

## 为什么块长取根号

一次操作最多遍历：

- 左右两个零散块，合计 $O(B)$ 个元素；
- 中间 $O(n/B)$ 个完整块。

因此时间复杂度为：

$$
O\left(B+\frac{n}{B}\right).
$$

块太短时，块数太多；块太长时，两端零散部分太长。当 $B$ 与 $n/B$
同阶时两部分取得平衡，所以选择：

$$
B\approx\sqrt n.
$$

每次操作的时间复杂度为 $O(\sqrt n)$，建立所有块需要 $O(n)$ 时间和
$O(n)$ 空间。

## 完整代码

下面的程序支持区间加和区间和。操作类型为 `1 l r delta` 时修改，为
`2 l r` 时输出查询结果。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct BlockArray {
    int n;
    int block_size;
    int block_count;
    vector<ll> value;
    vector<ll> sum;
    vector<ll> lazy;
    vector<int> belong;
    vector<int> left;
    vector<int> right;

    void init(const vector<ll>& initial, int length) {
        n = length;
        block_size = max(1, (int)sqrt(n));
        block_count = (n + block_size - 1) / block_size;

        value.assign(n + 5, 0);
        sum.assign(block_count + 5, 0);
        lazy.assign(block_count + 5, 0);
        belong.assign(n + 5, 0);
        left.assign(block_count + 5, 0);
        right.assign(block_count + 5, 0);

        for (int block = 1; block <= block_count; block++) {
            left[block] = (block - 1) * block_size + 1;
            right[block] = min(n, block * block_size);

            for (int i = left[block]; i <= right[block]; i++) {
                belong[i] = block;
                value[i] = initial[i];
                sum[block] += value[i];
            }
        }
    }

    int block_length(int block) const {
        return right[block] - left[block] + 1;
    }

    void add_partial(int l, int r, ll delta) {
        int block = belong[l];
        for (int i = l; i <= r; i++) {
            value[i] += delta;
            sum[block] += delta;
        }
    }

    ll sum_partial(int l, int r) const {
        ll result = 0;
        for (int i = l; i <= r; i++) {
            result += value[i] + lazy[belong[i]];
        }
        return result;
    }

    void range_add(int l, int r, ll delta) {
        int left_block = belong[l];
        int right_block = belong[r];

        if (left_block == right_block) {
            add_partial(l, r, delta);
            return;
        }

        add_partial(l, right[left_block], delta);
        add_partial(left[right_block], r, delta);

        for (int block = left_block + 1; block < right_block; block++) {
            lazy[block] += delta;
            sum[block] += delta * block_length(block);
        }
    }

    ll range_sum(int l, int r) const {
        int left_block = belong[l];
        int right_block = belong[r];

        if (left_block == right_block) {
            return sum_partial(l, r);
        }

        ll result = 0;
        result += sum_partial(l, right[left_block]);
        result += sum_partial(left[right_block], r);

        for (int block = left_block + 1; block < right_block; block++) {
            result += sum[block];
        }

        return result;
    }
};

int n, q;
vector<ll> a;

void solve() {
    cin >> n >> q;

    a.assign(n + 5, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    BlockArray blocks;
    blocks.init(a, n);

    while (q--) {
        int type, l, r;
        cin >> type >> l >> r;

        if (type == 1) {
            ll delta;
            cin >> delta;
            blocks.range_add(l, r, delta);
        } else {
            cout << blocks.range_sum(l, r) << '\n';
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 分块不是固定模板

分块的价值不是背诵一份“区间加、区间和”代码，而是学会为具体问题回答：

1. 零散部分能否在 $O(B)$ 时间内直接处理？
2. 每个完整块应该保存什么统计或标记，才能在 $O(1)$ 或较小代价内处理？
3. 整块修改后，块统计和单点真实值如何保持一致？

例如，块内排序后可以回答一些计数询问，保存位集可以批量处理集合运算，
按值域分块则可以维护与排名有关的问题。这些变体只在有自然问题时单独学习，
不为了让基础模板“万能”而全部塞进本篇。

## 常见错误

- 使用 `i / block_size` 计算 1-based 块号，在块边界错一位；
- 假定最后一块长度也恰好等于 `block_size`；
- 整块修改只改 `lazy`，忘记同步真实块和 `sum`；
- 零散修改只改 `value[i]`，忘记更新所属块的 `sum`；
- 查询零散元素时忘记加上所属块的 `lazy`；
- 查询完整块时又对 `sum` 额外加一次懒标记的贡献；
- `l` 和 `r` 在同一块时仍拆成左右两段，导致重复修改或查询；
- 只记住块长是 $\sqrt n$，却说不清 $B+n/B$ 两部分怎样取得平衡。

## 需要记住什么

- 1-based 下标 `i` 的块号怎样计算？
- 一个任意区间如何拆成两端零散部分与中间完整块？
- `value`、`sum` 和 `lazy` 分别保存什么？怎样还原单个位置的真实值？
- 为什么整块加不需要立即修改块内每个元素？
- 为什么一次操作的复杂度是 $O(B+n/B)$？
- 块长为什么选择 $\sqrt n$ 附近？
