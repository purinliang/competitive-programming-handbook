// 随机验证：../verification/extended-chinese-remainder-theorem-random.cpp
// exCRT；允许模数不互质，最终最小公倍数必须能放入 ll。

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

pair<ll, ll> merge_congruence(ll a1, ll m1, ll a2, ll m2) {
    ll s, y;
    ll g = exgcd(m1, m2, s, y);
    ll c = a2 - a1;
    if (c % g != 0) {
        return {-1, -1};
    }

    ll period = m2 / g;
    ll t = multiply_mod(s, c / g, period);

    ll new_M = m1 / g * m2;
    ll new_a = add_mod(normalize(a1, new_M), multiply_mod(m1, t, new_M), new_M);
    return {new_a, new_M};
}

pair<ll, ll> excrt(int n, const vector<ll>& a, const vector<ll>& m) {
    ll M = m[1];
    ll ans = normalize(a[1], M);
    for (int i = 2; i <= n; i++) {
        ll next_a = normalize(a[i], m[i]);
        auto [new_ans, new_M] = merge_congruence(ans, M, next_a, m[i]);
        if (new_ans == -1) {
            return {-1, -1};
        }
        ans = new_ans;
        M = new_M;
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

    auto [ans, M] = excrt(n, a, m);
    if (ans == -1) {
        printf("No solution\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
