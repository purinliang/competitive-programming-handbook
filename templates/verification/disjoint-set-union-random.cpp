#include <bits/stdc++.h>
using namespace std;

#define main disjoint_set_union_template_main
#include "../data-structures/disjoint-set-union.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 50 + 1;
        DSU dsu(n);
        vector<int> label(n + 5);
        for (int u = 1; u <= n; u++) {
            label[u] = u;
        }

        for (int operation = 1; operation <= 1000; operation++) {
            int u = rng() % n + 1;
            int v = rng() % n + 1;

            if (rng() % 2 == 0) {
                int old_label = label[v];
                int new_label = label[u];
                bool expected = old_label != new_label;
                if (dsu.merge(u, v) != expected) {
                    return 1;
                }
                if (expected) {
                    for (int x = 1; x <= n; x++) {
                        if (label[x] == old_label) {
                            label[x] = new_label;
                        }
                    }
                }
            } else if (dsu.same(u, v) != (label[u] == label[v])) {
                return 1;
            }

            int expected_size = 0;
            int expected_components = 0;
            vector<bool> seen(n + 5);
            for (int x = 1; x <= n; x++) {
                if (label[x] == label[u]) {
                    expected_size++;
                }
                if (!seen[label[x]]) {
                    seen[label[x]] = true;
                    expected_components++;
                }
            }

            if (dsu.size(u) != expected_size || dsu.component_count() != expected_components) {
                return 1;
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
