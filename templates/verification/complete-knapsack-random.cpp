// 用逐状态枚举当前种类件数随机验证完全背包。

#define main complete_knapsack_template_main
#include "../dynamic-programming/complete-knapsack.cpp"
#undef main

ll brute_force(const vector<int>& weight, const vector<ll>& value, int n,
               int capacity) {
    vector<ll> previous(capacity + 5, 0);

    for (int i = 1; i <= n; i++) {
        vector<ll> current(capacity + 5, 0);

        for (int c = 0; c <= capacity; c++) {
            for (int count = 0; count * weight[i] <= c; count++) {
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
        weight[1] = 3;
        value[1] = 5;

        if (complete_knapsack(weight, value, 1, 6) != 10) {
            return 1;
        }
    }

    mt19937 rng(20260813);

    for (int test = 1; test <= 5000; test++) {
        int n = rng() % 10 + 1;
        int capacity = rng() % 61;
        vector<int> weight(n + 5);
        vector<ll> value(n + 5);

        for (int i = 1; i <= n; i++) {
            weight[i] = rng() % 20 + 1;
            value[i] = rng() % 1000001;
        }

        ll expected = brute_force(weight, value, n, capacity);
        ll actual = complete_knapsack(weight, value, n, capacity);

        if (actual != expected) {
            printf("test %d failed\n", test);
            return 1;
        }
    }

    printf("5000 random tests passed\n");
    return 0;
}
