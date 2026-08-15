// 随机验证：../verification/matrix-multiplication-random.cpp
// 固定模数矩阵乘法；输入元素必须已经规范到 [0, MOD - 1]。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns), value(rows + 5, vector<ll>(columns + 5)) {}
};

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, b.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int k = 1; k <= a.columns; k++) {
            for (int j = 1; j <= b.columns; j++) {
                answer.value[i][j] =
                    (answer.value[i][j] + (__int128)a.value[i][k] * b.value[k][j]) % MOD;
            }
        }
    }
    return answer;
}

Matrix identity(int n) {
    Matrix answer(n, n);
    for (int i = 1; i <= n; i++) {
        answer.value[i][i] = 1;
    }
    return answer;
}

int main() {
    int rows, middle, columns;
    scanf("%d%d%d", &rows, &middle, &columns);

    Matrix a(rows, middle);
    Matrix b(middle, columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            scanf("%lld", &a.value[i][j]);
        }
    }
    for (int i = 1; i <= b.rows; i++) {
        for (int j = 1; j <= b.columns; j++) {
            scanf("%lld", &b.value[i][j]);
        }
    }

    Matrix answer = multiply(a, b);
    for (int i = 1; i <= answer.rows; i++) {
        for (int j = 1; j <= answer.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", answer.value[i][j]);
        }
        printf("\n");
    }
    return 0;
}
