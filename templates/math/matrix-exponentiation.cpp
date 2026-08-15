// 随机验证：../verification/matrix-exponentiation-random.cpp
// 计算 Fibonacci 数；矩阵快速幂函数可复用于固定维数线性递推。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns),
          value(rows + 5, vector<ll>(columns + 5)) {}
};

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, b.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int k = 1; k <= a.columns; k++) {
            for (int j = 1; j <= b.columns; j++) {
                answer.value[i][j] = (answer.value[i][j] +
                                      (__int128)a.value[i][k] * b.value[k][j]) %
                                     MOD;
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

Matrix power(Matrix base, ll exponent) {
    Matrix result = identity(base.rows);
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = multiply(result, base);
        }
        base = multiply(base, base);
        exponent /= 2;
    }
    return result;
}

vector<ll> apply_transformation(const Matrix& transformation,
                                const vector<ll>& input) {
    vector<ll> output(transformation.rows + 5);
    for (int i = 1; i <= transformation.rows; i++) {
        for (int j = 1; j <= transformation.columns; j++) {
            output[i] =
                (output[i] + (__int128)transformation.value[i][j] * input[j]) %
                MOD;
        }
    }
    return output;
}

int main() {
    ll n;
    scanf("%lld", &n);

    Matrix transition(2, 2);
    transition.value[1][1] = 1;
    transition.value[1][2] = 1;
    transition.value[2][1] = 1;

    vector<ll> initial(2 + 5);
    initial[1] = 1;
    initial[2] = 0;

    Matrix combined = power(transition, n);
    vector<ll> answer = apply_transformation(combined, initial);
    printf("%lld\n", answer[2]);
    return 0;
}
