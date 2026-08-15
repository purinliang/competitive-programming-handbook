#include <bits/stdc++.h>
using namespace std;

#define main fast_power_template_main
#include "../math/fast-power.cpp"
#undef main

int main() {
    mt19937_64 rng(712367);

    for (int test = 1; test <= 100000; test++) {
        ll base = (ll)(rng() % (2 * MOD)) - MOD;
        ll exponent = rng() % 1000;

        ll normalized = base % MOD;
        if (normalized < 0) {
            normalized += MOD;
        }

        ll expected = 1;
        for (ll i = 1; i <= exponent; i++) {
            expected = expected * normalized % MOD;
        }

        if (power(base, exponent) != expected) {
            return 1;
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
