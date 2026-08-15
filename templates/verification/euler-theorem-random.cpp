#include <bits/stdc++.h>
using namespace std;

#define main euler_theorem_template_main
#include "../math/euler-theorem.cpp"
#undef main

int main() {
    for (ll n = 1; n <= 500; n++) {
        ll period = phi(n);
        for (ll a = 1; a <= n; a++) {
            if (gcd(a, n) != 1) {
                continue;
            }
            if (power(a, period, n) != 1 % n) {
                return 1;
            }
        }
    }

    mt19937 rng(712367);
    for (int test = 1; test <= 20000; test++) {
        ll n = rng() % 1000 + 1;
        ll a = (int)(rng() % 2001) - 1000;
        if (gcd(a, n) != 1) {
            continue;
        }

        ll b = rng() % 1000000;
        ll expected = power(a, b, n);
        ll actual = power(a, b % phi(n), n);
        if (actual != expected) {
            return 1;
        }
    }

    if (power(2, 4, 8) == power(2, 4 % phi(8), 8)) {
        return 1;
    }

    printf(
        "all coprime residues with n <= 500 and 20000 random cases passed\n");
    return 0;
}
