// 随机验证：../verification/complete-knapsack-random.cpp
// 完全背包最大价值；物品种类从 1 开始编号，容量正序更新。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll complete_knapsack(const vector<int>& weight, const vector<ll>& value, int n,
                     int capacity) {
    vector<ll> dp(capacity + 5, 0);

    for (int i = 1; i <= n; i++) {
        for (int c = weight[i]; c <= capacity; c++) {
            dp[c] = max(dp[c], dp[c - weight[i]] + value[i]);
        }
    }
    return dp[capacity];
}

int main() {
    int n, capacity;
    scanf("%d%d", &n, &capacity);

    vector<int> weight(n + 5);
    vector<ll> value(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d%lld", &weight[i], &value[i]);
    }

    printf("%lld\n", complete_knapsack(weight, value, n, capacity));
    return 0;
}
