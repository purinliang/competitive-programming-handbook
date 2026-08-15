// 随机验证：../verification/matrix-representation-random.cpp
// 使用 1-based 二维 vector 保存运行时大小的矩阵。

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

int main() {
    int rows, columns;
    scanf("%d%d", &rows, &columns);

    Matrix matrix(rows, columns);
    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            scanf("%lld", &matrix.value[i][j]);
        }
    }

    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", matrix.value[i][j]);
        }
        printf("\n");
    }
    return 0;
}
