# 线段树：基础

> 状态：定稿

线段树维护的是一段序列上的区间信息。它的核心思想是：把一个区间递归拆成左右两半，每个节点维护自己负责区间的答案。

如果每次区间查询都从 `a[l]` 遍历到 `a[r]`，一次查询最慢需要 $O(n)$。线段树会预先保存许多段区间的答案，再用少量已经算好的区间拼出查询结果。

线段树不是某个固定代码，而是一套结构：

- 区间怎样拆。
- 每个节点维护什么信息。
- 两个子节点的信息怎样合并。
- 区间修改时怎样延迟下传。

## 适用问题

最经典的线段树支持：

- 单点修改，区间查询。
- 区间修改，区间查询。

常见维护信息：

- 区间和。
- 区间异或和。
- 区间最大值、最小值。
- 区间 gcd。
- 字符串哈希。
- 区间最大子段和。
- 区间某种状态转移矩阵。

线段树适合维护“区间答案可以由左右子区间答案合并出来”的信息。

例如区间和：

```text
sum[l, r] = sum[l, mid] + sum[mid + 1, r]
```

例如区间最大值：

```text
max[l, r] = max(max[l, mid], max[mid + 1, r])
```

例如区间异或和：

```text
xor[l, r] = xor[l, mid] ^ xor[mid + 1, r]
```

例如字符串多项式哈希。若每个节点维护区间长度 `len` 和正向哈希 `h`，一种常见合并方式是：

```text
h[l, r] = h[l, mid] * base^len[mid + 1, r] + h[mid + 1, r]
```

这说明线段树不只维护普通加法。只要区间信息能按固定顺序合并，就可以考虑线段树。

如果一个区间答案不能稳定地由左右子区间答案合并出来，线段树就不一定合适。

从代数角度看，线段树维护的信息通常需要满足结合律：

```text
(a op b) op c = a op (b op c)
```

如果查询时需要处理“空区间”，还需要一个恒等元，例如区间和的 `0`、区间异或和的 `0`、区间最大值的负无穷、区间 gcd 的 `0`、字符串哈希的空串哈希。也就是说，线段树通常维护的是一个幺半群，而不是必须维护群；它不要求每个元素都有逆元。

这点和树状数组的常见用法不同：树状数组常通过“前缀答案相减”得到区间答案，因此如果要支持任意区间查询，通常需要逆元。区间和可以做，因为加法有逆元；区间最大值就不能用普通树状数组这样做，因为 `max` 没有逆元。

## 区间拆分

根节点维护整个区间 `[1, n]`。

对节点 `[l, r]`：

```text
mid = (l + r) / 2
左儿子：[l, mid]
右儿子：[mid + 1, r]
```

直到 `l == r`，这个节点就是叶子，表示一个位置。

每向下一层，区间长度大约减半。长度为 `n` 的区间，连续减半到 1，大约需要 $\log_2 n$ 次，所以线段树高度是 $O(\log n)$。

一次单点修改只沿着根到某个叶子的一条链走下去，再沿原路 `pull` 回来，因此复杂度是 $O(\log n)$。

一次区间查询最多在每一层拆出少量相关节点。直观理解是：查询区间的左右边界各自沿树向下分裂，中间被完整覆盖的区间直接返回，所以总访问节点数是 $O(\log n)$ 级别。

### 手算一棵小树

下图中，每个实线长方形就是一个线段树节点，节点宽度等于它覆盖的原数组区间长度。底部虚线格是原数组，虚线投影表明叶节点与原数组位置的对应关系。

![线段树节点覆盖的区间](../assets/data-structures/segment-tree.svg)

设数组下标范围是 `[1, 8]`。线段树只看区间时，结构如下：

```text
                         [1, 8]
                 /                  \
             [1, 4]                [5, 8]
           /        \            /        \
       [1, 2]      [3, 4]      [5, 6]      [7, 8]
       /   \        /   \       /   \       /   \
    [1,1] [2,2]  [3,3] [4,4] [5,5] [6,6] [7,7] [8,8]
```

查询 `[2, 7]` 时：

1. `[1, 8]` 没有被完整覆盖，继续访问左右儿子。
2. `[1, 4]` 只有一部分在查询区间内，拆成 `[2, 2]` 和 `[3, 4]`。
3. `[5, 8]` 也只有一部分在查询区间内，拆成 `[5, 6]` 和 `[7, 7]`。
4. `[3, 4]`、`[5, 6]` 这类已经被查询区间完整覆盖的节点直接返回，不再访问叶子。

最终查询区间被拆成：

```text
[2, 2] + [3, 4] + [5, 6] + [7, 7]
```

这里的加号表示“合并节点信息”。维护区间和时是真的加法；维护最大值时应改成 `max`。线段树查询快的关键正是：遇到完整覆盖的节点就直接使用已经维护好的答案。

### 函数参数分别表示什么

递归线段树里经常同时出现两组区间：

```cpp
query (u, l, r, ql, qr)
```

- `u, l, r`：当前访问的节点，以及这个节点负责的区间 `[l, r]`。
- `ql, qr`：本次查询目标 `[ql, qr]`，递归过程中通常保持不变。

初学时最容易把两组边界混在一起。可以始终问两个问题：

1. 当前节点 `[l, r]` 是否已经被目标 `[ql, qr]` 完整覆盖？
2. 目标区间是否碰到左儿子或右儿子？

对应代码就是：

```cpp
if (ql <= l && r <= qr) {
    return tree[u];
}

if (ql <= mid) {
    // 目标区间碰到左儿子 [l, mid]
}
if (qr > mid) {
    // 目标区间碰到右儿子 [mid + 1, r]
}
```

## 数组存树

竞赛中常用数组模拟一棵按完全二叉树方式编号的树：

```text
节点 u 的左儿子：u * 2
节点 u 的右儿子：u * 2 + 1
```

直接写乘法和加法即可。编译器会自行完成等价的底层优化，手写位运算不会带来实用的性能优势。

如果题目保证 `n <= 100000`，竞赛代码里常先把全局容量常量留出少量余量，再让线段树数组开到它的 4 倍：

```cpp
const int MAXN = 1e5 + 5;

ll a[MAXN];
ll tree[4 * MAXN];
```

本文约定 `MAXN` 表示“已经留过余量的数组容量”，不是题目中 `n` 的理论最大值本身。`+5` 没有特殊的数学含义；对于只访问 `a[1]` 到 `a[n]` 的程序，理论上多留一个位置就够了。保留 5 个位置是中英文竞赛代码中都很常见的模板习惯，可以顺便容纳少量哨兵或边界位置，而且额外空间可以忽略。

这里有两个不同的问题：

- 递归线段树实际创建多少个有效节点。
- 用 `u * 2`、`u * 2 + 1` 编号时，数组下标最大可能到哪里。

如果每个叶子对应原序列的一个位置，那么有效叶子数是 `n`。一棵每个内部节点都有两个儿子的二叉树满足：

```text
内部节点数 = 叶子数 - 1
总节点数 = 2 * 叶子数 - 1
```

所以递归线段树的有效节点数是：

```text
2 * n - 1
```

但数组存树使用的是完全二叉树编号。若 `n` 不是 2 的幂，这种编号中间会出现空洞；最大下标可能明显大于有效节点数。

设树高为 $h = \lceil \log_2 n \rceil$。使用完全二叉树编号时，深度不超过 `h` 的节点编号小于：

```text
2^(h + 1)
```

又因为：

```text
2^h < 2n
```

所以：

```text
最大节点编号 < 2^(h + 1) < 4n
```

这就是常见数组开 `4 * n` 的原因。它不是精确节点数，而是对完全二叉树编号方式足够安全的上界。

因为本文的 `MAXN` 已经略大于题目允许的最大元素个数，所以：

```cpp
ll a[MAXN];
ll tree[4 * MAXN];
```

普通数组可以直接使用 1-based 下标 `a[1]` 到 `a[n]`；线段树数组已经声明了下标 `0` 到 `4 * MAXN - 1`，而有效节点编号严格小于 `4 * n`。余量统一放在 `MAXN` 里以后，不需要在每个数组声明后重复写 `+1` 或 `+5`。

例如题目上界为 $2 \times 10^6$ 时，可以写成：

```cpp
const int MAXN = 2e6 + 5;
```

这里的 `+5` 是统一的容量约定；线段树需要乘 `4` 才是数据结构本身的空间上界。

### 统一命名约定

本文使用一套不绑定具体聚合和修改类型的名字：

| 名字 | 含义 |
| ---- | ---- |
| `tree[u]` | 节点 `u` 当前维护的聚合信息 |
| `lazy[u]` | 节点 `u` 尚未下传的修改 |
| `pull(u)` | 从两个儿子重新计算当前节点 |
| `push(u, l, r)` | 把当前节点的待处理修改下传给儿子 |
| `apply(...)` | 把一次修改作用到一个完整节点 |
| `update(...)` | 修改目标区间或位置 |
| `query(...)` | 查询目标区间 |

基础区间和代码里，`tree[u]` 存的是节点区间和；改成区间最大值时，数组名和接口名不必变化，只需要改变合并规则和单位元。

如果每个节点同时维护多种信息，可以把 `tree` 的元素类型改成结构体：

```cpp
struct Node {
    ll sum;
    ll mx;
};

Node tree[4 * MAXN];
```

对于只含一种修改的基础模板，`lazy` 统一保存“操作是否存在”和操作参数：

```cpp
pair<bool, ll> lazy[4 * MAXN];
```

`lazy[u].first` 表示是否存在待下传操作，`lazy[u].second` 表示操作参数。区间加、区间乘和区间赋值都可以采用这个外层形式，只需要改变 `apply` 中的具体组合规则。

## pull

`pull` 用左右儿子重新计算当前节点。从当前节点的视角看，它在主动拉取两个儿子的信息。它只负责合并，不下传懒标记，也不访问原数组。

维护区间和：

```cpp
void pull (int u) {
    tree[u] = tree[u * 2] + tree[u * 2 + 1];
}
```

维护区间最大值：

```cpp
void pull (int u) {
    tree[u] = max (tree[u * 2], tree[u * 2 + 1]);
}
```

线段树模板里最重要的问题之一就是：你到底在每个节点维护什么，两个儿子怎样合并。

## build

建树把原数组信息放到叶子，再一路 `pull`。

```cpp
void build (int u, int l, int r) {
    if (l == r) {
        tree[u] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build (u * 2, l, mid);
    build (u * 2 + 1, mid + 1, r);
    pull (u);
}
```

调用：

```cpp
build (1, 1, n);
```

## 单点修改

以下代码默认已经有 `typedef long long ll;`。

把位置 `pos` 改成 `val`：

```cpp
void update (int u, int l, int r, int pos, ll val) {
    if (l == r) {
        tree[u] = val;
        return;
    }
    int mid = (l + r) / 2;
    if (pos <= mid) {
        update (u * 2, l, mid, pos, val);
    } else {
        update (u * 2 + 1, mid + 1, r, pos, val);
    }
    pull (u);
}
```

如果是单点加 `val`，叶子处写：

```cpp
tree[u] += val;
```

## 区间查询

查询 `[ql, qr]` 的区间和：

```cpp
ll query (int u, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return tree[u];
    }
    int mid = (l + r) / 2;
    ll res = 0;
    if (ql <= mid) {
        res += query (u * 2, l, mid, ql, qr);
    }
    if (qr > mid) {
        res += query (u * 2 + 1, mid + 1, r, ql, qr);
    }
    return res;
}
```

这里的 `res = 0` 是区间和的单位元。如果维护最大值，单位元不能随便写 0，而应写成足够小的数。本文代码约定：局部累计变量优先叫 `res`，`ans` 留给 `solve` 里真正要输出的最终答案。

## 完整单点修改、区间和代码

第一次写线段树，建议先掌握这个不带懒标记的版本。下面的接口约定：

- 操作 `1 pos val`：把 `a[pos]` 增加 `val`。
- 操作 `2 l r`：输出区间 `[l, r]` 的和。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 1e5 + 5;

int n, q;
ll a[MAXN];
ll tree[4 * MAXN];

void pull (int u) {
    tree[u] = tree[u * 2] + tree[u * 2 + 1];
}

void build (int u, int l, int r) {
    if (l == r) {
        tree[u] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build (u * 2, l, mid);
    build (u * 2 + 1, mid + 1, r);
    pull (u);
}

void update (int u, int l, int r, int pos, ll val) {
    if (l == r) {
        tree[u] += val;
        return;
    }
    int mid = (l + r) / 2;
    if (pos <= mid) {
        update (u * 2, l, mid, pos, val);
    } else {
        update (u * 2 + 1, mid + 1, r, pos, val);
    }
    pull (u);
}

ll query (int u, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return tree[u];
    }
    int mid = (l + r) / 2;
    ll res = 0;
    if (ql <= mid) {
        res += query (u * 2, l, mid, ql, qr);
    }
    if (qr > mid) {
        res += query (u * 2 + 1, mid + 1, r, ql, qr);
    }
    return res;
}

int main () {
    scanf ("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) {
        scanf ("%lld", &a[i]);
    }
    build (1, 1, n);

    while (q--) {
        int op;
        scanf ("%d", &op);
        if (op == 1) {
            int pos;
            ll val;
            scanf ("%d%lld", &pos, &val);
            update (1, 1, n, pos, val);
        } else {
            int l, r;
            scanf ("%d%d", &l, &r);
            printf ("%lld\n", query (1, 1, n, l, r));
        }
    }
    return 0;
}
```

这个版本只需要记住三件事：

1. `build`：先建立两个儿子，再 `pull`。
2. `update`：只进入包含 `pos` 的一个儿子，回来时 `pull`。
3. `query`：目标碰到哪个儿子就查询哪个儿子，完整覆盖时直接返回。

把这三部分写稳之后，再学习懒标记。否则同时处理“节点区间、查询区间、修改区间、待下传标记”，很难判断错误究竟来自哪一层。

## 懒标记

区间修改不能每次都改到所有叶子，否则一次修改可能是 $O(n)$。

懒标记的思想是：当一个节点负责的区间被整体修改时，先只修改这个节点的信息，并记录“这个修改还没有下传给儿子”。等以后真的访问儿子时，再把标记传下去。

区间加、区间和的典型信息：

```cpp
ll tree[4 * MAXN];
pair<bool, ll> lazy[4 * MAXN];
```

基础模板中的 `tree[u]` 是节点区间和。`lazy[u].first` 表示是否有尚未下传的加法，`lazy[u].second` 表示要加多少。`tree` 和 `lazy` 描述它们在线段树中的职责，不把名字绑定到某一种聚合或修改。

显式保存 `first` 后，代码不再借用加法单位元 `0` 或乘法单位元 `1` 表示“无标记”。参数可以正常取到这些值，标记是否存在只由布尔值决定。

区间乘法也存在，常见于取模意义下的“区间乘、区间加、区间和”。它需要维护乘法标记和加法标记的组合顺序，复杂度和细节都比基础懒标记更高，不放在第一份基础模板里。

如果把修改操作换成区间赋值，存储形式不需要改变：

```cpp
pair<bool, ll> lazy[4 * MAXN];
```

此时 `lazy[u].first` 仍表示标记是否存在，`lazy[u].second` 改为表示赋值内容。

多个懒标记的覆盖关系和下传顺序见 [线段树：懒标记的组合顺序](segment-tree-lazy-tags.md)。

对节点 `[l, r]` 整体加 `val`：

```cpp
void apply (int u, int l, int r, ll val) {
    tree[u] += val * (r - l + 1);
    lazy[u].first = true;
    lazy[u].second += val;
}
```

下传懒标记：

```cpp
void push (int u, int l, int r) {
    if (!lazy[u].first) {
        return;
    }
    int mid = (l + r) / 2;
    apply (u * 2, l, mid, lazy[u].second);
    apply (u * 2 + 1, mid + 1, r, lazy[u].second);
    lazy[u] = {false, 0};
}
```

区间加：

```cpp
void update (int u, int l, int r, int ql, int qr, ll val) {
    if (ql <= l && r <= qr) {
        apply (u, l, r, val);
        return;
    }
    push (u, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) {
        update (u * 2, l, mid, ql, qr, val);
    }
    if (qr > mid) {
        update (u * 2 + 1, mid + 1, r, ql, qr, val);
    }
    pull (u);
}
```

带懒标记的区间查询：

```cpp
ll query (int u, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return tree[u];
    }
    push (u, l, r);
    int mid = (l + r) / 2;
    ll res = 0;
    if (ql <= mid) {
        res += query (u * 2, l, mid, ql, qr);
    }
    if (qr > mid) {
        res += query (u * 2 + 1, mid + 1, r, ql, qr);
    }
    return res;
}
```

## 完整区间加、区间和代码

下面的接口约定：

- 操作 `1 l r val`：把 `[l, r]` 中的每个数都增加 `val`。
- 操作 `2 l r`：输出区间 `[l, r]` 的和。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 2e5 + 5;

int n, q;
ll a[MAXN];
ll tree[4 * MAXN];
pair<bool, ll> lazy[4 * MAXN];

void pull (int u) {
    tree[u] = tree[u * 2] + tree[u * 2 + 1];
}

void apply (int u, int l, int r, ll val) {
    tree[u] += val * (r - l + 1);
    lazy[u].first = true;
    lazy[u].second += val;
}

void push (int u, int l, int r) {
    if (!lazy[u].first) {
        return;
    }
    int mid = (l + r) / 2;
    apply (u * 2, l, mid, lazy[u].second);
    apply (u * 2 + 1, mid + 1, r, lazy[u].second);
    lazy[u] = {false, 0};
}

void build (int u, int l, int r) {
    lazy[u] = {false, 0};
    if (l == r) {
        tree[u] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build (u * 2, l, mid);
    build (u * 2 + 1, mid + 1, r);
    pull (u);
}

void update (int u, int l, int r, int ql, int qr, ll val) {
    if (ql <= l && r <= qr) {
        apply (u, l, r, val);
        return;
    }
    push (u, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) {
        update (u * 2, l, mid, ql, qr, val);
    }
    if (qr > mid) {
        update (u * 2 + 1, mid + 1, r, ql, qr, val);
    }
    pull (u);
}

ll query (int u, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return tree[u];
    }
    push (u, l, r);
    int mid = (l + r) / 2;
    ll res = 0;
    if (ql <= mid) {
        res += query (u * 2, l, mid, ql, qr);
    }
    if (qr > mid) {
        res += query (u * 2 + 1, mid + 1, r, ql, qr);
    }
    return res;
}

int main () {
    scanf ("%d%d", &n, &q);
    for (int i = 1; i <= n; i++) {
        scanf ("%lld", &a[i]);
    }
    build (1, 1, n);

    while (q--) {
        int op;
        scanf ("%d", &op);
        if (op == 1) {
            int l, r;
            ll val;
            scanf ("%d%d%lld", &l, &r, &val);
            update (1, 1, n, l, r, val);
        } else {
            int l, r;
            scanf ("%d%d", &l, &r);
            printf ("%lld\n", query (1, 1, n, l, r));
        }
    }
    return 0;
}
```

## 复杂度

- `build` 访问线段树的每个有效节点一次，时间复杂度是 $O(n)$。
- 单点增加只经过一条从根到叶子的链，时间复杂度是 $O(\log n)$。
- 一次区间查询或带懒标记的区间增加，时间复杂度是 $O(\log n)$。
- 有效节点数是 $O(n)$，本文使用 `4 * MAXN` 的数组保证编号空间足够，空间复杂度是 $O(n)$。

## 不变量

写线段树时要盯住这些不变量：

- `tree[u]` 永远表示节点 `u` 当前区间 `[l, r]` 的区间和。
- 如果没有懒标记，父节点信息应该等于两个儿子信息合并。
- 如果有懒标记，`tree[u]` 已经反映这个节点区间的真实答案，但儿子可能还没更新。
- 每次访问儿子前，如果存在可能影响儿子的懒标记，就先 `push`。
- 每次修改儿子后，都要 `pull` 更新当前节点。

## 常见错误

- 数组没有开到 `4 * n`。
- `mid` 之后左右区间写错，导致死递归。
- 查询右半边条件写成 `qr >= mid`，正确通常是 `qr > mid`。
- 区间修改后忘记 `pull`。
- 访问儿子前忘记 `push`。
- 懒标记只改了 `lazy[u]`，没有同步改 `tree[u]`。
- 维护最大值时，把查询初值错误地写成 0。
- `val * (r - l + 1)` 没用 `ll`，导致溢出。

## 什么时候不该用线段树

- 只有静态区间和查询：前缀和更简单。
- 只有单点修改和前缀/区间和：树状数组更短。
- 需要维护的是全局有序集合：可能是平衡树、堆、set。
- 需要复杂历史版本：可能是主席树。
- 需要区间取 min/max 后继续修改：可能需要线段树 beats，普通懒标记不够。

## 扩展阅读

本文只要求掌握区间和的基础版本。如果题目同时出现加法、乘法或赋值等多种修改，再阅读 [线段树：懒标记的组合顺序](segment-tree-lazy-tags.md)。

其他常见变体包括：

- 区间加，区间最大值。
- 区间赋值，区间和。
- 区间加和区间赋值同时存在。
- 区间异或和。
- 字符串哈希，支持单点修改和区间哈希查询。
- 动态开点线段树。
- 权值线段树。
- 主席树。
- 线段树合并。
- 线段树分裂。
- 线段树优化建图。
- 线段树二分。
- 线段树 beats。

这些不应该一次塞进基础模板。基础线段树先保证常见形态清晰，变体单独成文。

## 调试方法

小数据手算一组：

```text
a = [1, 2, 3, 4, 5]
update(2, 4, 10)
query(1, 5) = 45
query(2, 3) = 25
```

如果结果错误，按顺序查：

1. 建树叶子是否正确。
2. `pull` 合并是否正确。
3. 区间完全覆盖条件是否正确。
4. 左右递归条件是否正确。
5. `apply` 是否同时更新 `tree` 和 `lazy`。
6. `push` 是否清空当前懒标记。
7. 是否所有可能进入儿子的地方都先下传。

## 练习题

将完整的区间加、区间和代码提交到 [洛谷 P3372【模板】线段树 1](https://www.luogu.com.cn/problem/P3372)。这道题的两种操作与本文完整代码的接口直接对应。

## 需要记住什么

1. 线段树的一个节点负责什么，左右儿子的区间怎样由 `[l, r]` 得到？
2. `build`、`pull`、`update` 和 `query` 各自负责哪一步？
3. 区间查询中，什么时候可以直接返回 `tree[u]`，什么时候要继续进入儿子？
4. 为什么递归线段树通常将数组开到 `4 * MAXN`？
5. 懒标记存在时，`tree[u]` 和它的两个儿子分别已经包含了哪些修改？
6. `apply`、`push` 和 `pull` 的调用顺序为什么不能随意交换？

幺半群、字符串哈希、复杂懒标记与各种高级变体只需知道它们说明了线段树的扩展能力，学习基础版本时不要求理解或记忆。

## 下一篇

[树状数组：基础](fenwick-tree.md) 会用更短的代码处理“单点增加、前缀和与区间和”，并解释 `lowbit` 怎样决定每次跳转的位置。
