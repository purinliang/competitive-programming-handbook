// 逐个删点并搜索剩余连通块，验证树重心模板。

#define main tree_centroid_template_main
#include "../graph-theory/tree-centroid.cpp"
#undef main

pair<int, vector<int>> brute_centroids(int n, const vector<vector<int>>& g) {
    int best_balance = n;
    vector<int> centroids;

    for (int removed = 1; removed <= n; removed++) {
        vector<bool> visited(n + 5, false);
        visited[removed] = true;
        int largest_component = 0;

        for (int start = 1; start <= n; start++) {
            if (visited[start]) {
                continue;
            }
            int component_size = 0;
            queue<int> q;
            visited[start] = true;
            q.push(start);

            while (!q.empty()) {
                int u = q.front();
                q.pop();
                component_size++;
                for (int v : g[u]) {
                    if (visited[v]) {
                        continue;
                    }
                    visited[v] = true;
                    q.push(v);
                }
            }
            largest_component = max(largest_component, component_size);
        }

        if (largest_component < best_balance) {
            best_balance = largest_component;
            centroids = {removed};
        } else if (largest_component == best_balance) {
            centroids.push_back(removed);
        }
    }

    return {best_balance, centroids};
}

bool check_case(int n, const vector<vector<int>>& g) {
    CentroidFinder finder(n, g);
    return finder.solve() == brute_centroids(n, g);
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
