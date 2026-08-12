// 随机验证：../verification/extended-chinese-remainder-theorem-random.cpp
// exCRT；允许模数不互质，最终最小公倍数必须能放入 ll。

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

bool merge_congruence(ll& a1, ll& m1, ll a2, ll m2) {
    ll s, y;
    ll g = exgcd(m1, m2, s, y);
    ll c = a2 - a1;
    if (c % g != 0) {
        return false;
    }

    ll period = m2 / g;
    ll t = mod_norm(static_cast<i128>(s) * (c / g), period);

    ll new_mod = m1 / g * m2;
    a1 = mod_norm(static_cast<i128>(a1) + static_cast<i128>(m1) * t, new_mod);
    m1 = new_mod;
    return true;
}

bool excrt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& mod) {
    ans = mod_norm(a[0], m[0]);
    mod = m[0];
    for (int i = 1; i < static_cast<int>(a.size()); i++) {
        ll next_ans = mod_norm(a[i], m[i]);
        if (!merge_congruence(ans, mod, next_ans, m[i])) {
            return false;
        }
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
    if (!excrt(a, m, ans, mod)) {
        printf("No solution\n");
        return 0;
    }

    printf("%lld %lld\n", ans, mod);
    return 0;
}
