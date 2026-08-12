// 随机验证：../verification/eulerian-path-random.cpp
// 无向图欧拉路径；每条原始边恰好使用一次。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 2e5 + 5;
const int MAXM = 4e5 + 5;

struct Edge {
    int v;
    int next;
};

Edge e[MAXM];
int head[MAXN];
int degree[MAXN];
bool used[MAXM];
int cnt;

void add_edge(int u, int v) {
    e[cnt] = {v, head[u]};
    head[u] = cnt;
    cnt++;
}

vector<int> get_euler_path(int n, int m) {
    vector<int> odd;
    for (int u = 1; u <= n; u++) {
        if (degree[u] % 2 == 1) {
            odd.push_back(u);
        }
    }

    if (!odd.empty() && odd.size() != 2) {
        return {};
    }

    int start = 1;
    if (odd.size() == 2) {
        start = odd[0];
    } else {
        for (int u = 1; u <= n; u++) {
            if (degree[u] > 0) {
                start = u;
                break;
            }
        }
    }

    vector<int> st = {start};
    vector<int> ans;

    while (!st.empty()) {
        int u = st.back();
        while (head[u] != -1 && used[head[u]]) {
            head[u] = e[head[u]].next;
        }

        if (head[u] == -1) {
            ans.push_back(u);
            st.pop_back();
            continue;
        }

        int i = head[u];
        head[u] = e[i].next;
        used[i] = true;
        used[i ^ 1] = true;
        st.push_back(e[i].v);
    }

    if (ans.size() != static_cast<size_t>(m + 1)) {
        return {};
    }

    reverse(ans.begin(), ans.end());
    return ans;
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    fill(head, head + n + 1, -1);
    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        add_edge(u, v);
        add_edge(v, u);
        degree[u]++;
        degree[v]++;
    }

    vector<int> ans = get_euler_path(n, m);
    if (ans.empty()) {
        printf("No Euler path\n");
        return 0;
    }

    for (int i = 0; i <= m; i++) {
        printf("%d", ans[i]);
        if (i == m) {
            printf("\n");
        } else {
            printf(" ");
        }
    }

    return 0;
}
