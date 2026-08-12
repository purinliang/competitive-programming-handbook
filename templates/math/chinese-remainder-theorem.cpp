// 随机验证：../verification/chinese-remainder-theorem-random.cpp
// 经典 CRT；模数必须两两互质，模数乘积必须能放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll normalize(ll x, ll mod) {
    x %= mod;
    if (x < 0) {
        x += mod;
    }
    return x;
}

ll add_mod(ll a, ll b, ll mod) {
    if (a >= mod - b) {
        return a - (mod - b);
    }
    return a + b;
}

ll multiply_mod(ll a, ll b, ll mod) {
    a = normalize(a, mod);
    b = normalize(b, mod);

    ll result = 0;
    while (b > 0) {
        if (b % 2 == 1) {
            result = add_mod(result, a, mod);
        }
        a = add_mod(a, a, mod);
        b /= 2;
    }
    return result;
}

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

pair<ll, ll> crt(int n, const vector<ll>& a, const vector<ll>& m) {
    ll M = 1;
    for (int i = 1; i <= n; i++) {
        M *= m[i];
    }

    ll ans = 0;
    for (int i = 1; i <= n; i++) {
        ll Mi = M / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return {-1, -1};
        }

        ll term = multiply_mod(a[i], Mi, M);
        term = multiply_mod(term, ti, M);
        ans = add_mod(ans, term, M);
    }
    return {ans, M};
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n + 5);
    vector<ll> m(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    auto [ans, M] = crt(n, a, m);
    if (ans == -1) {
        printf("Moduli are not pairwise coprime\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
