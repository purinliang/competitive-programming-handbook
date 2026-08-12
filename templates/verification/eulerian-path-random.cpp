// 随机对拍无向图欧拉路径模板。
// 暴力枚举小图的用边顺序，并检查模板答案是否恰好使用全部原始边。

#define main eulerian_path_template_main
#include "../graph-theory/eulerian-path.cpp"
#undef main

struct TestEdge {
    int u;
    int v;
};

int brute_dfs(int u, int mask, const vector<TestEdge>& edges, vector<vector<int>>& memo) {
    if (mask == (1 << static_cast<int>(edges.size())) - 1) {
        return true;
    }
    if (memo[u][mask] != -1) {
        return memo[u][mask];
    }

    memo[u][mask] = false;
    for (int i = 0; i < static_cast<int>(edges.size()); i++) {
        if (mask >> i & 1) {
            continue;
        }

        int v = -1;
        if (edges[i].u == u) {
            v = edges[i].v;
        } else if (edges[i].v == u) {
            v = edges[i].u;
        }

        if (v != -1 && brute_dfs(v, mask | (1 << i), edges, memo)) {
            memo[u][mask] = true;
            break;
        }
    }
    return memo[u][mask];
}

bool brute_exists(int n, const vector<TestEdge>& edges) {
    int states = 1 << static_cast<int>(edges.size());
    vector<vector<int>> memo(n + 1, vector<int>(states, -1));
    for (int u = 1; u <= n; u++) {
        if (brute_dfs(u, 0, edges, memo)) {
            return true;
        }
    }
    return false;
}

bool valid_path(const vector<int>& path, const vector<TestEdge>& edges) {
    if (path.size() != edges.size() + 1) {
        return false;
    }

    vector<bool> edge_used(edges.size());
    for (int i = 0; i + 1 < static_cast<int>(path.size()); i++) {
        bool found = false;
        for (int j = 0; j < static_cast<int>(edges.size()); j++) {
            if (edge_used[j]) {
                continue;
            }
            if ((edges[j].u == path[i] && edges[j].v == path[i + 1]) ||
                (edges[j].v == path[i] && edges[j].u == path[i + 1])) {
                edge_used[j] = true;
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    return true;
}

void load_graph(int n, const vector<TestEdge>& edges) {
    fill(head, head + n + 1, -1);
    fill(degree, degree + n + 1, 0);
    fill(used, used + 2 * edges.size(), false);
    cnt = 0;

    for (TestEdge edge : edges) {
        add_edge(edge.u, edge.v);
        add_edge(edge.v, edge.u);
        degree[edge.u]++;
        degree[edge.v]++;
    }
}

int main() {
    mt19937 rng(20050314);

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 7) + 1;
        int m = static_cast<int>(rng() % 10);
        vector<TestEdge> edges;
        for (int i = 0; i < m; i++) {
            int u = static_cast<int>(rng() % n) + 1;
            int v = static_cast<int>(rng() % n) + 1;
            edges.push_back({u, v});
        }

        bool expected = brute_exists(n, edges);
        load_graph(n, edges);
        vector<int> path = get_euler_path(n, m);
        bool actual = !path.empty() && valid_path(path, edges);

        if (actual != expected) {
            printf("Mismatch on test %d\n", test);
            printf("%d %d\n", n, m);
            for (TestEdge edge : edges) {
                printf("%d %d\n", edge.u, edge.v);
            }
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
