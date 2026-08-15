// 随机验证：../verification/affine-transformations-random.cpp
// 合成二维整数平移、缩放和逆时针九十度旋转，再批量作用于点。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int DIMENSION = 3;

struct Matrix {
    vector<vector<ll>> value;

    Matrix() : value(DIMENSION + 5, vector<ll>(DIMENSION + 5)) {}
};

Matrix identity() {
    Matrix answer;
    for (int i = 1; i <= DIMENSION; i++) {
        answer.value[i][i] = 1;
    }
    return answer;
}

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer;
    for (int i = 1; i <= DIMENSION; i++) {
        for (int k = 1; k <= DIMENSION; k++) {
            for (int j = 1; j <= DIMENSION; j++) {
                answer.value[i][j] += a.value[i][k] * b.value[k][j];
            }
        }
    }
    return answer;
}

vector<ll> apply_transformation(const Matrix& transformation,
                                const vector<ll>& input) {
    vector<ll> output(DIMENSION + 5);
    for (int i = 1; i <= DIMENSION; i++) {
        for (int j = 1; j <= DIMENSION; j++) {
            output[i] += transformation.value[i][j] * input[j];
        }
    }
    return output;
}

Matrix translation(ll dx, ll dy) {
    Matrix answer = identity();
    answer.value[1][3] = dx;
    answer.value[2][3] = dy;
    return answer;
}

Matrix scaling(ll sx, ll sy) {
    Matrix answer = identity();
    answer.value[1][1] = sx;
    answer.value[2][2] = sy;
    return answer;
}

Matrix rotate_counterclockwise() {
    Matrix answer = identity();
    answer.value[1][1] = 0;
    answer.value[1][2] = -1;
    answer.value[2][1] = 1;
    answer.value[2][2] = 0;
    return answer;
}

int main() {
    int operation_count, point_count;
    scanf("%d%d", &operation_count, &point_count);

    Matrix combined = identity();
    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        Matrix current;
        if (type == 1) {
            ll dx, dy;
            scanf("%lld%lld", &dx, &dy);
            current = translation(dx, dy);
        } else if (type == 2) {
            ll sx, sy;
            scanf("%lld%lld", &sx, &sy);
            current = scaling(sx, sy);
        } else {
            current = rotate_counterclockwise();
        }
        combined = multiply(current, combined);
    }

    for (int i = 1; i <= point_count; i++) {
        ll x, y;
        scanf("%lld%lld", &x, &y);
        vector<ll> point(DIMENSION + 5);
        point[1] = x;
        point[2] = y;
        point[3] = 1;

        vector<ll> answer = apply_transformation(combined, point);
        printf("%lld %lld\n", answer[1], answer[2]);
    }
    return 0;
}
