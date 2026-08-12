// 用并查集验证 DFS 的连通块数量，并检查每个点恰好访问一次。

#define main graph_depth_first_search_template_main
#include "../graph-theory/graph-depth-first-search.cpp"
#undef main

int find(int u, vector<int>& p) {
    return p[u] == u ? u : p[u] = find(p[u], p);
}

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 50) + 1;
        for (int u = 1; u <= max(n, previous_n); u++) {
            g[u].clear();
            visited[u] = false;
        }
        previous_n = n;
        order.clear();

        vector<int> p(n + 1);
        iota(p.begin(), p.end(), 0);
        for (int u = 1; u <= n; u++) {
            for (int v = u + 1; v <= n; v++) {
                if (rng() % 5 != 0) {
                    continue;
                }
                g[u].push_back(v);
                g[v].push_back(u);
                int pu = find(u, p);
                int pv = find(v, p);
                p[pu] = pv;
            }
        }

        int actual_components = 0;
        for (int u = 1; u <= n; u++) {
            if (!visited[u]) {
                actual_components++;
                dfs(u);
            }
        }

        int expected_components = 0;
        vector<bool> seen_root(n + 1);
        for (int u = 1; u <= n; u++) {
            int root = find(u, p);
            if (!seen_root[root]) {
                seen_root[root] = true;
                expected_components++;
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
        if (static_cast<int>(order.size()) != n || actual_components != expected_components) {
            printf("test %d failed\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
