# 并查集：扩展域

> 最近修订：2026-08-17 11:24 +10:00（未审阅）

[并查集](disjoint-set-union.md) 只能维护“两个元素是否属于同一集合”。
有些题目给出的却是互斥关系：

- `u` 与 `v` 属于同一阵营；
- `u` 与 `v` 属于不同阵营；
- 新关系是否与此前信息矛盾。

普通并查集可以合并“相同”，却不能直接把“不同”保存为一条集合关系。扩展域
并查集为每个对象建立多个关系域，把“不同”也转换成普通集合合并。

## 两个关系域

假设每个人只能属于两个互斥阵营。为原对象 `u` 建立两个编号：

```text
u       表示 u 所在的阵营
u + n   表示与 u 相反的阵营
```

总共使用 `1..2n` 个并查集元素。

这不是创造了两个人，而是在维护两个命题位置。若 `u` 与 `v+n` 同集合，表示
`u` 与 `v` 处在相反阵营。

对任意 `u`，`u` 和 `u+n` 必须保持互斥，不能被合并到同一集合。

## 加入同阵营关系

若 `u` 与 `v` 同阵营，则它们的相反阵营也相同：

```text
u      与 v      合并
u + n  与 v + n  合并
```

代码：

```cpp
dsu.merge(u, v);
dsu.merge(u + n, v + n);
```

加入以前，如果已经知道 `u` 与 `v` 相反，也就是：

```cpp
dsu.same(u, v + n)
```

那么这条新信息发生矛盾，不能修改并查集。

## 加入不同阵营关系

若 `u` 与 `v` 不同阵营，则：

```text
u      与 v + n  合并
u + n  与 v      合并
```

代码：

```cpp
dsu.merge(u, v + n);
dsu.merge(u + n, v);
```

加入以前，如果 `u` 与 `v` 已经在同一集合，新关系就是矛盾：

```cpp
dsu.same(u, v)
```

两次合并缺一不可。只连接 `u` 与 `v+n`，没有同步连接另一对关系域，后续推理
就可能丢失对称信息。

## 关系怎样传递

假设已知：

```text
1 与 2 不同
2 与 3 不同
```

第一条关系合并：

```text
1 ~ 2+n
1+n ~ 2
```

第二条关系合并：

```text
2 ~ 3+n
2+n ~ 3
```

于是通过并查集传递得到：

```text
1 ~ 3
```

即两次“相反”得到“相同”。推理不需要额外编写规则，而是由扩展编号之间的普通
连通关系自动完成。

## 判断三种状态

询问 `u` 与 `v`：

```cpp
if (dsu.same(u, v)) {
    // 同阵营
} else if (dsu.same(u, v + n)) {
    // 不同阵营
} else {
    // 关系尚不确定
}
```

“不在同一集合”不等于“已知不同”。若两人的关系从未被信息链连接，两种可能都
还存在，答案应是未知。

## 推广到多个关系域

若关系构成 $k$ 种循环状态，可以为每个对象建立 $k$ 个编号：

$$
id(u,t)=u+tn,\qquad 0\le t<k.
$$

每条关系会同时合并 $k$ 对对应域。经典食物链问题使用三种循环关系。核心仍是：

1. 先准确规定每一层代表什么相对关系；
2. 把题目关系翻译成各层之间的对应合并；
3. 合并前检查会被迫落入同一集合的互斥命题。

层数增加时最容易出错的不是并查集，而是关系编号的语义。必须先写出关系表，再
写偏移公式。

## 完整代码

下面处理两个阵营的关系。操作：

```text
1 u v  声明 u 与 v 同阵营
2 u v  声明 u 与 v 不同阵营
3 u v  查询关系：Same、Different 或 Unknown
```

矛盾声明输出 `Contradiction` 并忽略；成功加入输出 `Accepted`。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent;
    vector<int> component_size;

    void init(int n) {
        parent.assign(n + 5, 0);
        component_size.assign(n + 5, 1);

        for (int u = 1; u <= n; u++) {
            parent[u] = u;
        }
    }

    int find(int u) {
        if (parent[u] == u) {
            return u;
        }
        return parent[u] = find(parent[u]);
    }

    bool same(int u, int v) {
        return find(u) == find(v);
    }

    void merge(int u, int v) {
        u = find(u);
        v = find(v);

        if (u == v) {
            return;
        }
        if (component_size[u] < component_size[v]) {
            swap(u, v);
        }

        parent[v] = u;
        component_size[u] += component_size[v];
    }
};

int n, q;
DSU dsu;

bool add_same(int u, int v) {
    if (dsu.same(u, v + n)) {
        return false;
    }

    dsu.merge(u, v);
    dsu.merge(u + n, v + n);
    return true;
}

bool add_different(int u, int v) {
    if (dsu.same(u, v)) {
        return false;
    }

    dsu.merge(u, v + n);
    dsu.merge(u + n, v);
    return true;
}

void print_relation(int u, int v) {
    if (dsu.same(u, v)) {
        cout << "Same\n";
    } else if (dsu.same(u, v + n)) {
        cout << "Different\n";
    } else {
        cout << "Unknown\n";
    }
}

void solve() {
    cin >> n >> q;
    dsu.init(2 * n);

    while (q--) {
        int operation, u, v;
        cin >> operation >> u >> v;

        if (operation == 1) {
            if (add_same(u, v)) {
                cout << "Accepted\n";
            } else {
                cout << "Contradiction\n";
            }
        } else if (operation == 2) {
            if (add_different(u, v)) {
                cout << "Accepted\n";
            } else {
                cout << "Contradiction\n";
            }
        } else {
            print_relation(u, v);
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

扩展为 `2n` 个元素只增加常数倍空间。每条声明或询问进行常数次并查集操作：

- 单次时间复杂度：均摊 $O(\alpha(n))$；
- 总空间复杂度：$O(n)$。

其中 $\alpha$ 是反阿克曼函数，在竞赛规模内可视为极小常数。

## 常见错误

- 把 `u+n` 理解成另一个真实人物，而不是相反关系域；
- 只合并一对关系，没有同步合并对称的另一对；
- 先执行部分合并，再发现矛盾，留下被污染的状态；
- 认为 `u` 与 `v` 不同集合就能确定二者相反；
- 查询相反关系时使用 `same(u+n, v+n)`，那实际仍表示同阵营；
- 推广到三域时没有先规定每层语义，凭感觉写偏移。

## 需要记住什么

- 为什么普通并查集不能直接表达“不同”？
- `u` 与 `u+n` 分别代表什么？
- 同阵营与不同阵营各需要合并哪两对编号？
- 为什么矛盾检查必须发生在任何合并之前？
- “不连通”“已知相反”和“未知”有什么区别？
