// 用从根到每个点的唯一简单路径验证树上 BFS。

#define main tree_breadth_first_search_template_main
#include "../graph-theory/tree-breadth-first-search.cpp"
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
        bfs(root);

        vector<bool> seen(n + 1);
        int previous_depth = -1;
        for (int u : order) {
            if (u < 1 || u > n || seen[u] || depth[u] < previous_depth) {
                printf("invalid order on test %d\n", test);
                return 1;
            }
            seen[u] = true;
            previous_depth = depth[u];
            if (u == root) {
                if (parent[u] != 0 || depth[u] != 0) {
                    printf("invalid root on test %d\n", test);
                    return 1;
                }
            } else if (depth[u] != depth[parent[u]] + 1 ||
                       find(g[u].begin(), g[u].end(), parent[u]) ==
                           g[u].end()) {
                printf("invalid parent on test %d\n", test);
                return 1;
            }
        }
        if (static_cast<int>(order.size()) != n) {
            printf("incomplete order on test %d\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
