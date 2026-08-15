#include <bits/stdc++.h>
using namespace std;

#define main affine_transformations_template_main
#include "../math/affine-transformations.cpp"
#undef main

struct Operation {
    int type;
    ll first;
    ll second;
};

Matrix get_transformation(const Operation& operation) {
    if (operation.type == 1) {
        return translation(operation.first, operation.second);
    }
    if (operation.type == 2) {
        return scaling(operation.first, operation.second);
    }
    return rotate_counterclockwise();
}

pair<ll, ll> apply_directly(pair<ll, ll> point, const Operation& operation) {
    auto [x, y] = point;
    if (operation.type == 1) {
        return {x + operation.first, y + operation.second};
    }
    if (operation.type == 2) {
        return {x * operation.first, y * operation.second};
    }
    return {-y, x};
}

int main() {
    mt19937 rng(9283746);
    for (int test = 1; test <= 10000; test++) {
        int operation_count = rng() % 20 + 1;
        vector<Operation> operations(operation_count + 5);
        Matrix combined = identity();

        for (int i = 1; i <= operation_count; i++) {
            operations[i].type = rng() % 3 + 1;
            if (operations[i].type == 1) {
                operations[i].first = (int)(rng() % 11) - 5;
                operations[i].second = (int)(rng() % 11) - 5;
            } else if (operations[i].type == 2) {
                operations[i].first = (int)(rng() % 3) - 1;
                operations[i].second = (int)(rng() % 3) - 1;
            }
            combined = multiply(get_transformation(operations[i]), combined);
        }

        pair<ll, ll> expected = {(int)(rng() % 21) - 10, (int)(rng() % 21) - 10};
        vector<ll> point(DIMENSION + 5);
        point[1] = expected.first;
        point[2] = expected.second;
        point[3] = 1;

        for (int i = 1; i <= operation_count; i++) {
            expected = apply_directly(expected, operations[i]);
        }

        vector<ll> actual = apply_transformation(combined, point);
        if (actual[1] != expected.first || actual[2] != expected.second || actual[3] != 1) {
            return 1;
        }

        vector<ll> direction(DIMENSION + 5);
        direction[1] = (int)(rng() % 21) - 10;
        direction[2] = (int)(rng() % 21) - 10;
        vector<ll> translated = apply_transformation(translation(7, -4), direction);
        if (translated != direction) {
            return 1;
        }
    }

    printf("10000 affine composition and direction cases passed\n");
    return 0;
}
