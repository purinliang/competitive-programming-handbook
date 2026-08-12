// 随机验证：../verification/graph-breadth-first-search-random.cpp
// 无权图 BFS；求起点到每个点的最少边数。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;

vector<int> g[MAXN];
int dist[MAXN];

void bfs(int start, int n) {
    fill(dist + 1, dist + n + 1, -1);

    queue<int> q;
    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : g[u]) {
            if (dist[v] != -1) {
                continue;
            }
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
}

int main() {
    int n, m, start;
    scanf("%d%d%d", &n, &m, &start);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    bfs(start, n);
    for (int u = 1; u <= n; u++) {
        printf("%d%c", dist[u], " \n"[u == n]);
    }
    return 0;
}
