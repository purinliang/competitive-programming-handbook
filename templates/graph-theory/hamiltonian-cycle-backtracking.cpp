// 随机验证：../verification/hamiltonian-cycle-backtracking-random.cpp
// 至少三个点的简单无向图；小规模回溯寻找一条哈密顿回路。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 25 + 5;

int n, m;
vector<int> g[MAXN];
bool used[MAXN];
vector<int> path;

bool has_edge(int u, int target) {
    for (int v : g[u]) {
        if (v == target) {
            return true;
        }
    }
    return false;
}

bool dfs(int u, int start) {
    if (path.size() == static_cast<size_t>(n)) {
        if (!has_edge(u, start)) {
            return false;
        }
        path.push_back(start);
        return true;
    }

    for (int v : g[u]) {
        if (used[v]) {
            continue;
        }

        used[v] = true;
        path.push_back(v);
        if (dfs(v, start)) {
            return true;
        }
        path.pop_back();
        used[v] = false;
    }
    return false;
}

vector<int> get_hamiltonian_cycle() {
    path.clear();
    fill(used, used + n + 1, false);
    if (n < 3) {
        return {};
    }

    int start = 1;
    path.push_back(start);
    used[start] = true;
    if (!dfs(start, start)) {
        return {};
    }
    return path;
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    vector<int> ans = get_hamiltonian_cycle();
    if (ans.empty()) {
        printf("No Hamiltonian cycle\n");
        return 0;
    }

    for (int i = 0; i < static_cast<int>(ans.size()); i++) {
        printf("%d", ans[i]);
        if (i + 1 == static_cast<int>(ans.size())) {
            printf("\n");
        } else {
            printf(" ");
        }
    }

    return 0;
}
