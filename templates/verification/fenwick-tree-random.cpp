#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

#define main fenwick_tree_template_main
#include "../data-structures/fenwick-tree.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 100 + 1;
        FenwickTree fenwick(n);
        vector<ll> a(n + 1);

        for (int operation = 1; operation <= 1000; operation++) {
            if (rng() % 2 == 0) {
                int x = rng() % n + 1;
                int val = (int)(rng() % 2001) - 1000;
                a[x] += val;
                fenwick.add(x, val);
            } else {
                int l = rng() % n + 1;
                int r = rng() % n + 1;
                if (l > r) {
                    swap(l, r);
                }

                ll expected = 0;
                for (int i = l; i <= r; i++) {
                    expected += a[i];
                }

                if (fenwick.range_sum(l, r) != expected) {
                    return 1;
                }
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
