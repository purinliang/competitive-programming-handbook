// 随机验证：../verification/tree-diameter-center-random.cpp
// 无权树的直径路径与中心；路径按一个直径端点到另一个端点保存。

#include <bits/stdc++.h>

using namespace std;

struct bfs_result {
    int farthest;
    vector<int> dist;
    vector<int> parent;
};

bfs_result bfs(int n, int start, const vector<vector<int>>& g) {
    vector<int> dist(n + 5, -1);
    vector<int> parent(n + 5, 0);
    queue<int> q;

    int farthest = start;
    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        if (dist[u] > dist[farthest]) {
            farthest = u;
        }

        for (int v : g[u]) {
            if (dist[v] != -1) {
                continue;
            }
            dist[v] = dist[u] + 1;
            parent[v] = u;
            q.push(v);
        }
    }

    return {farthest, dist, parent};
}

struct diameter_result {
    int length;
    vector<int> path;
    vector<int> centers;
};

diameter_result find_diameter_and_center(int n, const vector<vector<int>>& g) {
    int s = bfs(n, 1, g).farthest;
    bfs_result result = bfs(n, s, g);
    int t = result.farthest;

    vector<int> path;
    for (int u = t; u != 0; u = result.parent[u]) {
        path.push_back(u);
        if (u == s) {
            break;
        }
    }

    int length = result.dist[t];
    vector<int> centers = {path[length / 2]};
    if (length % 2 == 1) {
        centers.push_back(path[length / 2 + 1]);
    }
    return {length, path, centers};
}

int main() {
    int n;
    scanf("%d", &n);

    vector<vector<int>> g(n + 5);
    for (int i = 1; i < n; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    diameter_result answer = find_diameter_and_center(n, g);
    printf("%d\n", answer.length);
    for (int i = 0; i < (int)answer.path.size(); i++) {
        printf("%d%c", answer.path[i], " \n"[i + 1 == (int)answer.path.size()]);
    }
    for (int i = 0; i < (int)answer.centers.size(); i++) {
        printf("%d%c", answer.centers[i],
               " \n"[i + 1 == (int)answer.centers.size()]);
    }
    return 0;
}
