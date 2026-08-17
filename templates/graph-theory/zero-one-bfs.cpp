// 随机验证：../verification/zero-one-bfs-random.cpp
// 0-1 BFS；求起点到带 0-1 边权有向图中每个点的最短距离。

#include <bits/stdc++.h>

using namespace std;

const int INF = 1e9;

vector<int> zero_one_bfs(int n, const vector<vector<pair<int, int>>>& g,
                         int start) {
    vector<int> dist(n + 5, INF);
    deque<pair<int, int>> q;

    dist[start] = 0;
    q.push_front({0, start});

    while (!q.empty()) {
        auto [current_dist, u] = q.front();
        q.pop_front();

        if (current_dist != dist[u]) {
            continue;
        }

        for (auto& [v, w] : g[u]) {
            int candidate = current_dist + w;
            if (candidate >= dist[v]) {
                continue;
            }

            dist[v] = candidate;
            if (w == 0) {
                q.push_front({candidate, v});
            } else {
                q.push_back({candidate, v});
            }
        }
    }

    return dist;
}

int main() {
    int n, m, start;
    scanf("%d%d%d", &n, &m, &start);

    vector<vector<pair<int, int>>> g(n + 5);
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        scanf("%d%d%d", &u, &v, &w);
        g[u].push_back({v, w});
    }

    vector<int> dist = zero_one_bfs(n, g, start);
    for (int u = 1; u <= n; u++) {
        int answer = dist[u] == INF ? -1 : dist[u];
        printf("%d%c", answer, " \n"[u == n]);
    }
    return 0;
}
