#include <bits/stdc++.h>
using namespace std;

#define main binomial_coefficients_factorials_template_main
#include "../math/binomial-coefficients-factorials.cpp"
#undef main

int main() {
    const int max_n = 500;
    vector<vector<ll>> expected(max_n + 5, vector<ll>(max_n + 5));
    expected[0][0] = 1;
    for (int n = 1; n <= max_n; n++) {
        expected[n][0] = 1;
        expected[n][n] = 1;
        for (int k = 1; k < n; k++) {
            expected[n][k] = (expected[n - 1][k] + expected[n - 1][k - 1]) % MOD;
        }
    }

    Combinations combinations(max_n);
    for (int n = 0; n <= max_n; n++) {
        for (int k = -2; k <= n + 2; k++) {
            ll answer = k < 0 || k > n ? 0 : expected[n][k];
            if (combinations.choose(n, k) != answer) {
                return 1;
            }
        }
    }

    mt19937 rng(712367);
    for (int test = 1; test <= 10000; test++) {
        int n = rng() % (max_n + 1);
        int k = (int)(rng() % (max_n + 5)) - 2;
        ll answer = k < 0 || k > n ? 0 : expected[n][k];
        if (combinations.choose(n, k) != answer) {
            return 1;
        }
    }

    printf("all cases with n <= %d and 10000 random queries passed\n", max_n);
    return 0;
}
