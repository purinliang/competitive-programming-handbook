#include <bits/stdc++.h>
using namespace std;

#define main matrix_representation_template_main
#include "../math/matrix-representation.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        int rows = rng() % 30 + 1;
        int columns = rng() % 30 + 1;
        Matrix matrix(rows, columns);

        if (matrix.rows != rows || matrix.columns != columns) {
            return 1;
        }
        if ((int)matrix.value.size() != rows + 5) {
            return 1;
        }

        for (int i = 0; i < rows + 5; i++) {
            if ((int)matrix.value[i].size() != columns + 5) {
                return 1;
            }
        }

        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= columns; j++) {
                matrix.value[i][j] = (int)(rng() % 2001) - 1000;
            }
        }

        Matrix copied = matrix;
        if (copied.rows != rows || copied.columns != columns ||
            copied.value != matrix.value) {
            return 1;
        }
    }

    printf("10000 random matrix representations passed\n");
    return 0;
}
