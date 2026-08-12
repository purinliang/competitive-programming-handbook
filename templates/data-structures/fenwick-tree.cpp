// 验证题：https://www.luogu.com.cn/problem/P3374
// 单点增加，区间求和。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 5e5 + 5;

int n, m;
ll tree[MAXN];

int lowbit (int x) {
    return x & -x;
}

void add (int x, ll val) {
    while (x <= n) {
        tree[x] += val;
        x += lowbit (x);
    }
}

ll prefix_sum (int x) {
    ll res = 0;
    while (x > 0) {
        res += tree[x];
        x -= lowbit (x);
    }
    return res;
}

ll range_sum (int l, int r) {
    return prefix_sum (r) - prefix_sum (l - 1);
}

int main () {
    scanf ("%d%d", &n, &m);
    for (int i = 1; i <= n; i++) {
        ll val;
        scanf ("%lld", &val);
        add (i, val);
    }

    while (m--) {
        int op, x, y;
        scanf ("%d%d%d", &op, &x, &y);
        if (op == 1) {
            add (x, y);
        } else {
            printf ("%lld\n", range_sum (x, y));
        }
    }
    return 0;
}
