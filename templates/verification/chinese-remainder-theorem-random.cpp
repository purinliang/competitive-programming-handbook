// 用小模数穷举对拍经典 CRT 模板。

#define main chinese_remainder_theorem_template_main
#include "../math/chinese-remainder-theorem.cpp"
#undef main

bool pairwise_coprime(const vector<ll>& m) {
    for (int i = 0; i < static_cast<int>(m.size()); i++) {
        for (int j = i + 1; j < static_cast<int>(m.size()); j++) {
            if (gcd(m[i], m[j]) != 1) {
                return false;
            }
        }
    }
    return true;
}

ll brute_crt(const vector<ll>& a, const vector<ll>& m, ll mod) {
    for (ll x = 0; x < mod; x++) {
        bool valid = true;
        for (int i = 0; i < static_cast<int>(a.size()); i++) {
            if (x % m[i] != mod_norm(a[i], m[i])) {
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
        ll ans, mod;
        bool actual = crt(a, m, ans, mod);
        if (actual != expected || mod != expected_mod) {
            printf("existence mismatch on test %d\n", test);
            return 1;
        }

        if (actual) {
            ll brute = brute_crt(a, m, mod);
            if (ans != brute || ans < 0 || ans >= mod) {
                printf("answer mismatch on test %d\n", test);
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
