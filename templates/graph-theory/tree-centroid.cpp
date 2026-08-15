// 随机验证：../verification/tree-centroid-random.cpp
// 求无权树的全部重心，以及删除重心后最大连通块的最小大小。

#include <bits/stdc++.h>

using namespace std;

struct CentroidFinder {
    int n;
    const vector<vector<int>>& g;
    vector<int> subtree_size;
    int best_balance;
    vector<int> centroids;

    CentroidFinder(int node_count, const vector<vector<int>>& graph)
        : n(node_count), g(graph), subtree_size(node_count + 5),
          best_balance(node_count) {}

    void dfs(int u, int p) {
        subtree_size[u] = 1;
        int largest_component = 0;

        for (int v : g[u]) {
            if (v == p) {
                continue;
            }
            dfs(v, u);
            subtree_size[u] += subtree_size[v];
            largest_component = max(largest_component, subtree_size[v]);
        }

        largest_component = max(largest_component, n - subtree_size[u]);
        if (largest_component < best_balance) {
            best_balance = largest_component;
            centroids = {u};
        } else if (largest_component == best_balance) {
            centroids.push_back(u);
        }
    }

    pair<int, vector<int>> solve() {
        dfs(1, 0);
        sort(centroids.begin(), centroids.end());
        return {best_balance, centroids};
    }
};

int main() {
    int n;
    scanf("%d", &n);

    vector<vector<int>> g(n + 5);
    for (int i = 1; i < n; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    CentroidFinder finder(n, g);
    auto [balance, centroids] = finder.solve();
    printf("%d\n", balance);
    for (int i = 0; i < (int)centroids.size(); i++) {
        printf("%d%c", centroids[i], " \n"[i + 1 == (int)centroids.size()]);
    }
    return 0;
}
