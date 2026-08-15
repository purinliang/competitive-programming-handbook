#include <bits/stdc++.h>
using namespace std;

#define main divisor_count_template_main
#include "../math/divisor-count.cpp"
#undef main

ll divisor_count_brute(ll n) {
    ll answer = 0;
    for (ll divisor = 1; divisor <= n / divisor; divisor++) {
        if (n % divisor != 0) {
            continue;
        }
        answer += 1;
        if (divisor != n / divisor) {
            answer += 1;
        }
    }
    return answer;
}

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        ll n = rng() % 1000000 + 1;
        if (divisor_count(n) != divisor_count_brute(n)) {
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
