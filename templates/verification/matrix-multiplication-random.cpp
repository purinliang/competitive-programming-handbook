#include <bits/stdc++.h>
using namespace std;

#define main matrix_multiplication_template_main
#include "../math/matrix-multiplication.cpp"
#undef main

Matrix reference_multiply(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, b.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= b.columns; j++) {
            for (int k = 1; k <= a.columns; k++) {
                answer.value[i][j] =
                    (answer.value[i][j] + (__int128)a.value[i][k] * b.value[k][j]) % MOD;
            }
        }
    }
    return answer;
}

bool equal(const Matrix& a, const Matrix& b) {
    return a.rows == b.rows && a.columns == b.columns && a.value == b.value;
}

Matrix random_matrix(int rows, int columns, mt19937& rng) {
    Matrix matrix(rows, columns);
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            matrix.value[i][j] = rng() % MOD;
        }
    }
    return matrix;
}

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        int rows = rng() % 6 + 1;
        int middle = rng() % 6 + 1;
        int columns = rng() % 6 + 1;
        Matrix a = random_matrix(rows, middle, rng);
        Matrix b = random_matrix(middle, columns, rng);

        Matrix expected = reference_multiply(a, b);
        Matrix actual = multiply(a, b);
        if (!equal(actual, expected)) {
            return 1;
        }

        Matrix left_identity = identity(rows);
        Matrix right_identity = identity(middle);
        if (!equal(multiply(left_identity, a), a)) {
            return 1;
        }
        if (!equal(multiply(a, right_identity), a)) {
            return 1;
        }
    }

    for (int test = 1; test <= 3000; test++) {
        int a_size = rng() % 5 + 1;
        int b_size = rng() % 5 + 1;
        int c_size = rng() % 5 + 1;
        int d_size = rng() % 5 + 1;
        Matrix a = random_matrix(a_size, b_size, rng);
        Matrix b = random_matrix(b_size, c_size, rng);
        Matrix c = random_matrix(c_size, d_size, rng);

        Matrix left = multiply(multiply(a, b), c);
        Matrix right = multiply(a, multiply(b, c));
        if (!equal(left, right)) {
            return 1;
        }
    }

    printf("10000 products and 3000 associativity cases passed\n");
    return 0;
}
