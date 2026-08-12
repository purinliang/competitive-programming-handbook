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

pair<ll, ll> crt(int n, const vector<ll>& a, const vector<ll>& m) {
    ll M = 1;
    for (int i = 1; i <= n; i++) {
        M *= m[i];
    }

    __int128 ans = 0;
    for (int i = 1; i <= n; i++) {
        ll Mi = M / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return {-1, -1};
        }

        __int128 term = (__int128)a[i] * Mi % M;
        term = term * ti % M;
        ans = (ans + term) % M;
    }
    if (ans < 0) {
        ans += M;
    }
    return {(ll)ans, M};
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
