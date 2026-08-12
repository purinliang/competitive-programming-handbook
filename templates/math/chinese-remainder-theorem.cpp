// 随机验证：../verification/chinese-remainder-theorem-random.cpp
// 经典 CRT；模数必须两两互质，模数乘积必须能放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;
typedef __int128 i128;

ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }

    ll x1, y1;
    ll g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

ll mod_norm(i128 x, ll mod) {
    x %= mod;
    if (x < 0) {
        x += mod;
    }
    return static_cast<ll>(x);
}

bool crt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& mod) {
    mod = 1;
    for (ll x : m) {
        mod *= x;
    }

    ans = 0;
    for (int i = 0; i < static_cast<int>(a.size()); i++) {
        ll partial_mod = mod / m[i];
        ll inverse, y;
        if (exgcd(partial_mod, m[i], inverse, y) != 1) {
            return false;
        }

        i128 term = static_cast<i128>(mod_norm(a[i], m[i])) * partial_mod * inverse;
        ans = mod_norm(static_cast<i128>(ans) + term, mod);
    }
    return true;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n);
    vector<ll> m(n);
    for (int i = 0; i < n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    ll ans, mod;
    if (!crt(a, m, ans, mod)) {
        printf("Moduli are not pairwise coprime\n");
        return 0;
    }

    printf("%lld %lld\n", ans, mod);
    return 0;
}
