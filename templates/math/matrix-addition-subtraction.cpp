// 随机验证：../verification/matrix-addition-subtraction-random.cpp
// 两个输入矩阵必须具有相同的行数和列数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns),
          value(rows + 5, vector<ll>(columns + 5)) {}
};

Matrix add(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] + b.value[i][j];
        }
    }
    return answer;
}

Matrix subtract(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] - b.value[i][j];
        }
    }
    return answer;
}

void print(const Matrix& matrix) {
    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", matrix.value[i][j]);
        }
        printf("\n");
    }
}

int main() {
    int rows, columns;
    scanf("%d%d", &rows, &columns);

    Matrix a(rows, columns);
    Matrix b(rows, columns);
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            scanf("%lld", &a.value[i][j]);
        }
    }
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            scanf("%lld", &b.value[i][j]);
        }
    }

    Matrix sum = add(a, b);
    Matrix difference = subtract(a, b);
    print(sum);
    printf("\n");
    print(difference);
    return 0;
}
