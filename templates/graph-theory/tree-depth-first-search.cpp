// 随机验证：../verification/tree-depth-first-search-random.cpp
// 无向树 DFS；建立父节点、深度与先序访问顺序。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;

vector<int> g[MAXN];
vector<int> order;
int parent[MAXN];
int depth[MAXN];

void dfs(int u, int p) {
    parent[u] = p;
    order.push_back(u);

    for (int v : g[u]) {
        if (v == p) {
            continue;
        }
        depth[v] = depth[u] + 1;
        dfs(v, u);
    }
}

int main() {
    int n, root;
    scanf("%d%d", &n, &root);

    for (int i = 1; i < n; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    depth[root] = 0;
    dfs(root, 0);
    for (int i = 0; i < n; i++) {
        printf("%d%c", order[i], " \n"[i + 1 == n]);
    }
    return 0;
}
