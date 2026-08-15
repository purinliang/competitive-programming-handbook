#include <bits/stdc++.h>
using namespace std;

#define main fermat_little_theorem_template_main
#include "../math/fermat-little-theorem.cpp"
#undef main

ll brute_power(ll a, int exponent, ll p) {
    a %= p;
    if (a < 0) {
        a += p;
    }

    ll result = 1 % p;
    for (int i = 1; i <= exponent; i++) {
        result = result * a % p;
    }
    return result;
}

int main() {
    const vector<int> primes = {2,  3,  5,  7,  11, 13, 17, 19, 23,
                                29, 31, 37, 41, 43, 47, 53, 59, 61,
                                67, 71, 73, 79, 83, 89, 97};
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        ll a = (int)(rng() % 2001) - 1000;
        int exponent = rng() % 1001;
        ll p = primes[rng() % primes.size()];

        ll expected = brute_power(a, exponent, p);
        ll actual = fermat_power(a, to_string(exponent), p);
        if (actual != expected) {
            return 1;
        }

        ll normalized_a = a % p;
        if (normalized_a < 0) {
            normalized_a += p;
        }
        if (power(a, p, p) != normalized_a) {
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
