// 枚举所有染色作为独立答案，穷举小图并随机验证二分图判定模板。

#define main bipartite_graph_template_main
#include "../graph-theory/bipartite-graph.cpp"
#undef main

bool brute_is_bipartite(int n, const vector<pair<int, int>>& edges) {
    for (int mask = 0; mask < (1 << n); mask++) {
        bool valid = true;
        for (auto [u, v] : edges) {
            int color_u = mask >> (u - 1) & 1;
            int color_v = mask >> (v - 1) & 1;
            if (color_u == color_v) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return true;
        }
    }
    return false;
}

bool check_case(int n, const vector<pair<int, int>>& edges) {
    vector<vector<int>> g(n + 5);
    for (auto [u, v] : edges) {
        g[u].push_back(v);
        g[v].push_back(u);
    }
    return is_bipartite(n, g) == brute_is_bipartite(n, edges);
}

int main() {
    int exhaustive_tests = 0;
    for (int n = 1; n <= 6; n++) {
        vector<pair<int, int>> possible_edges;
        for (int u = 1; u <= n; u++) {
            for (int v = u + 1; v <= n; v++) {
                possible_edges.push_back({u, v});
            }
        }

        int graph_count = 1 << possible_edges.size();
        for (int mask = 0; mask < graph_count; mask++) {
            vector<pair<int, int>> edges;
            for (int i = 0; i < (int)possible_edges.size(); i++) {
                if (mask >> i & 1) {
                    edges.push_back(possible_edges[i]);
                }
            }
            if (!check_case(n, edges)) {
                printf("exhaustive test failed: n=%d mask=%d\n", n, mask);
                return 1;
            }
            exhaustive_tests++;
        }
    }

    mt19937 rng(20260814);
    for (int test = 1; test <= 10000; test++) {
        int n = (int)(rng() % 11) + 1;
        int m = (int)(rng() % 35);
        vector<pair<int, int>> edges;
        for (int i = 1; i <= m; i++) {
            int u = (int)(rng() % n) + 1;
            int v = (int)(rng() % n) + 1;
            edges.push_back({u, v});
            if (rng() % 7 == 0) {
                edges.push_back({u, v});
            }
        }
        if (!check_case(n, edges)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("%d exhaustive and 10000 random tests passed\n", exhaustive_tests);
    return 0;
}
