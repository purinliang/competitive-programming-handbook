// 用全源 BFS 求直径与最小离心率，验证双次 BFS 得到的路径和中心。

#define main tree_diameter_center_template_main
#include "../graph-theory/tree-diameter-center.cpp"
#undef main

bool adjacent(int u, int v, const vector<vector<int>>& g) {
    return find(g[u].begin(), g[u].end(), v) != g[u].end();
}

void dfs_dist(int u, int p, const vector<vector<int>>& g, vector<int>& dist) {
    for (int v : g[u]) {
        if (v == p) {
            continue;
        }
        dist[v] = dist[u] + 1;
        dfs_dist(v, u, g, dist);
    }
}

bool check_case(int n, const vector<vector<int>>& g) {
    vector<vector<int>> all_dist(n + 5);
    int expected_diameter = 0;
    int radius = n;
    vector<int> expected_centers;

    for (int start = 1; start <= n; start++) {
        all_dist[start].assign(n + 5, -1);
        all_dist[start][start] = 0;
        dfs_dist(start, 0, g, all_dist[start]);
        int eccentricity = 0;
        for (int u = 1; u <= n; u++) {
            expected_diameter = max(expected_diameter, all_dist[start][u]);
            eccentricity = max(eccentricity, all_dist[start][u]);
        }
        if (eccentricity < radius) {
            radius = eccentricity;
            expected_centers = {start};
        } else if (eccentricity == radius) {
            expected_centers.push_back(start);
        }
    }

    diameter_result result = find_diameter_and_center(n, g);
    if (result.length != expected_diameter || (int)result.path.size() != result.length + 1) {
        return false;
    }
    for (int i = 1; i < (int)result.path.size(); i++) {
        if (!adjacent(result.path[i - 1], result.path[i], g)) {
            return false;
        }
    }
    if (all_dist[result.path.front()][result.path.back()] != expected_diameter) {
        return false;
    }

    sort(result.centers.begin(), result.centers.end());
    sort(expected_centers.begin(), expected_centers.end());
    return result.centers == expected_centers;
}

int main() {
    for (int n = 1; n <= 100; n++) {
        vector<vector<int>> path(n + 5);
        vector<vector<int>> star(n + 5);
        for (int u = 2; u <= n; u++) {
            path[u - 1].push_back(u);
            path[u].push_back(u - 1);
            star[1].push_back(u);
            star[u].push_back(1);
        }
        if (!check_case(n, path) || !check_case(n, star)) {
            printf("path or star test failed: n=%d\n", n);
            return 1;
        }
    }

    mt19937 rng(20260814);
    for (int test = 1; test <= 10000; test++) {
        int n = (int)(rng() % 50) + 1;
        vector<vector<int>> g(n + 5);
        for (int v = 2; v <= n; v++) {
            int u = (int)(rng() % (v - 1)) + 1;
            g[u].push_back(v);
            g[v].push_back(u);
        }
        for (int u = 1; u <= n; u++) {
            shuffle(g[u].begin(), g[u].end(), rng);
        }
        if (!check_case(n, g)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("200 structured and 10000 random tests passed\n");
    return 0;
}
