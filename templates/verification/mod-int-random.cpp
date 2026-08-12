// 用 __int128 作为独立答案，验证接近 64 位整数上限的模运算。

#define main mod_int_template_main
#include "../math/mod-int.cpp"
#undef main

ll oracle_normalize(ll x, ll m) {
    __int128 result = x;
    result %= m;
    if (result < 0) {
        result += m;
    }
    return static_cast<ll>(result);
}

ll oracle_add(ll a, ll b, ll m) {
    return static_cast<ll>((static_cast<__int128>(a) + b) % m);
}

ll oracle_subtract(ll a, ll b, ll m) {
    __int128 result = static_cast<__int128>(a) - b;
    result %= m;
    if (result < 0) {
        result += m;
    }
    return static_cast<ll>(result);
}

ll oracle_multiply(ll a, ll b, ll m) {
    return static_cast<ll>(static_cast<__int128>(a) * b % m);
}

bool check(ll m, ll raw_a, ll raw_b) {
    mint::set_mod(m);
    mint a = raw_a;
    mint b = raw_b;

    ll expected_a = oracle_normalize(raw_a, m);
    ll expected_b = oracle_normalize(raw_b, m);
    if (a.value() != expected_a || b.value() != expected_b) {
        return false;
    }
    if ((a + b).value() != oracle_add(expected_a, expected_b, m)) {
        return false;
    }
    if ((a - b).value() != oracle_subtract(expected_a, expected_b, m)) {
        return false;
    }
    if ((a * b).value() != oracle_multiply(expected_a, expected_b, m)) {
        return false;
    }

    mint x = a;
    x += b;
    if (x.value() != oracle_add(expected_a, expected_b, m)) {
        return false;
    }
    x = a;
    x -= b;
    if (x.value() != oracle_subtract(expected_a, expected_b, m)) {
        return false;
    }
    x = a;
    x *= b;
    return x.value() == oracle_multiply(expected_a, expected_b, m);
}

int main() {
    vector<ll> fixed_moduli = {1, 2, 15, 1000000007, LLONG_MAX - 58, LLONG_MAX};
    vector<ll> fixed_values = {LLONG_MIN, -1000000000000000000LL, -1,       0,
                               1,         1000000000000000000LL,  LLONG_MAX};
    for (ll m : fixed_moduli) {
        for (ll a : fixed_values) {
            for (ll b : fixed_values) {
                if (!check(m, a, b)) {
                    printf("fixed test failed\n");
                    return 1;
                }
            }
        }
    }

    mt19937_64 rng(20050314);
    uniform_int_distribution<ll> modulus_distribution(1, LLONG_MAX);
    uniform_int_distribution<ll> value_distribution(LLONG_MIN, LLONG_MAX);
    for (int test = 1; test <= 100000; test++) {
        ll m = modulus_distribution(rng);
        ll a = value_distribution(rng);
        ll b = value_distribution(rng);
        if (!check(m, a, b)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
