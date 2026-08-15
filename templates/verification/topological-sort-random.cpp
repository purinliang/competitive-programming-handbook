// 穷举四点有向图，并用 DFS 判环对拍随机图中的 Kahn 算法。

#define main topological_sort_template_main
#include "../graph-theory/topological-sort.cpp"
#undef main

bool is_valid_order(int n, const vector<vector<int>>& g,
                    const vector<int>& order) {
    if ((int)order.size() != n) {
        return false;
    }

    vector<int> position(n + 5, 0);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        if (u < 1 || u > n || position[u] != 0) {
            return false;
        }
        position[u] = i + 1;
    }

    for (int u = 1; u <= n; u++) {
        for (int v : g[u]) {
            if (position[u] >= position[v]) {
                return false;
            }
        }
    }
    return true;
}

bool brute_force_exists(int n, const vector<vector<int>>& g) {
    vector<int> order(n);
    iota(order.begin(), order.end(), 1);

    do {
        if (is_valid_order(n, g, order)) {
            return true;
        }
    } while (next_permutation(order.begin(), order.end()));

    return false;
}

bool dfs_cycle(int u, const vector<vector<int>>& g, vector<int>& state) {
    state[u] = 1;
    for (int v : g[u]) {
        if (state[v] == 1) {
            return true;
        }
        if (state[v] == 0 && dfs_cycle(v, g, state)) {
            return true;
        }
    }
    state[u] = 2;
    return false;
}

bool has_cycle(int n, const vector<vector<int>>& g) {
    vector<int> state(n + 5, 0);
    for (int u = 1; u <= n; u++) {
        if (state[u] == 0 && dfs_cycle(u, g, state)) {
            return true;
        }
    }
    return false;
}

bool check_graph(int n, const vector<vector<int>>& g) {
    vector<int> indegree(n + 5, 0);
    for (int u = 1; u <= n; u++) {
        for (int v : g[u]) {
            indegree[v]++;
        }
    }

    vector<int> order = topological_sort(n, g, indegree);
    bool expected = !has_cycle(n, g);
    bool actual = (int)order.size() == n;
    if (actual != expected) {
        return false;
    }
    return !actual || is_valid_order(n, g, order);
}

int main() {
    const int n = 4;
    const int edge_slots = n * n;

    for (int mask = 0; mask < (1 << edge_slots); mask++) {
        vector<vector<int>> g(n + 5);
        for (int index = 0; index < edge_slots; index++) {
            if ((mask >> index) % 2 == 0) {
                continue;
            }
            int u = index / n + 1;
            int v = index % n + 1;
            g[u].push_back(v);
        }

        vector<int> indegree(n + 5, 0);
        for (int u = 1; u <= n; u++) {
            for (int v : g[u]) {
                indegree[v]++;
            }
        }
        vector<int> order = topological_sort(n, g, indegree);
        bool actual = (int)order.size() == n;
        bool expected = brute_force_exists(n, g);
        if (actual != expected || (actual && !is_valid_order(n, g, order))) {
            printf("exhaustive mask %d failed\n", mask);
            return 1;
        }
    }

    mt19937 rng(20260814);
    for (int test = 1; test <= 10000; test++) {
        int vertex_count = (int)(rng() % 30) + 1;
        vector<vector<int>> g(vertex_count + 5);

        for (int u = 1; u <= vertex_count; u++) {
            for (int v = 1; v <= vertex_count; v++) {
                if (rng() % 13 == 0) {
                    g[u].push_back(v);
                }
                if (rng() % 101 == 0) {
                    g[u].push_back(v);
                }
            }
        }

        if (!check_graph(vertex_count, g)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("65536 exhaustive and 10000 random tests passed\n");
    return 0;
}
