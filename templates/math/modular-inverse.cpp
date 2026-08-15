// 随机验证：../verification/modular-inverse-random.cpp
// 扩展欧几里得求单个模逆元；m 必须大于 1。

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

ll inverse(ll a, ll m) {
    a %= m;
    if (a < 0) {
        a += m;
    }

    auto result = exgcd(a, m);
    ll g = get<0>(result);
    ll x = get<1>(result);
    if (g != 1) {
        return -1;
    }

    x %= m;
    if (x < 0) {
        x += m;
    }
    return x;
}

int main() {
    ll a, m;
    scanf("%lld%lld", &a, &m);

    ll inv = inverse(a, m);
    if (inv == -1) {
        printf("No inverse\n");
        return 0;
    }

    printf("%lld\n", inv);
    return 0;
}
