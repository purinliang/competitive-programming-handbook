#include <bits/stdc++.h>
using namespace std;

#define main euler_totient_template_main
#include "../math/euler-totient.cpp"
#undef main

ll brute_phi(ll n) {
    ll answer = 0;
    for (ll x = 1; x <= n; x++) {
        if (gcd(x, n) == 1) {
            answer++;
        }
    }
    return answer;
}

int main() {
    for (ll n = 1; n <= 5000; n++) {
        if (phi(n) != brute_phi(n)) {
            return 1;
        }
    }

    mt19937 rng(712367);
    for (int test = 1; test <= 3000; test++) {
        ll n = rng() % 10000 + 1;
        if (phi(n) != brute_phi(n)) {
            return 1;
        }
    }

    if (phi(1000000007) != 1000000006) {
        return 1;
    }
    if (phi(1LL << 40) != (1LL << 39)) {
        return 1;
    }

    printf("all n <= 5000, 3000 random cases, and large boundary cases passed\n");
    return 0;
}
