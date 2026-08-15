#include <bits/stdc++.h>
using namespace std;

#define main binomial_coefficients_template_main
#include "../math/binomial-coefficients.cpp"
#undef main

ll binomial_reference(int n, int k) {
    if (k < 0 || k > n) {
        return 0;
    }
    k = min(k, n - k);

    __int128 answer = 1;
    for (int i = 1; i <= k; i++) {
        answer = answer * (n - k + i) / i;
    }
    return answer;
}

int main() {
    for (int n = 0; n <= 60; n++) {
        for (int k = -1; k <= n + 1; k++) {
            if (binomial(n, k) != binomial_reference(n, k)) {
                return 1;
            }
        }
    }

    printf("all C(n, k) with n <= 60 passed\n");
    return 0;
}
