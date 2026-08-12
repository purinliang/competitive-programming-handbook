// 用小模数穷举对拍经典 CRT 模板。

#define main chinese_remainder_theorem_template_main
#include "../math/chinese-remainder-theorem.cpp"
#undef main

bool pairwise_coprime(const vector<ll>& m) {
    int n = m.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (gcd(m[i], m[j]) != 1) {
                return false;
            }
        }
    }
    return true;
}

ll oracle_normalize(ll x, ll m) {
    x %= m;
    if (x < 0) {
        x += m;
    }
    return x;
}

ll brute_crt(const vector<ll>& a, const vector<ll>& m, ll M) {
    int n = a.size();
    for (ll x = 0; x < M; x++) {
        bool valid = true;
        for (int i = 0; i < n; i++) {
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
        vector<ll> a(n);
        vector<ll> m(n);
        ll expected_mod = 1;
        for (int i = 0; i < n; i++) {
            m[i] = static_cast<ll>(rng() % 9) + 2;
            a[i] = static_cast<ll>(rng() % 101) - 50;
            expected_mod *= m[i];
        }

        bool expected = pairwise_coprime(m);
        ll ans, M;
        bool actual = crt(a, m, ans, M);
        if (actual != expected || M != expected_mod) {
            printf("existence mismatch on test %d\n", test);
            return 1;
        }

        if (actual) {
            ll brute = brute_crt(a, m, M);
            if (ans != brute || ans < 0 || ans >= M) {
                printf("answer mismatch on test %d\n", test);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
