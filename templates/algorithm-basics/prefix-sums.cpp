// 随机验证：../verification/prefix-sums-random.cpp
// 一维前缀和；数组与询问均使用从 1 开始的下标。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 1e5 + 5;

int n, q;
ll prefix[MAXN];

ll range_sum(int l, int r) {
    return prefix[r] - prefix[l - 1];
}

int main() {
    scanf("%d%d", &n, &q);

    prefix[0] = 0;
    for (int i = 1; i <= n; i++) {
        ll val;
        scanf("%lld", &val);
        prefix[i] = prefix[i - 1] + val;
    }

    while (q--) {
        int l, r;
        scanf("%d%d", &l, &r);
        printf("%lld\n", range_sum(l, r));
    }
    return 0;
}
