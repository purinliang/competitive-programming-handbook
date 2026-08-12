// 随机验证：../verification/extended-chinese-remainder-theorem-random.cpp
// exCRT；允许模数不互质，最终最小公倍数必须能放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

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

ll normalize(ll x, ll m) {
    x %= m;
    if (x < 0) {
        x += m;
    }
    return x;
}

ll add_mod(ll a, ll b, ll m) {
    if (a >= m - b) {
        return a - (m - b);
    }
    return a + b;
}

ll mul_mod(ll a, ll b, ll m) {
    a = normalize(a, m);
    b = normalize(b, m);
    ll result = 0;
    while (b > 0) {
        if (b % 2 == 1) {
            result = add_mod(result, a, m);
        }
        a = add_mod(a, a, m);
        b /= 2;
    }
    return result;
}

bool merge_congruence(ll& a1, ll& m1, ll a2, ll m2) {
    ll s, y;
    ll g = exgcd(m1, m2, s, y);
    ll c = a2 - a1;
    if (c % g != 0) {
        return false;
    }

    ll period = m2 / g;
    ll t = mul_mod(s, c / g, period);

    ll new_M = m1 / g * m2;
    ll increment = mul_mod(m1, t, new_M);
    a1 = add_mod(a1, increment, new_M);
    m1 = new_M;
    return true;
}

bool excrt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& M) {
    ans = normalize(a[0], m[0]);
    M = m[0];
    int n = a.size();
    for (int i = 1; i < n; i++) {
        ll next_a = normalize(a[i], m[i]);
        if (!merge_congruence(ans, M, next_a, m[i])) {
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

    ll ans, M;
    if (!excrt(a, m, ans, M)) {
        printf("No solution\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
