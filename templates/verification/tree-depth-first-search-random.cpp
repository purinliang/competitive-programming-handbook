// 用独立 BFS 验证树上 DFS 得到的父节点和深度。

#define main tree_depth_first_search_template_main
#include "../graph-theory/tree-depth-first-search.cpp"
#undef main

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 100) + 1;
        for (int u = 1; u <= max(n, previous_n); u++) {
            g[u].clear();
            parent[u] = 0;
            depth[u] = 0;
        }
        previous_n = n;
        order.clear();

        for (int v = 2; v <= n; v++) {
            int u = static_cast<int>(rng() % (v - 1)) + 1;
            g[u].push_back(v);
            g[v].push_back(u);
        }
        int root = static_cast<int>(rng() % n) + 1;
        dfs(root, 0);

        vector<int> expected_parent(n + 1, -1);
        vector<int> expected_depth(n + 1);
        queue<int> q;
        expected_parent[root] = 0;
        q.push(root);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : g[u]) {
                if (v == expected_parent[u]) {
                    continue;
                }
                expected_parent[v] = u;
                expected_depth[v] = expected_depth[u] + 1;
                q.push(v);
            }
        }

        vector<bool> seen(n + 1);
        for (int u : order) {
            if (u < 1 || u > n || seen[u]) {
                printf("invalid order on test %d\n", test);
                return 1;
            }
            seen[u] = true;
        }
        for (int u = 1; u <= n; u++) {
            if (parent[u] != expected_parent[u] ||
                depth[u] != expected_depth[u]) {
                printf("test %d vertex %d failed\n", test, u);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
