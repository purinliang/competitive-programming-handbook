// 用逐状态枚举有限件数随机验证多重背包。

#define main multiple_knapsack_template_main
#include "../dynamic-programming/multiple-knapsack.cpp"
#undef main

ll brute_force(const vector<int>& weight, const vector<ll>& value,
               const vector<int>& quantity, int n, int capacity) {
    vector<ll> previous(capacity + 5, 0);

    for (int i = 1; i <= n; i++) {
        vector<ll> current(capacity + 5, 0);

        for (int c = 0; c <= capacity; c++) {
            int maximum_count = min(quantity[i], c / weight[i]);

            for (int count = 0; count <= maximum_count; count++) {
                ll candidate =
                    previous[c - count * weight[i]] + count * value[i];
                current[c] = max(current[c], candidate);
            }
        }
        previous = current;
    }
    return previous[capacity];
}

int main() {
    {
        vector<int> weight(1 + 5);
        vector<ll> value(1 + 5);
        vector<int> quantity(1 + 5);
        weight[1] = 3;
        value[1] = 5;

        quantity[1] = 1;
        if (multiple_knapsack(weight, value, quantity, 1, 6) != 5) {
            return 1;
        }

        quantity[1] = 2;
        if (multiple_knapsack(weight, value, quantity, 1, 6) != 10) {
            return 1;
        }

        quantity[1] = 1000000000;
        if (multiple_knapsack(weight, value, quantity, 1, 6) != 10) {
            return 1;
        }
    }

    mt19937 rng(20260813);

    for (int test = 1; test <= 5000; test++) {
        int n = rng() % 10 + 1;
        int capacity = rng() % 61;
        vector<int> weight(n + 5);
        vector<ll> value(n + 5);
        vector<int> quantity(n + 5);

        for (int i = 1; i <= n; i++) {
            weight[i] = rng() % 20 + 1;
            value[i] = rng() % 1000001;
            if (rng() % 10 == 0) {
                quantity[i] = 1000000000;
            } else {
                quantity[i] = rng() % 21;
            }
        }

        ll expected = brute_force(weight, value, quantity, n, capacity);
        ll actual = multiple_knapsack(weight, value, quantity, n, capacity);

        if (actual != expected) {
            printf("test %d failed\n", test);
            return 1;
        }
    }

    printf("5000 random tests passed\n");
    return 0;
}
