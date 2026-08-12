// 随机验证：../verification/lca-binary-lifting-random.cpp
// 树上倍增 LCA；支持最多 5e5 个节点。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 5e5 + 5;
const int LOG = 19;

vector<int> g[MAXN];
int depth[MAXN];
int up[MAXN][LOG + 1];

void build(int root) {
    depth[root] = 0;
    for (int k = 0; k <= LOG; k++) {
        up[root][k] = root;
    }

    queue<int> q;
    q.push(root);
    while (!q.empty()) {
        int u = q.front();
        q.pop();

        int p = up[u][0];
        for (int v : g[u]) {
            if (v == p) {
                continue;
            }
            depth[v] = depth[u] + 1;
            up[v][0] = u;
            for (int k = 1; k <= LOG; k++) {
                up[v][k] = up[up[v][k - 1]][k - 1];
            }
            q.push(v);
        }
    }
}

int jump(int u, int step) {
    for (int k = 0; k <= LOG; k++) {
        if ((step >> k) & 1) {
            u = up[u][k];
        }
    }
    return u;
}

int lca(int u, int v) {
    if (depth[u] < depth[v]) {
        swap(u, v);
    }

    u = jump(u, depth[u] - depth[v]);
    if (u == v) {
        return u;
    }
    for (int k = LOG; k >= 0; k--) {
        if (up[u][k] != up[v][k]) {
            u = up[u][k];
            v = up[v][k];
        }
    }
    return up[u][0];
}

int main() {
    int n, q, root;
    scanf("%d%d%d", &n, &q, &root);
    for (int i = 1; i < n; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    build(root);
    while (q--) {
        int u, v;
        scanf("%d%d", &u, &v);
        printf("%d\n", lca(u, v));
    }
    return 0;
}
