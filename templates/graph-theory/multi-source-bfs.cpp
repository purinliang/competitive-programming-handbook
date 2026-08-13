// 随机验证：../verification/multi-source-bfs-random.cpp
// 无权无向图多源 BFS；求最近起点距离并记录任意一个最近起点。

#include <bits/stdc++.h>

using namespace std;

pair<vector<int>, vector<int>> multi_source_bfs(int n, const vector<vector<int>>& g,
                                                const vector<int>& sources) {
    vector<int> dist(n + 5, -1);
    vector<int> nearest(n + 5, -1);
    queue<int> q;

    for (int source : sources) {
        if (dist[source] != -1) {
            continue;
        }
        dist[source] = 0;
        nearest[source] = source;
        q.push(source);
    }

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : g[u]) {
            if (dist[v] != -1) {
                continue;
            }
            dist[v] = dist[u] + 1;
            nearest[v] = nearest[u];
            q.push(v);
        }
    }

    return {dist, nearest};
}

int main() {
    int n, m, k;
    scanf("%d%d%d", &n, &m, &k);

    vector<vector<int>> g(n + 5);
    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    vector<int> sources;
    sources.reserve(k);
    for (int i = 1; i <= k; i++) {
        int source;
        scanf("%d", &source);
        sources.push_back(source);
    }

    auto [dist, nearest] = multi_source_bfs(n, g, sources);
    for (int u = 1; u <= n; u++) {
        printf("%d%c", dist[u], " \n"[u == n]);
    }
    for (int u = 1; u <= n; u++) {
        printf("%d%c", nearest[u], " \n"[u == n]);
    }
    return 0;
}
