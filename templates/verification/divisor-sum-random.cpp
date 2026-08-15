#include <bits/stdc++.h>
using namespace std;

#define main divisor_sum_template_main
#include "../math/divisor-sum.cpp"
#undef main

ll divisor_sum_brute(ll n) {
    ll answer = 0;
    for (ll divisor = 1; divisor <= n / divisor; divisor++) {
        if (n % divisor != 0) {
            continue;
        }
        answer += divisor;
        if (divisor != n / divisor) {
            answer += n / divisor;
        }
    }
    return answer;
}

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        ll n = rng() % 1000000 + 1;
        if (divisor_sum(n) != divisor_sum_brute(n)) {
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
