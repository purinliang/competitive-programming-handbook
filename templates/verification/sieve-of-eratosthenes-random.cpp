#include <bits/stdc++.h>
using namespace std;

#define main sieve_of_eratosthenes_template_main
#include "../math/sieve-of-eratosthenes.cpp"
#undef main

bool is_prime_brute(int x) {
    if (x < 2) {
        return false;
    }
    for (int divisor = 2; divisor <= x / divisor; divisor++) {
        if (x % divisor == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    for (int n = 0; n <= 5000; n++) {
        vector<int> expected;
        for (int x = 2; x <= n; x++) {
            if (is_prime_brute(x)) {
                expected.push_back(x);
            }
        }

        if (sieve(n) != expected) {
            return 1;
        }
    }

    printf("all n from 0 to 5000 passed\n");
    return 0;
}
