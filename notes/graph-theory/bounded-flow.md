# 上下界网络流

> 最近修订：2026-08-23 05:47 +10:00（未审阅）

普通流网络只规定每条边最多能发送多少流量，相当于：

$$
0\le f(u,v)\le upper(u,v).
$$

现实中的运输合同还可能要求一条线路至少承担一定流量。例如每天从仓库 `u` 运往门店
`v` 的货物不能少于 `lower`，也不能超过 `upper`：

$$
lower(u,v)\le f(u,v)\le upper(u,v).
$$

下界会迫使网络预先发送一些流量，并可能破坏节点的流量守恒。上下界网络流的核心
问题，就是把这些强制流量造成的不平衡转化成一次普通最大流。

本文先解决最基础而完整的问题：给定一张没有源点和汇点的上下界网络，判断是否存在
满足所有边界和流量守恒的可行环流，并构造每条边的流量。

## 强制发送下界流量

对一条边 `u -> v`，先固定发送 `lower`。以后只需决定额外流量 `extra`：

$$
f(u,v)=lower(u,v)+extra(u,v).
$$

因为原流量不能超过 `upper`，额外流量满足：

$$
0\le extra(u,v)\le upper(u,v)-lower(u,v).
$$

因此在新的普通流网络中，只需要加入容量为 `upper - lower` 的边。

## 下界造成的流量不平衡

强制边 `u -> v` 发送 `lower` 后：

- `u` 已经强制流出 `lower`；
- `v` 已经强制流入 `lower`。

定义：

```text
balance[u] = 强制流入 - 强制流出
```

处理一条边时：

```cpp
balance[u] -= lower;
balance[v] += lower;
```

若 `balance[u] > 0`，说明 `u` 的强制流入更多，额外流必须从 `u` 再流出
`balance[u]`；若 `balance[u] < 0`，说明它的强制流出更多，还需要额外流入
`-balance[u]`。

所有 `balance` 之和必然为 $0$，因为每份强制流量只是在一个点减去、另一个点加上。

## 超级源点与超级汇点

建立超级源点 `super_source` 和超级汇点 `super_sink`。

对于 `balance[u] > 0` 的节点，加入：

```text
super_source -> u    容量 balance[u]
```

这份额外流进入 `u` 后，必须从原网络的剩余容量中流出去，恰好补偿它过多的强制流入。

对于 `balance[u] < 0` 的节点，加入：

```text
u -> super_sink    容量 -balance[u]
```

原网络必须向 `u` 补入相应流量，才能把这些流量继续送往超级汇点。

> 这里最容易凭感觉把方向写反。判断方向时不要背结论：`balance[u] > 0` 表示原节点
> 还需要额外流出；让超级源点先向它注入同样流量，普通流量守恒就会迫使这份流量从
> 原网络中流走。

## 饱和所有补偿边

设从超级源点发出的容量总和为 `required`。在新网络中求：

```text
super_source 到 super_sink 的最大流
```

若最大流等于 `required`，超级源点的每条出边都被流满，所有下界造成的不平衡都找到
了补偿路线，原网络存在可行环流。

若最大流小于 `required`，至少一个节点所需的补偿流无法穿过原网络的剩余容量，原问题
无解。

## 恢复原边流量

原边在普通流网络中的容量是：

```text
upper - lower
```

设这条残量记录最后还剩 `remaining`，它实际发送的额外流量为：

```text
extra = upper - lower - remaining
```

所以原边最终流量为：

```text
flow = lower + extra
```

代码只需在加边时保存每条原边对应的残量边编号，最大流结束后便能逐条恢复答案。

## 正确性直觉

任何可行环流都必须先包含每条边的下界流量，剩余部分自然满足容量上限
`upper - lower`。把剩余部分看作普通流，它必然能补平所有 `balance`，因此可以让
超级源点的全部出边饱和。

反过来，若超级源点的出边全部饱和，普通最大流的流量守恒保证每个原节点正好完成了
所需补偿。把残量网络中使用的额外流量加回下界后，每条边仍位于自己的上下界之间，
每个原节点也恢复流量守恒，所以得到一份可行环流。

两种构造可以互相转换，因此“最大流等于 `required`”与“原问题存在可行环流”等价。

## 完整代码

输入点数和边数，每条有向边依次给出 `u`、`v`、`lower` 和 `upper`。若无解，输出
`NO`；否则输出 `YES`，并按输入顺序输出每条边的一份可行流量。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct Dinic {
    struct Edge {
        int v;
        int next;
        ll capacity;
    };

    int n;
    vector<int> head;
    vector<int> level;
    vector<int> current;
    vector<Edge> edge;

    Dinic(int size, int edge_count)
        : n(size), head(n + 5, -1), level(n + 5), current(n + 5) {
        edge.reserve(2 * edge_count + 5);
    }

    void add_directed_edge(int u, int v, ll capacity) {
        edge.push_back({v, head[u], capacity});
        head[u] = edge.size() - 1;
    }

    int add_edge(int u, int v, ll capacity) {
        int edge_id = edge.size();
        add_directed_edge(u, v, capacity);
        add_directed_edge(v, u, 0);
        return edge_id;
    }

    bool bfs(int source, int sink) {
        fill(level.begin(), level.end(), -1);

        queue<int> q;
        q.push(source);
        level[source] = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int i = head[u]; i != -1; i = edge[i].next) {
                int v = edge[i].v;
                if (edge[i].capacity == 0 || level[v] != -1) {
                    continue;
                }

                level[v] = level[u] + 1;
                q.push(v);
            }
        }

        return level[sink] != -1;
    }

    ll dfs(int u, int sink, ll flow) {
        if (u == sink) {
            return flow;
        }

        ll used = 0;
        for (int& i = current[u]; i != -1; i = edge[i].next) {
            int v = edge[i].v;
            if (edge[i].capacity == 0 || level[v] != level[u] + 1) {
                continue;
            }

            ll sent = dfs(v, sink, min(flow - used, edge[i].capacity));
            if (sent == 0) {
                continue;
            }

            edge[i].capacity -= sent;
            edge[i ^ 1].capacity += sent;
            used += sent;
            if (used == flow) {
                return used;
            }
        }

        return used;
    }

    ll run(int source, int sink) {
        if (source == sink) {
            return 0;
        }

        ll answer = 0;
        while (bfs(source, sink)) {
            current = head;
            answer += dfs(source, sink, INF);
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<int> from(m + 5);
    vector<int> to(m + 5);
    vector<int> edge_id(m + 5);
    vector<ll> lower(m + 5);
    vector<ll> upper(m + 5);
    vector<ll> balance(n + 5, 0);

    bool valid = true;
    for (int i = 1; i <= m; ++i) {
        cin >> from[i] >> to[i] >> lower[i] >> upper[i];
        if (lower[i] < 0 || lower[i] > upper[i]) {
            valid = false;
        }
    }

    if (!valid) {
        cout << "NO\n";
        return 0;
    }

    int super_source = n + 1;
    int super_sink = n + 2;
    Dinic flow(n + 2, m + n);

    for (int i = 1; i <= m; ++i) {
        edge_id[i] = flow.add_edge(from[i], to[i], upper[i] - lower[i]);
        balance[from[i]] -= lower[i];
        balance[to[i]] += lower[i];
    }

    ll required = 0;
    for (int u = 1; u <= n; ++u) {
        if (balance[u] > 0) {
            flow.add_edge(super_source, u, balance[u]);
            required += balance[u];
        } else if (balance[u] < 0) {
            flow.add_edge(u, super_sink, -balance[u]);
        }
    }

    if (flow.run(super_source, super_sink) != required) {
        cout << "NO\n";
        return 0;
    }

    cout << "YES\n";
    for (int i = 1; i <= m; ++i) {
        ll extra = upper[i] - lower[i] - flow.edge[edge_id[i]].capacity;
        cout << lower[i] + extra << '\n';
    }
    return 0;
}
```

## 有源汇上下界网络流

若原问题给出源点 `source` 和汇点 `sink`，在满足中间点守恒的同时允许源点净流出、
汇点净流入，可以先加入一条容量足够大的边：

```text
sink -> source
```

这条边把源点流出的流量送回源点，使整个网络暂时变成环流。随后复用上面的超级源汇
构造，就能判断是否存在一份有源汇上下界可行流；人工边 `sink -> source` 上的流量
就是这份方案的源汇流量。

若还要求最大源汇流量，在得到一份可行方案后，删除超级源汇相关边与人工边，再在
当前残量网络中从 `source` 向 `sink` 继续求最大流。初始可行流量加上新增流量，就是
上下界最大流。

这一步没有改变下界：残量网络中的正反边只是在已有可行方案上增加或撤销额外流量，
每条原边仍不会低于已经固定的 `lower`。

## 复杂度

构图增加两个点和至多 $n$ 条补偿边，时间瓶颈是一次 Dinic。一般网络上的最坏时间
复杂度为 $O(n^2m)$，空间复杂度为 $O(n+m)$；这里的 $n$、$m$ 忽略新增的线性规模
常数。

恢复每条原边流量只需 $O(m)$。

## 常见错误

- 没有先检查 `0 <= lower <= upper`；
- 新网络的原边容量仍写成 `upper`，忘记下界已经被强制发送；
- `balance` 的定义写了一种，连接超级源汇时却套用了另一种符号约定；
- 只检查超级源汇之间是否有流，而没有检查流量是否等于 `required`；
- 恢复答案时只输出额外流量，忘记加回 `lower`；
- 有源汇问题没有加入 `sink -> source`，直接要求所有原节点守恒；
- 求上下界最大流时，从零重新建图，丢失已经构造出的可行方案。

## 需要记住什么

- 为什么强制下界后，原边的新容量是 `upper - lower`？
- `balance[u]` 在本文中怎样定义？
- `balance[u] > 0` 表示还需要补充流入还是流出？
- 超级源点和超级汇点的边为什么按这个方向连接？
- 用什么条件判断所有不平衡都已补平？
- 怎样从残量边恢复一条原边的最终流量？
- 有源汇问题为什么加入 `sink -> source`？
- 求上下界最大流时，为什么必须从已经得到的可行流继续增广？
