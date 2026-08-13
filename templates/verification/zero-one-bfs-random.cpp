// 穷举三点 0/1 带权有向图，并用 Bellman–Ford 对拍随机图。

#define main zero_one_bfs_template_main
#include "../graph-theory/zero-one-bfs.cpp"
#undef main

struct Edge {
    int u;
    int v;
    int w;
};

vector<int> bellman_ford(int n, const vector<Edge>& edges, int start) {
    vector<int> dist(n + 5, INF);
    dist[start] = 0;

    for (int step = 1; step < n; step++) {
        bool changed = false;
        for (const Edge& edge : edges) {
            if (dist[edge.u] == INF) {
                continue;
            }
            int candidate = dist[edge.u] + edge.w;
            if (candidate < dist[edge.v]) {
                dist[edge.v] = candidate;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
    return dist;
}

bool check_case(int n, const vector<Edge>& edges, int start) {
    vector<vector<pair<int, int>>> g(n + 5);
    for (const Edge& edge : edges) {
        g[edge.u].push_back({edge.v, edge.w});
    }

    return zero_one_bfs(n, g, start) == bellman_ford(n, edges, start);
}

int main() {
    const int exhaustive_n = 3;
    const int edge_slots = exhaustive_n * exhaustive_n;
    int graph_count = 1;
    for (int i = 0; i < edge_slots; i++) {
        graph_count *= 3;
    }

    for (int code = 0; code < graph_count; code++) {
        int current = code;
        vector<Edge> edges;
        for (int index = 0; index < edge_slots; index++) {
            int state = current % 3;
            current /= 3;
            if (state == 0) {
                continue;
            }

            int u = index / exhaustive_n + 1;
            int v = index % exhaustive_n + 1;
            int w = state - 1;
            edges.push_back({u, v, w});
        }

        if (!check_case(exhaustive_n, edges, 1)) {
            printf("exhaustive graph %d failed\n", code);
            return 1;
        }
    }

    mt19937 rng(20260814);
    for (int test = 1; test <= 10000; test++) {
        int n = (int)(rng() % 35) + 1;
        vector<Edge> edges;

        bool directed = test % 2 == 0;
        if (directed) {
            for (int u = 1; u <= n; u++) {
                for (int v = 1; v <= n; v++) {
                    if (rng() % 10 != 0) {
                        continue;
                    }
                    edges.push_back({u, v, (int)(rng() % 2)});
                    if (rng() % 23 == 0) {
                        edges.push_back({u, v, (int)(rng() % 2)});
                    }
                }
            }
        } else {
            for (int u = 1; u <= n; u++) {
                for (int v = u; v <= n; v++) {
                    if (rng() % 10 != 0) {
                        continue;
                    }
                    int w = (int)(rng() % 2);
                    edges.push_back({u, v, w});
                    edges.push_back({v, u, w});
                    if (rng() % 23 == 0) {
                        int other_w = (int)(rng() % 2);
                        edges.push_back({u, v, other_w});
                        edges.push_back({v, u, other_w});
                    }
                }
            }
        }

        int start = (int)(rng() % n) + 1;
        if (!check_case(n, edges, start)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("19683 exhaustive and 10000 random tests passed\n");
    return 0;
}
