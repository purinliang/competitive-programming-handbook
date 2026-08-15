// 验证题：https://www.luogu.com.cn/problem/P3372
// 区间增加，区间求和。

#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct SegmentTree {
    int n;
    vector<ll> tree;
    vector<ll> lazy;

    SegmentTree(int n, const vector<ll>& a)
        : n(n), tree(4 * n + 5), lazy(4 * n + 5) {
        build(1, 1, n, a);
    }

    void pull(int u) {
        tree[u] = tree[u * 2] + tree[u * 2 + 1];
    }

    void apply(int u, int l, int r, ll val) {
        tree[u] += val * (r - l + 1);
        lazy[u] += val;
    }

    void push(int u, int l, int r) {
        if (lazy[u] == 0) {
            return;
        }
        int mid = (l + r) / 2;
        apply(u * 2, l, mid, lazy[u]);
        apply(u * 2 + 1, mid + 1, r, lazy[u]);
        lazy[u] = 0;
    }

    void build(int u, int l, int r, const vector<ll>& a) {
        if (l == r) {
            tree[u] = a[l];
            return;
        }
        int mid = (l + r) / 2;
        build(u * 2, l, mid, a);
        build(u * 2 + 1, mid + 1, r, a);
        pull(u);
    }

    void update(int u, int l, int r, int ql, int qr, ll val) {
        if (ql <= l && r <= qr) {
            apply(u, l, r, val);
            return;
        }
        push(u, l, r);
        int mid = (l + r) / 2;
        if (ql <= mid) {
            update(u * 2, l, mid, ql, qr, val);
        }
        if (qr > mid) {
            update(u * 2 + 1, mid + 1, r, ql, qr, val);
        }
        pull(u);
    }

    ll query(int u, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) {
            return tree[u];
        }
        push(u, l, r);
        int mid = (l + r) / 2;
        ll res = 0;
        if (ql <= mid) {
            res += query(u * 2, l, mid, ql, qr);
        }
        if (qr > mid) {
            res += query(u * 2 + 1, mid + 1, r, ql, qr);
        }
        return res;
    }

    void update(int l, int r, ll val) {
        update(1, 1, n, l, r, val);
    }

    ll query(int l, int r) {
        return query(1, 1, n, l, r);
    }
};

int main() {
    int n;
    int m;
    scanf("%d%d", &n, &m);

    vector<ll> a(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%lld", &a[i]);
    }

    SegmentTree segment(n, a);

    while (m--) {
        int op;
        int l;
        int r;
        scanf("%d%d%d", &op, &l, &r);
        if (op == 1) {
            ll val;
            scanf("%lld", &val);
            segment.update(l, r, val);
        } else {
            printf("%lld\n", segment.query(l, r));
        }
    }
    return 0;
}
