// 用逐层跳父节点的朴素算法对拍倍增 LCA。

#define main lca_binary_lifting_template_main
#include "../graph-theory/lca-binary-lifting.cpp"
#undef main

int naive_lca(int u, int v, const vector<int>& parent, const vector<int>& expected_depth) {
    while (expected_depth[u] > expected_depth[v]) {
        u = parent[u];
    }
    while (expected_depth[v] > expected_depth[u]) {
        v = parent[v];
    }
    while (u != v) {
        u = parent[u];
        v = parent[v];
    }
    return u;
}

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 500) + 1;
        for (int u = 1; u <= max(n, previous_n); u++) {
            g[u].clear();
        }
        previous_n = n;

        for (int v = 2; v <= n; v++) {
            int u = static_cast<int>(rng() % (v - 1)) + 1;
            g[u].push_back(v);
            g[v].push_back(u);
        }
        int root = static_cast<int>(rng() % n) + 1;
        build(root);

        vector<int> parent(n + 1, -1);
        vector<int> expected_depth(n + 1);
        queue<int> q;
        parent[root] = root;
        q.push(root);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : g[u]) {
                if (v == parent[u]) {
                    continue;
                }
                parent[v] = u;
                expected_depth[v] = expected_depth[u] + 1;
                q.push(v);
            }
        }

        for (int query = 1; query <= 1000; query++) {
            int u = static_cast<int>(rng() % n) + 1;
            int v = static_cast<int>(rng() % n) + 1;
            int expected = naive_lca(u, v, parent, expected_depth);
            if (lca(u, v) != expected) {
                printf("test %d query %d failed\n", test, query);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
