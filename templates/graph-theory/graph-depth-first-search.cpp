// 随机验证：../verification/graph-depth-first-search-random.cpp
// 无向图 DFS；遍历所有连通分量并记录访问顺序。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;

vector<int> g[MAXN];
vector<int> order;
bool visited[MAXN];

void dfs(int u) {
    visited[u] = true;
    order.push_back(u);

    for (int v : g[u]) {
        if (visited[v]) {
            continue;
        }
        dfs(v);
    }
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    int component_count = 0;
    for (int u = 1; u <= n; u++) {
        if (!visited[u]) {
            component_count++;
            dfs(u);
        }
    }

    for (int i = 0; i < static_cast<int>(order.size()); i++) {
        printf("%d%c", order[i],
               " \n"[i + 1 == static_cast<int>(order.size())]);
    }
    printf("%d\n", component_count);
    return 0;
}
