// 用 Floyd–Warshall 的全源最短路对拍多源 BFS，并验证来源确实达到最短距离。

#define main multi_source_bfs_template_main
#include "../graph-theory/multi-source-bfs.cpp"
#undef main

const int INF = 1e8;

bool check_case(int n, const vector<vector<int>>& g, const vector<int>& sources,
                vector<vector<int>> expected) {
    for (int k = 1; k <= n; k++) {
        for (int u = 1; u <= n; u++) {
            for (int v = 1; v <= n; v++) {
                expected[u][v] = min(expected[u][v], expected[u][k] + expected[k][v]);
            }
        }
    }

    vector<bool> is_source(n + 5, false);
    for (int source : sources) {
        is_source[source] = true;
    }

    auto [dist, nearest] = multi_source_bfs(n, g, sources);
    for (int u = 1; u <= n; u++) {
        int answer = INF;
        for (int source : sources) {
            answer = min(answer, expected[source][u]);
        }
        if (answer == INF) {
            answer = -1;
        }

        if (dist[u] != answer) {
            return false;
        }
        if (answer == -1) {
            if (nearest[u] != -1) {
                return false;
            }
        } else {
            if (nearest[u] < 1 || nearest[u] > n || !is_source[nearest[u]]) {
                return false;
            }
            if (expected[nearest[u]][u] != answer) {
                return false;
            }
        }
    }
    return true;
}

int main() {
    mt19937 rng(20260814);

    for (int test = 1; test <= 10000; test++) {
        int n = (int)(rng() % 30) + 1;
        vector<vector<int>> g(n + 5);
        vector<vector<int>> expected(n + 5, vector<int>(n + 5, INF));
        for (int u = 1; u <= n; u++) {
            expected[u][u] = 0;
        }

        bool directed = test % 2 == 0;
        if (directed) {
            for (int u = 1; u <= n; u++) {
                for (int v = 1; v <= n; v++) {
                    if (rng() % 11 != 0) {
                        continue;
                    }
                    g[u].push_back(v);
                    expected[u][v] = min(expected[u][v], 1);
                    if (rng() % 17 == 0) {
                        g[u].push_back(v);
                    }
                }
            }
        } else {
            for (int u = 1; u <= n; u++) {
                for (int v = u; v <= n; v++) {
                    if (rng() % 11 != 0) {
                        continue;
                    }
                    g[u].push_back(v);
                    g[v].push_back(u);
                    expected[u][v] = min(expected[u][v], 1);
                    expected[v][u] = min(expected[v][u], 1);
                    if (rng() % 17 == 0) {
                        g[u].push_back(v);
                        g[v].push_back(u);
                    }
                }
            }
        }

        int source_count = (int)(rng() % (n + 3));
        vector<int> sources;
        sources.reserve(source_count);
        for (int i = 1; i <= source_count; i++) {
            sources.push_back((int)(rng() % n) + 1);
        }

        if (!check_case(n, g, sources, expected)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
