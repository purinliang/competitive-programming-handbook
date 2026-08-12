#define main segment_tree_template_main
#include "../data-structures/segment-tree.cpp"
#undef main

int main() {
    mt19937 rng(918273);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 100 + 1;
        vector<ll> a(n + 5);
        for (int i = 1; i <= n; i++) {
            a[i] = (int)(rng() % 2001) - 1000;
        }

        SegmentTree segment_tree(n, a);

        for (int operation = 1; operation <= 1000; operation++) {
            int l = rng() % n + 1;
            int r = rng() % n + 1;
            if (l > r) {
                swap(l, r);
            }

            if (rng() % 2 == 0) {
                int val = (int)(rng() % 2001) - 1000;
                for (int i = l; i <= r; i++) {
                    a[i] += val;
                }
                segment_tree.update(l, r, val);
            } else {
                ll expected = 0;
                for (int i = l; i <= r; i++) {
                    expected += a[i];
                }

                if (segment_tree.query(l, r) != expected) {
                    return 1;
                }
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
