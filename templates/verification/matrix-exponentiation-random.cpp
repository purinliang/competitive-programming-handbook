#include <bits/stdc++.h>
using namespace std;

#define main matrix_exponentiation_template_main
#include "../math/matrix-exponentiation.cpp"
#undef main

bool equal(const Matrix& a, const Matrix& b) {
    if (a.rows != b.rows || a.columns != b.columns) {
        return false;
    }
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            if (a.value[i][j] != b.value[i][j]) {
                return false;
            }
        }
    }
    return true;
}

Matrix random_matrix(int n, mt19937& rng) {
    Matrix answer(n, n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            answer.value[i][j] = rng() % 1000;
        }
    }
    return answer;
}

Matrix repeated_power(const Matrix& base, int exponent) {
    Matrix answer = identity(base.rows);
    for (int i = 1; i <= exponent; i++) {
        answer = multiply(answer, base);
    }
    return answer;
}

ll fibonacci(int n) {
    if (n == 0) {
        return 0;
    }
    ll previous = 0;
    ll current = 1;
    for (int i = 2; i <= n; i++) {
        ll next = (previous + current) % MOD;
        previous = current;
        current = next;
    }
    return current;
}

ll matrix_fibonacci(int n) {
    Matrix transition(2, 2);
    transition.value[1][1] = 1;
    transition.value[1][2] = 1;
    transition.value[2][1] = 1;

    vector<ll> initial(2 + 5);
    initial[1] = 1;

    Matrix combined = power(transition, n);
    return apply_transformation(combined, initial)[2];
}

int main() {
    for (int n = 0; n <= 10000; n++) {
        if (matrix_fibonacci(n) != fibonacci(n)) {
            return 1;
        }
    }

    mt19937 rng(18273645);
    for (int test = 1; test <= 10000; test++) {
        int n = rng() % 4 + 1;
        int exponent = rng() % 21;
        Matrix base = random_matrix(n, rng);

        if (!equal(power(base, exponent), repeated_power(base, exponent))) {
            return 1;
        }

        int left_exponent = rng() % 11;
        int right_exponent = rng() % 11;
        Matrix combined = multiply(power(base, left_exponent), power(base, right_exponent));
        if (!equal(combined, power(base, left_exponent + right_exponent))) {
            return 1;
        }
    }

    printf("Fibonacci 0..10000 and 10000 random matrix cases passed\n");
    return 0;
}
