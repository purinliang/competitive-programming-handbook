// 随机验证：../verification/chained-forward-star-random.cpp
// 带权无向图的链式前向星；成对边通过 edge_id ^ 1 互相定位。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;
const int MAXM = 4e5 + 5;

struct Edge {
    int v;
    int w;
    int next;
};

Edge e[MAXM];
int head[MAXN];
int cnt;

void add_edge(int u, int v, int w) {
    e[cnt] = {v, w, head[u]};
    head[u] = cnt;
    cnt++;
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    fill(head, head + n + 1, -1);
    cnt = 0;
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        scanf("%d%d%d", &u, &v, &w);
        add_edge(u, v, w);
        add_edge(v, u, w);
    }

    for (int u = 1; u <= n; u++) {
        for (int i = head[u]; i != -1; i = e[i].next) {
            printf("%d %d %d\n", u, e[i].v, e[i].w);
        }
    }
    return 0;
}
