// 随机验证：../verification/tree-breadth-first-search-random.cpp
// 无向树 BFS；建立父节点、深度与层序访问顺序。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;

vector<int> g[MAXN];
vector<int> order;
int parent[MAXN];
int depth[MAXN];

void bfs(int root) {
    queue<int> q;
    parent[root] = 0;
    depth[root] = 0;
    q.push(root);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : g[u]) {
            if (v == parent[u]) {
                continue;
            }
            parent[v] = u;
            depth[v] = depth[u] + 1;
            q.push(v);
        }
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

    bfs(root);
    for (int i = 0; i < n; i++) {
        printf("%d%c", order[i], " \n"[i + 1 == n]);
    }
    return 0;
}
