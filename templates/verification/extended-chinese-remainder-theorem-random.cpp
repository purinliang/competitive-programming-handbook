// 用合并周期内的穷举对拍 exCRT 模板。

#define main extended_chinese_remainder_theorem_template_main
#include "../math/extended-chinese-remainder-theorem.cpp"
#undef main

ll oracle_normalize(ll x, ll m) {
    x %= m;
    if (x < 0) {
        x += m;
    }
    return x;
}

ll brute_excrt(int n, const vector<ll>& a, const vector<ll>& m, ll M) {
    for (ll x = 0; x < M; x++) {
        bool valid = true;
        for (int i = 1; i <= n; i++) {
            if (x % m[i] != oracle_normalize(a[i], m[i])) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return x;
        }
    }
    return -1;
}

int main() {
    mt19937 rng(20050314);

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 5) + 1;
        vector<ll> a(n + 5);
        vector<ll> m(n + 5);
        ll expected_mod = 1;
        for (int i = 1; i <= n; i++) {
            m[i] = static_cast<ll>(rng() % 9) + 2;
            a[i] = static_cast<ll>(rng() % 101) - 50;
            expected_mod = lcm(expected_mod, m[i]);
        }

        ll brute = brute_excrt(n, a, m, expected_mod);
        bool expected = brute != -1;

        auto [ans, M] = excrt(n, a, m);
        bool actual = ans != -1;
        if (actual != expected) {
            printf("existence mismatch on test %d\n", test);
            return 1;
        }

        if (actual &&
            (ans != brute || M != expected_mod || ans < 0 || ans >= M)) {
            printf("answer mismatch on test %d\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
