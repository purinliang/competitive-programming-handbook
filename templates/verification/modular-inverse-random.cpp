#include <bits/stdc++.h>
using namespace std;

#define main modular_inverse_template_main
#include "../math/modular-inverse.cpp"
#undef main

ll brute_inverse(ll a, ll m) {
    a %= m;
    if (a < 0) {
        a += m;
    }
    for (ll x = 0; x < m; x++) {
        if (a * x % m == 1) {
            return x;
        }
    }
    return -1;
}

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        ll a = (int)(rng() % 2001) - 1000;
        ll m = rng() % 1000 + 2;

        ll expected = brute_inverse(a, m);
        ll actual = inverse(a, m);
        if (actual != expected) {
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
