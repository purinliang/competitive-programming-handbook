// 验证题：https://www.luogu.com.cn/problem/P3374
// 单点增加，区间求和。

#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct FenwickTree {
    int n;
    vector<ll> tree;

    FenwickTree(int n) : n(n), tree(n + 1) {}

    int lowbit(int x) const {
        return x & -x;
    }

    void add(int x, ll val) {
        while (x <= n) {
            tree[x] += val;
            x += lowbit(x);
        }
    }

    ll prefix_sum(int x) const {
        ll res = 0;
        while (x > 0) {
            res += tree[x];
            x -= lowbit(x);
        }
        return res;
    }

    ll range_sum(int l, int r) const {
        return prefix_sum(r) - prefix_sum(l - 1);
    }
};

int main() {
    int n;
    int m;
    scanf("%d%d", &n, &m);

    FenwickTree fenwick(n);
    for (int i = 1; i <= n; i++) {
        ll val;
        scanf("%lld", &val);
        fenwick.add(i, val);
    }

    while (m--) {
        int op;
        scanf("%d", &op);
        if (op == 1) {
            int x;
            ll val;
            scanf("%d%lld", &x, &val);
            fenwick.add(x, val);
        } else {
            int l;
            int r;
            scanf("%d%d", &l, &r);
            printf("%lld\n", fenwick.range_sum(l, r));
        }
    }
    return 0;
}
