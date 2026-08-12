// 随机验证：../verification/extended-euclidean-algorithm-random.cpp
// 裴蜀系数、二元线性不定方程、线性同余方程与模逆元。

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

bool solve_equation(ll a, ll b, ll c, ll& x, ll& y) {
    ll g = exgcd(a, b, x, y);
    if (c % g != 0) {
        return false;
    }

    ll t = c / g;
    x *= t;
    y *= t;
    return true;
}

bool solve_congruence(ll a, ll c, ll m, ll& x, ll& period) {
    ll y;
    ll g = exgcd(a, m, x, y);
    if (c % g != 0) {
        return false;
    }

    x *= c / g;
    period = m / g;
    x = (x % period + period) % period;
    return true;
}

bool inverse(ll a, ll m, ll& result) {
    ll period;
    return solve_congruence(a, 1, m, result, period);
}

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

    ll x, y;
    ll g = exgcd(a, b, x, y);
    printf("%lld %lld %lld\n", g, x, y);
    return 0;
}
