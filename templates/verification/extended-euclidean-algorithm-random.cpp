// 随机验证最大公约数和裴蜀等式。

#define main extended_euclidean_algorithm_template_main
#include "../math/extended-euclidean-algorithm.cpp"
#undef main

int main() {
    mt19937_64 rng(20050314);

    for (int test = 1; test <= 100000; test++) {
        ll a = (ll)(rng() % 1000001);
        ll b = (ll)(rng() % 1000001);
        if (a == 0 && b == 0) {
            a = 1;
        }

        auto [g, x, y] = exgcd(a, b);
        if (g != gcd(a, b) || a * x + b * y != g) {
            printf("test %d failed: %lld %lld\n", test, a, b);
            return 1;
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
