// 用小模数穷举对拍经典 CRT 模板。

#define main chinese_remainder_theorem_template_main
#include "../math/chinese-remainder-theorem.cpp"
#undef main

bool pairwise_coprime(int n, const vector<ll>& m) {
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
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

ll oracle_multiply(ll a, ll b, ll m) {
    __int128 x = a;
    __int128 y = b;
    x %= m;
    y %= m;
    if (x < 0) {
        x += m;
    }
    if (y < 0) {
        y += m;
    }
    return (ll)(x * y % m);
}

bool check_multiply_mod() {
    vector<ll> moduli = {1, 2, 15, 1000000007, LLONG_MAX - 58, LLONG_MAX};
    vector<ll> values = {LLONG_MIN, -1000000000000000000LL, -1,       0,
                         1,         1000000000000000000LL,  LLONG_MAX};
    for (ll mod : moduli) {
        for (ll a : values) {
            for (ll b : values) {
                if (multiply_mod(a, b, mod) != oracle_multiply(a, b, mod)) {
                    return false;
                }
            }
        }
    }
    return true;
}

ll brute_crt(int n, const vector<ll>& a, const vector<ll>& m, ll M) {
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
    if (!check_multiply_mod()) {
        printf("multiply_mod failed\n");
        return 1;
    }

    mt19937 rng(20050314);

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 5) + 1;
        vector<ll> a(n + 5);
        vector<ll> m(n + 5);
        ll expected_mod = 1;
        for (int i = 1; i <= n; i++) {
            m[i] = static_cast<ll>(rng() % 9) + 2;
            a[i] = static_cast<ll>(rng() % 101) - 50;
            expected_mod *= m[i];
        }

        bool expected = pairwise_coprime(n, m);
        auto [ans, M] = crt(n, a, m);
        bool actual = ans != -1;
        if (actual != expected) {
            printf("existence mismatch on test %d\n", test);
            return 1;
        }

        if (actual) {
            ll brute = brute_crt(n, a, m, M);
            if (ans != brute || M != expected_mod || ans < 0 || ans >= M) {
                printf("answer mismatch on test %d\n", test);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
