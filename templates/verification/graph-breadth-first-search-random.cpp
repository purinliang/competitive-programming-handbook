// 用 Floyd–Warshall 的全源最短路结果对拍单源 BFS。

#define main graph_breadth_first_search_template_main
#include "../graph-theory/graph-breadth-first-search.cpp"
#undef main

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 30) + 1;
        for (int u = 1; u <= max(n, previous_n); u++) {
            g[u].clear();
        }
        previous_n = n;

        const int INF = 1e9;
        vector<vector<int>> expected(n + 1, vector<int>(n + 1, INF));
        for (int u = 1; u <= n; u++) {
            expected[u][u] = 0;
            for (int v = u + 1; v <= n; v++) {
                if (rng() % 5 != 0) {
                    continue;
                }
                g[u].push_back(v);
                g[v].push_back(u);
                expected[u][v] = expected[v][u] = 1;
            }
        }
        for (int k = 1; k <= n; k++) {
            for (int u = 1; u <= n; u++) {
                for (int v = 1; v <= n; v++) {
                    expected[u][v] = min(expected[u][v], expected[u][k] + expected[k][v]);
                }
            }
        }

        int start = static_cast<int>(rng() % n) + 1;
        bfs(start, n);
        for (int u = 1; u <= n; u++) {
            int answer = expected[start][u] == INF ? -1 : expected[start][u];
            if (dist[u] != answer) {
                printf("test %d vertex %d failed\n", test, u);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
