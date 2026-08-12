// 用 __int128 作为独立答案，验证固定模数的 modint。

#define main mod_int_template_main
#include "../math/mod-int.cpp"
#undef main

ll oracle_normalize(ll value) {
    __int128 result = value;
    result %= MOD;
    if (result < 0) {
        result += MOD;
    }
    return (ll)result;
}

bool check(ll raw_a, ll raw_b) {
    mint a = raw_a;
    mint b = raw_b;

    ll expected_a = oracle_normalize(raw_a);
    ll expected_b = oracle_normalize(raw_b);
    if (a.value() != expected_a || b.value() != expected_b) {
        return false;
    }
    if ((a + b).value() != (ll)(((__int128)expected_a + expected_b) % MOD)) {
        return false;
    }

    __int128 difference = (__int128)expected_a - expected_b;
    difference %= MOD;
    if (difference < 0) {
        difference += MOD;
    }
    if ((a - b).value() != (ll)difference) {
        return false;
    }
    if ((a * b).value() != (ll)((__int128)expected_a * expected_b % MOD)) {
        return false;
    }

    mint x = a;
    x += b;
    if (x.value() != (a + b).value()) {
        return false;
    }
    x = a;
    x -= b;
    if (x.value() != (a - b).value()) {
        return false;
    }
    x = a;
    x *= b;
    return x.value() == (a * b).value();
}

int main() {
    vector<ll> fixed_values = {LLONG_MIN, -1000000000000000000LL, -1,       0,
                               1,         1000000000000000000LL,  LLONG_MAX};
    for (ll a : fixed_values) {
        for (ll b : fixed_values) {
            if (!check(a, b)) {
                printf("fixed test failed\n");
                return 1;
            }
        }
    }

    mt19937_64 rng(20050314);
    uniform_int_distribution<ll> value_distribution(LLONG_MIN, LLONG_MAX);
    for (int test = 1; test <= 100000; test++) {
        ll a = value_distribution(rng);
        ll b = value_distribution(rng);
        if (!check(a, b)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
