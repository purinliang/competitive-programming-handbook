// 随机验证：../verification/topological-sort-random.cpp
// Kahn 算法；输出任意拓扑序，存在有向环时输出 -1。

#include <bits/stdc++.h>

using namespace std;

vector<int> topological_sort(int n, const vector<vector<int>>& g, vector<int> indegree) {
    queue<int> q;
    for (int u = 1; u <= n; u++) {
        if (indegree[u] == 0) {
            q.push(u);
        }
    }

    vector<int> order;
    order.reserve(n);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : g[u]) {
            indegree[v]--;
            if (indegree[v] == 0) {
                q.push(v);
            }
        }
    }

    return order;
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    vector<vector<int>> g(n + 5);
    vector<int> indegree(n + 5, 0);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        indegree[v]++;
    }

    vector<int> order = topological_sort(n, g, indegree);
    if ((int)order.size() != n) {
        printf("-1\n");
        return 0;
    }

    for (int i = 0; i < n; i++) {
        printf("%d%c", order[i], " \n"[i + 1 == n]);
    }
    return 0;
}
