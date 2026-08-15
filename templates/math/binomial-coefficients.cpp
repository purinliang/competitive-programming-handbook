// 随机验证：../verification/binomial-coefficients-random.cpp
// Pascal 递推计算单个精确组合数；结果必须能够放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll binomial(int n, int k) {
    if (k < 0 || k > n) {
        return 0;
    }

    k = min(k, n - k);
    vector<ll> combination(k + 5);
    combination[0] = 1;

    for (int total = 1; total <= n; total++) {
        for (int chosen = min(total, k); chosen >= 1; chosen--) {
            combination[chosen] += combination[chosen - 1];
        }
    }
    return combination[k];
}

int main() {
    int n, k;
    scanf("%d%d", &n, &k);
    printf("%lld\n", binomial(n, k));
    return 0;
}
