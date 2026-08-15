#include <bits/stdc++.h>
using namespace std;

#define main sparse_table_template_main
#include "../data-structures/sparse-table.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 200 + 1;
        vector<int> a(n + 5);
        for (int i = 1; i <= n; i++) {
            a[i] = (int)(rng() % 2001) - 1000;
        }

        SparseTable sparse(n, a);

        for (int query = 1; query <= 1000; query++) {
            int l = rng() % n + 1;
            int r = rng() % n + 1;
            if (l > r) {
                swap(l, r);
            }

            int expected = a[l];
            for (int i = l + 1; i <= r; i++) {
                expected = max(expected, a[i]);
            }

            if (sparse.query(l, r) != expected) {
                return 1;
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
