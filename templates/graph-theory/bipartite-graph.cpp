// 随机验证：../verification/bipartite-graph-random.cpp
// 无向图二分图判定；color 的 0、1、-1 分别表示未染色和两个集合。

#include <bits/stdc++.h>

using namespace std;

bool is_bipartite(int n, const vector<vector<int>>& g) {
    vector<int> color(n + 5, 0);

    for (int start = 1; start <= n; start++) {
        if (color[start] != 0) {
            continue;
        }

        queue<int> q;
        color[start] = 1;
        q.push(start);

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int v : g[u]) {
                if (color[v] == 0) {
                    color[v] = -color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
    }

    return true;
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    vector<vector<int>> g(n + 5);
    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    printf("%s\n", is_bipartite(n, g) ? "Yes" : "No");
    return 0;
}
