#include <bits/stdc++.h>
using namespace std;

#define main matrix_addition_subtraction_template_main
#include "../math/matrix-addition-subtraction.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        int rows = rng() % 20 + 1;
        int columns = rng() % 20 + 1;
        Matrix a(rows, columns);
        Matrix b(rows, columns);

        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= columns; j++) {
                a.value[i][j] = (int)(rng() % 2001) - 1000;
                b.value[i][j] = (int)(rng() % 2001) - 1000;
            }
        }

        Matrix original_a = a;
        Matrix original_b = b;
        Matrix sum = add(a, b);
        Matrix difference = subtract(a, b);

        if (a.value != original_a.value || b.value != original_b.value) {
            return 1;
        }
        if (sum.rows != rows || sum.columns != columns) {
            return 1;
        }
        if (difference.rows != rows || difference.columns != columns) {
            return 1;
        }

        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= columns; j++) {
                if (sum.value[i][j] != a.value[i][j] + b.value[i][j]) {
                    return 1;
                }
                if (difference.value[i][j] != a.value[i][j] - b.value[i][j]) {
                    return 1;
                }
            }
        }

        Matrix recovered = subtract(sum, b);
        if (recovered.value != a.value) {
            return 1;
        }
    }

    printf("10000 random matrix addition and subtraction cases passed\n");
    return 0;
}
