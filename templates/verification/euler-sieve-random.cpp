#include <bits/stdc++.h>
using namespace std;

#define main euler_sieve_template_main
#include "../math/euler-sieve.cpp"
#undef main

int min_prime_brute(int x) {
    for (int divisor = 2; divisor <= x; divisor++) {
        if (x % divisor == 0) {
            return divisor;
        }
    }
    return 0;
}

int main() {
    const int MAXN = 5000;
    vector<int> expected_min_prime(MAXN + 5);
    for (int x = 2; x <= MAXN; x++) {
        expected_min_prime[x] = min_prime_brute(x);
    }

    vector<int> expected_primes;
    for (int n = 0; n <= MAXN; n++) {
        if (expected_min_prime[n] == n && n >= 2) {
            expected_primes.push_back(n);
        }

        auto [primes, min_prime] = euler_sieve(n);
        for (int x = 2; x <= n; x++) {
            if (min_prime[x] != expected_min_prime[x]) {
                return 1;
            }
        }
        if (primes != expected_primes) {
            return 1;
        }
    }

    printf("all n from 0 to 5000 passed\n");
    return 0;
}
