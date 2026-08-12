// 随机验证：../verification/extended-chinese-remainder-theorem-random.cpp
// exCRT；允许模数不互质，最终最小公倍数必须能放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

tuple<ll, ll, ll> exgcd(ll a, ll b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    auto [g, x1, y1] = exgcd(b, a % b);
    ll x = y1;
    ll y = x1 - a / b * y1;
    return {g, x, y};
}

pair<ll, ll> merge_congruence(ll a1, ll m1, ll a2, ll m2) {
    auto [g, s, y] = exgcd(m1, m2);
    ll c = a2 - a1;
    if (c % g != 0) {
        return {-1, -1};
    }

    ll period = m2 / g;
    ll t = (ll)((__int128)s * (c / g) % period);
    if (t < 0) {
        t += period;
    }

    ll new_M = m1 / g * m2;
    ll new_a = (ll)((a1 + (__int128)m1 * t) % new_M);
    if (new_a < 0) {
        new_a += new_M;
    }
    return {new_a, new_M};
}

pair<ll, ll> excrt(int n, const vector<ll>& a, const vector<ll>& m) {
    ll M = m[1];
    ll ans = a[1] % M;
    if (ans < 0) {
        ans += M;
    }
    for (int i = 2; i <= n; i++) {
        ll next_a = a[i] % m[i];
        if (next_a < 0) {
            next_a += m[i];
        }
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
