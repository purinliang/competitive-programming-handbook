// 随机验证：../verification/multiple-knapsack-random.cpp
// 多重背包最大价值；数量先按容量截断，再二进制拆成 0-1 组合物品。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll multiple_knapsack(const vector<int>& weight, const vector<ll>& value,
                     const vector<int>& quantity, int n, int capacity) {
    vector<ll> dp(capacity + 5, 0);

    for (int i = 1; i <= n; i++) {
        int remaining_quantity = min(quantity[i], capacity / weight[i]);
        int group_size = 1;

        while (remaining_quantity > 0) {
            int take = min(group_size, remaining_quantity);
            int group_weight = take * weight[i];
            ll group_value = take * value[i];

            for (int c = capacity; c >= group_weight; c--) {
                dp[c] = max(dp[c], dp[c - group_weight] + group_value);
            }

            remaining_quantity -= take;
            group_size *= 2;
        }
    }
    return dp[capacity];
}

int main() {
    int n, capacity;
    scanf("%d%d", &n, &capacity);

    vector<int> weight(n + 5);
    vector<ll> value(n + 5);
    vector<int> quantity(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d%lld%d", &weight[i], &value[i], &quantity[i]);
    }

    printf("%lld\n", multiple_knapsack(weight, value, quantity, n, capacity));
    return 0;
}
