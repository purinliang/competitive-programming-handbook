// 随机验证扩展欧几里得及其三个常用接口。

#define main extended_euclidean_algorithm_template_main
#include "../math/extended-euclidean-algorithm.cpp"
#undef main

int main() {
    mt19937_64 rng(20050314);

    for (int test = 1; test <= 100000; test++) {
        ll a = static_cast<ll>(rng() % 1000001);
        ll b = static_cast<ll>(rng() % 1000001);
        if (a == 0 && b == 0) {
            a = 1;
        }

        ll x, y;
        ll g = exgcd(a, b, x, y);
        if (g != gcd(a, b) || a * x + b * y != g) {
            printf("exgcd mismatch on test %d: %lld %lld\n", test, a, b);
            return 1;
        }

        ll c = static_cast<ll>(rng() % 2000001) - 1000000;
        bool expected = c % g == 0;
        bool actual = solve_equation(a, b, c, x, y);
        if (actual != expected || (actual && a * x + b * y != c)) {
            printf("equation mismatch on test %d: %lld %lld %lld\n", test, a, b, c);
            return 1;
        }

        ll m = static_cast<ll>(rng() % 1000000) + 2;
        a = static_cast<ll>(rng() % 1000001);
        c = static_cast<ll>(rng() % 2000001) - 1000000;
        g = gcd(a, m);
        expected = c % g == 0;

        ll period;
        actual = solve_congruence(a, c, m, x, period);
        if (actual != expected ||
            (actual && (period != m / g || x < 0 || x >= period || (a * x - c) % m != 0))) {
            printf("congruence mismatch on test %d: %lld %lld %lld\n", test, a, c, m);
            return 1;
        }

        expected = g == 1;
        actual = inverse(a, m, x);
        if (actual != expected || (actual && (a * x - 1) % m != 0)) {
            printf("inverse mismatch on test %d: %lld %lld\n", test, a, m);
            return 1;
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
