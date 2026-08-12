// 用合并周期内的穷举对拍 exCRT 模板。

#define main extended_chinese_remainder_theorem_template_main
#include "../math/extended-chinese-remainder-theorem.cpp"
#undef main

ll brute_excrt(const vector<ll>& a, const vector<ll>& m, ll M) {
    int n = a.size();
    for (ll x = 0; x < M; x++) {
        bool valid = true;
        for (int i = 0; i < n; i++) {
            if (x % m[i] != normalize(a[i], m[i])) {
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

    ll large_m = LLONG_MAX - 58;
    if (add_mod(large_m - 2, large_m - 3, large_m) != large_m - 5 ||
        mul_mod(large_m - 2, large_m - 3, large_m) != 6) {
        printf("large modular arithmetic mismatch\n");
        return 1;
    }

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 5) + 1;
        vector<ll> a(n);
        vector<ll> m(n);
        ll expected_mod = 1;
        for (int i = 0; i < n; i++) {
            m[i] = static_cast<ll>(rng() % 9) + 2;
            a[i] = static_cast<ll>(rng() % 101) - 50;
            expected_mod = lcm(expected_mod, m[i]);
        }

        ll brute = brute_excrt(a, m, expected_mod);
        bool expected = brute != -1;

        ll ans, M;
        bool actual = excrt(a, m, ans, M);
        if (actual != expected) {
            printf("existence mismatch on test %d\n", test);
            return 1;
        }

        if (actual && (ans != brute || M != expected_mod || ans < 0 || ans >= M)) {
            printf("answer mismatch on test %d\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
