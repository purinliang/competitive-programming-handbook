# 并查集：带权

> 最近修订：2026-08-17 05:51 +10:00（未审阅）

普通并查集只能回答两个元素是否连通。若题目不断给出：

$$
value[v]-value[u]=w,
$$

我们还希望在连通时求出两个元素的差值，并判断新约束是否与旧约束矛盾。

带权并查集在每条父子关系上额外保存一个可累加的差值。路径压缩时不仅修改父
节点，也把沿途差值合并到代表元。

## 权值表示什么

设：

```cpp
dist[u] = value[u] - value[parent[u]];
```

这不是图上的边长，而是节点 `u` 与并查集父节点之间的关系。

若父节点链为：

```text
u -> p -> root
```

那么：

$$
value[u]-value[root]
=(value[u]-value[p])+(value[p]-value[root]).
$$

也就是：

```text
u 到根的差值 = dist[u] + dist[p]
```

根的父节点是自己，因此：

```cpp
parent[root] = root;
dist[root] = 0;
```

各个 `value[u]` 的绝对值不需要已知。只要同一集合内的差值彼此一致，就能回答
任意两点的相对关系。

## 带权路径压缩

普通路径压缩直接让 `u` 指向代表元。带权版本必须先保存原父节点：

```cpp
int original_parent = parent[u];
parent[u] = find(parent[u]);
dist[u] += dist[original_parent];
```

递归返回以后，`dist[original_parent]` 已经表示：

$$
value[original\_parent]-value[root].
$$

原来的 `dist[u]` 表示：

$$
value[u]-value[original\_parent].
$$

二者相加后，新的 `dist[u]` 正好表示 `value[u]-value[root]`，与压缩后的
父节点关系一致。

完整查找：

```cpp
int find(int u) {
    if (parent[u] == u) {
        return u;
    }

    int original_parent = parent[u];
    parent[u] = find(parent[u]);
    dist[u] += dist[original_parent];
    return parent[u];
}
```

若只压缩 `parent` 而不更新 `dist`，父节点改变后权值仍指向旧父节点，所有
差值都会失去意义。

## 合并一条差值约束

现在加入：

$$
value[v]-value[u]=w.
$$

先查找两点代表元：

```cpp
int root_u = find(u);
int root_v = find(v);
```

查找以后：

$$
dist[u]=value[u]-value[root_u],
$$

$$
dist[v]=value[v]-value[root_v].
$$

把它们代入新约束：

$$
(value[root_v]+dist[v])
-(value[root_u]+dist[u])=w.
$$

整理：

$$
value[root_v]-value[root_u]
=w+dist[u]-dist[v].
$$

令：

```cpp
ll delta = w + dist[u] - dist[v];
```

`delta` 就是“`root_v` 相对 `root_u` 的差值”。

## 合并方向

若让 `root_v` 指向 `root_u`：

```cpp
parent[root_v] = root_u;
dist[root_v] = delta;
```

因为此时 `dist[root_v]` 按定义应等于：

$$
value[root_v]-value[root_u].
$$

若按大小合并需要反过来，让 `root_u` 指向 `root_v`，方向也随之反转：

```cpp
parent[root_u] = root_v;
dist[root_u] = -delta;
```

带权并查集不能先随意交换两个根，再继续使用原公式。改变挂接方向时，关系值
必须同时取反。

## 检查矛盾

若 `u` 与 `v` 已经属于同一集合，不能再次合并。旧关系已经确定：

$$
value[v]-value[u]=dist[v]-dist[u].
$$

因此新约束合法当且仅当：

```cpp
dist[v] - dist[u] == w
```

若不相等，新约束与此前信息矛盾，应当返回失败并保持结构不变。

## 查询两点差值

若两点代表元不同，它们之间尚无关系，答案未知。若代表元相同：

$$
value[v]-value[u]
=(value[v]-value[root])
-(value[u]-value[root])
=dist[v]-dist[u].
$$

使用 `pair` 同时返回“是否已知”和差值：

```cpp
pair<bool, ll> difference(int u, int v) {
    if (find(u) != find(v)) {
        return {false, 0};
    }
    return {true, dist[v] - dist[u]};
}
```

未知时的 `0` 只是占位，调用方必须先检查 `bool`。

## 完整代码

操作：

```text
1 u v w  加入约束 value[v] - value[u] = w
2 u v    查询 value[v] - value[u]
```

新约束成功或与旧关系一致时输出 `Accepted`；矛盾时输出
`Contradiction`。不连通的查询输出 `Unknown`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct WeightedDSU {
    vector<int> parent;
    vector<int> component_size;
    vector<ll> dist;

    void init(int n) {
        parent.resize(n + 5);
        component_size.assign(n + 5, 1);
        dist.assign(n + 5, 0);

        for (int u = 1; u <= n; u++) {
            parent[u] = u;
        }
    }

    int find(int u) {
        if (parent[u] == u) {
            return u;
        }

        int original_parent = parent[u];
        parent[u] = find(parent[u]);
        dist[u] += dist[original_parent];
        return parent[u];
    }

    bool add_constraint(int u, int v, ll w) {
        int root_u = find(u);
        int root_v = find(v);

        if (root_u == root_v) {
            return dist[v] - dist[u] == w;
        }

        ll delta = w + dist[u] - dist[v];

        if (component_size[root_u] >=
            component_size[root_v]) {
            parent[root_v] = root_u;
            dist[root_v] = delta;
            component_size[root_u] +=
                component_size[root_v];
        } else {
            parent[root_u] = root_v;
            dist[root_u] = -delta;
            component_size[root_v] +=
                component_size[root_u];
        }
        return true;
    }

    pair<bool, ll> difference(int u, int v) {
        if (find(u) != find(v)) {
            return {false, 0};
        }
        return {true, dist[v] - dist[u]};
    }
};

void solve() {
    int n, q;
    cin >> n >> q;

    WeightedDSU dsu;
    dsu.init(n);

    while (q--) {
        int operation, u, v;
        cin >> operation >> u >> v;

        if (operation == 1) {
            ll w;
            cin >> w;

            if (dsu.add_constraint(u, v, w)) {
                cout << "Accepted\n";
            } else {
                cout << "Contradiction\n";
            }
        } else {
            auto [known, value] = dsu.difference(u, v);

            if (known) {
                cout << value << '\n';
            } else {
                cout << "Unknown\n";
            }
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

## 复杂度

路径压缩与按大小合并仍然成立。每次操作进行常数次查找：

- 单次均摊时间复杂度：$O(\alpha(n))$；
- 空间复杂度：$O(n)$。

权值使用 64 位整数，题目必须保证任意可推导差值不会超出其范围。

## 常见错误

- 没有明确 `dist[u]` 到底表示 `u-parent[u]` 还是相反方向；
- 路径压缩只更新父节点，没有累加权值；
- 推导合并公式时把 `u,v` 或两个根的方向写反；
- 按大小交换挂接方向后忘记给 `delta` 取反；
- 两点已经同集合时仍强制合并，没有检查矛盾；
- 查询差值写成 `dist[u]-dist[v]`，与题目要求方向相反；
- 用某个特殊数值表示未知，与合法差值发生冲突。

## 需要记住什么

- `dist[u]` 的精确定义是什么？
- 为什么路径压缩时要先保存原父节点？
- 怎样从 `value[v]-value[u]=w` 推导两个根的差值？
- 反转合并方向时为什么必须给关系取反？
- 同一集合内怎样查询差值并判断新约束是否矛盾？

