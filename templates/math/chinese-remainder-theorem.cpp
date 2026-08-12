// 随机验证：../verification/chinese-remainder-theorem-random.cpp
// 经典 CRT；模数必须两两互质，模数乘积必须能放入 ll。

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

bool crt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& M) {
    M = 1;
    for (ll x : m) {
        M *= x;
    }

    ans = 0;
    int n = a.size();
    for (int i = 0; i < n; i++) {
        ll Mi = M / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return false;
        }

        ll term = mul_mod(normalize(a[i], m[i]), Mi, M);
        term = mul_mod(term, normalize(ti, m[i]), M);
        ans = add_mod(ans, term, M);
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
    if (!crt(a, m, ans, M)) {
        printf("Moduli are not pairwise coprime\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
