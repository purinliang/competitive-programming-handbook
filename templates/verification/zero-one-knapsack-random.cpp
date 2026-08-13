// 用子集枚举随机验证 0-1 背包。

#define main zero_one_knapsack_template_main
#include "../dynamic-programming/zero-one-knapsack.cpp"
#undef main

ll brute_force(const vector<int>& weight, const vector<ll>& value, int n, int capacity) {
    ll answer = 0;

    for (int mask = 0; mask < (1 << n); mask++) {
        int total_weight = 0;
        ll total_value = 0;

        for (int i = 1; i <= n; i++) {
            if (mask >> (i - 1) & 1) {
                total_weight += weight[i];
                total_value += value[i];
            }
        }

        if (total_weight <= capacity) {
            answer = max(answer, total_value);
        }
    }
    return answer;
}

int main() {
    {
        vector<int> weight(1 + 5);
        vector<ll> value(1 + 5);
        weight[1] = 3;
        value[1] = 5;

        if (zero_one_knapsack(weight, value, 1, 6) != 5) {
            return 1;
        }
    }

    mt19937 rng(20260813);

    for (int test = 1; test <= 5000; test++) {
        int n = rng() % 14 + 1;
        int capacity = rng() % 101;
        vector<int> weight(n + 5);
        vector<ll> value(n + 5);

        for (int i = 1; i <= n; i++) {
            weight[i] = rng() % 30 + 1;
            value[i] = rng() % 1000001;
        }

        ll expected = brute_force(weight, value, n, capacity);
        ll actual = zero_one_knapsack(weight, value, n, capacity);

        if (actual != expected) {
            printf("test %d failed\n", test);
            return 1;
        }
    }

    printf("5000 random tests passed\n");
    return 0;
}
