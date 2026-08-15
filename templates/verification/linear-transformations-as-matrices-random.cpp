#include <bits/stdc++.h>
using namespace std;

#define main linear_transformations_as_matrices_template_main
#include "../math/linear-transformations-as-matrices.cpp"
#undef main

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, b.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int k = 1; k <= a.columns; k++) {
            for (int j = 1; j <= b.columns; j++) {
                answer.value[i][j] += a.value[i][k] * b.value[k][j];
            }
        }
    }
    return answer;
}

vector<ll> add(const vector<ll>& a, const vector<ll>& b, int size) {
    vector<ll> answer(size + 5);
    for (int i = 1; i <= size; i++) {
        answer[i] = a[i] + b[i];
    }
    return answer;
}

vector<ll> scale(const vector<ll>& a, int size, ll factor) {
    vector<ll> answer(size + 5);
    for (int i = 1; i <= size; i++) {
        answer[i] = a[i] * factor;
    }
    return answer;
}

vector<ll> random_vector(int size, mt19937& rng) {
    vector<ll> answer(size + 5);
    for (int i = 1; i <= size; i++) {
        answer[i] = (int)(rng() % 21) - 10;
    }
    return answer;
}

Matrix random_matrix(int rows, int columns, mt19937& rng) {
    Matrix answer(rows, columns);
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            answer.value[i][j] = (int)(rng() % 21) - 10;
        }
    }
    return answer;
}

bool equal(const vector<ll>& a, const vector<ll>& b, int size) {
    for (int i = 1; i <= size; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 10000; test++) {
        int input_size = rng() % 6 + 1;
        int output_size = rng() % 6 + 1;
        Matrix transformation = random_matrix(output_size, input_size, rng);
        vector<ll> u = random_vector(input_size, rng);
        vector<ll> v = random_vector(input_size, rng);
        ll factor = (int)(rng() % 11) - 5;

        vector<ll> left_add = apply_transformation(transformation, add(u, v, input_size));
        vector<ll> right_add = add(apply_transformation(transformation, u),
                                   apply_transformation(transformation, v), output_size);
        if (!equal(left_add, right_add, output_size)) {
            return 1;
        }

        vector<ll> left_scale = apply_transformation(transformation, scale(u, input_size, factor));
        vector<ll> right_scale =
            scale(apply_transformation(transformation, u), output_size, factor);
        if (!equal(left_scale, right_scale, output_size)) {
            return 1;
        }
    }

    for (int test = 1; test <= 10000; test++) {
        int input_size = rng() % 5 + 1;
        int middle_size = rng() % 5 + 1;
        int output_size = rng() % 5 + 1;
        Matrix first = random_matrix(middle_size, input_size, rng);
        Matrix second = random_matrix(output_size, middle_size, rng);
        vector<ll> input = random_vector(input_size, rng);

        vector<ll> step_by_step = apply_transformation(second, apply_transformation(first, input));
        vector<ll> combined = apply_transformation(multiply(second, first), input);
        if (!equal(step_by_step, combined, output_size)) {
            return 1;
        }
    }

    printf("10000 linearity and 10000 composition cases passed\n");
    return 0;
}
