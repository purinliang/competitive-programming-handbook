// 用状压 DP 对拍小规模哈密顿回路模板。

#define main hamiltonian_cycle_template_main
#include "../graph-theory/hamiltonian-cycle-backtracking.cpp"
#undef main

bool dp_exists(const vector<vector<bool>>& connected) {
    int states = 1 << n;
    vector<vector<bool>> dp(states, vector<bool>(n));
    dp[1][0] = true;

    for (int mask = 1; mask < states; mask++) {
        if ((mask & 1) == 0) {
            continue;
        }
        for (int u = 0; u < n; u++) {
            if (!dp[mask][u]) {
                continue;
            }
            for (int v = 0; v < n; v++) {
                if ((mask >> v & 1) == 0 && connected[u][v]) {
                    dp[mask | (1 << v)][v] = true;
                }
            }
        }
    }

    int full = states - 1;
    for (int u = 1; u < n; u++) {
        if (dp[full][u] && connected[u][0]) {
            return true;
        }
    }
    return false;
}

bool valid_cycle(const vector<int>& cycle,
                 const vector<vector<bool>>& connected) {
    if (cycle.size() != static_cast<size_t>(n + 1) || cycle.front() != 1 ||
        cycle.back() != 1) {
        return false;
    }

    vector<bool> seen(n + 1);
    for (int i = 0; i < n; i++) {
        int u = cycle[i];
        int v = cycle[i + 1];
        if (u < 1 || u > n || v < 1 || v > n || seen[u] ||
            !connected[u - 1][v - 1]) {
            return false;
        }
        seen[u] = true;
    }
    return true;
}

void load_graph(const vector<vector<bool>>& connected) {
    for (int u = 1; u <= n; u++) {
        g[u].clear();
    }
    m = 0;
    for (int u = 1; u <= n; u++) {
        for (int v = u + 1; v <= n; v++) {
            if (connected[u - 1][v - 1]) {
                g[u].push_back(v);
                g[v].push_back(u);
                m++;
            }
        }
    }
}

int main() {
    mt19937 rng(20050314);

    for (int test = 1; test <= 10000; test++) {
        n = static_cast<int>(rng() % 7) + 3;
        vector<vector<bool>> connected(n, vector<bool>(n));
        for (int u = 0; u < n; u++) {
            for (int v = u + 1; v < n; v++) {
                if (rng() % 2 == 1) {
                    connected[u][v] = true;
                    connected[v][u] = true;
                }
            }
        }

        bool expected = dp_exists(connected);
        load_graph(connected);
        vector<int> cycle = get_hamiltonian_cycle();
        bool actual = !cycle.empty() && valid_cycle(cycle, connected);

        if (actual != expected) {
            printf("Mismatch on test %d\n", test);
            printf("%d %d\n", n, m);
            for (int u = 1; u <= n; u++) {
                for (int v = u + 1; v <= n; v++) {
                    if (connected[u - 1][v - 1]) {
                        printf("%d %d\n", u, v);
                    }
                }
            }
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
