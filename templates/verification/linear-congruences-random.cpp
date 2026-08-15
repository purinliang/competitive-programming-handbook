#include <bits/stdc++.h>
using namespace std;

#define main linear_congruences_template_main
#include "../math/linear-congruences.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        ll a = (int)(rng() % 2001) - 1000;
        ll c = (int)(rng() % 20001) - 10000;
        ll m = rng() % 1000 + 1;

        CongruenceSolution solution = solve_congruence(a, c, m);

        vector<ll> expected;
        for (ll x = 0; x < m; x++) {
            ll value = (a * x - c) % m;
            if (value == 0) {
                expected.push_back(x);
            }
        }

        if (solution.exists != !expected.empty()) {
            return 1;
        }
        if (!solution.exists) {
            continue;
        }
        if (solution.count != (ll)expected.size() ||
            solution.first != expected[0]) {
            return 1;
        }
        for (ll k = 0; k < solution.count; k++) {
            if (solution.first + k * solution.step != expected[k]) {
                return 1;
            }
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
