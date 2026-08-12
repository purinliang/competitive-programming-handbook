// 用直接枚举区间对拍一维前缀和。

#define main prefix_sums_template_main
#include "../algorithm-basics/prefix-sums.cpp"
#undef main

int main() {
    mt19937 rng(20050314);

    for (int test = 1; test <= 10000; test++) {
        n = static_cast<int>(rng() % 100) + 1;
        vector<ll> a(n + 1);
        prefix[0] = 0;
        for (int i = 1; i <= n; i++) {
            a[i] = static_cast<int>(rng() % 2001) - 1000;
            prefix[i] = prefix[i - 1] + a[i];
        }

        for (int query = 1; query <= 100; query++) {
            int l = static_cast<int>(rng() % n) + 1;
            int r = static_cast<int>(rng() % n) + 1;
            if (l > r) {
                swap(l, r);
            }

            ll expected = 0;
            for (int i = l; i <= r; i++) {
                expected += a[i];
            }
            if (range_sum(l, r) != expected) {
                printf("test %d query %d failed\n", test, query);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
