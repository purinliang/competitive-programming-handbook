// 随机验证：../verification/linear-transformations-as-matrices-random.cpp
// 使用整数矩阵表示线性变换；中间结果必须能放入 64 位整数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns), value(rows + 5, vector<ll>(columns + 5)) {}
};

vector<ll> apply_transformation(const Matrix& transformation, const vector<ll>& input) {
    vector<ll> output(transformation.rows + 5);
    for (int i = 1; i <= transformation.rows; i++) {
        for (int j = 1; j <= transformation.columns; j++) {
            output[i] += transformation.value[i][j] * input[j];
        }
    }
    return output;
}

int main() {
    int input_size, output_size;
    scanf("%d%d", &input_size, &output_size);

    Matrix transformation(output_size, input_size);
    for (int i = 1; i <= output_size; i++) {
        for (int j = 1; j <= input_size; j++) {
            scanf("%lld", &transformation.value[i][j]);
        }
    }

    vector<ll> input(input_size + 5);
    for (int i = 1; i <= input_size; i++) {
        scanf("%lld", &input[i]);
    }

    vector<ll> output = apply_transformation(transformation, input);
    for (int i = 1; i <= output_size; i++) {
        if (i > 1) {
            printf(" ");
        }
        printf("%lld", output[i]);
    }
    printf("\n");
    return 0;
}
