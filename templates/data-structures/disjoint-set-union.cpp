#include <bits/stdc++.h>
using namespace std;

struct DSU {
    int components;
    vector<int> parent;
    vector<int> component_size;

    DSU(int n) : components(n), parent(n + 5), component_size(n + 5, 1) {
        for (int u = 1; u <= n; u++) {
            parent[u] = u;
        }
    }

    int find(int u) {
        if (parent[u] == u) {
            return u;
        }
        return parent[u] = find(parent[u]);
    }

    bool merge(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) {
            return false;
        }
        if (component_size[u] < component_size[v]) {
            swap(u, v);
        }
        parent[v] = u;
        component_size[u] += component_size[v];
        components--;
        return true;
    }

    bool same(int u, int v) {
        return find(u) == find(v);
    }

    int size(int u) {
        return component_size[find(u)];
    }

    int component_count() const {
        return components;
    }
};

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    DSU dsu(n);

    while (m--) {
        int op;
        scanf("%d", &op);

        if (op == 1) {
            int u, v;
            scanf("%d%d", &u, &v);
            dsu.merge(u, v);
        } else if (op == 2) {
            int u, v;
            scanf("%d%d", &u, &v);
            printf("%d\n", dsu.same(u, v));
        } else if (op == 3) {
            int u;
            scanf("%d", &u);
            printf("%d\n", dsu.size(u));
        } else {
            printf("%d\n", dsu.component_count());
        }
    }
    return 0;
}
