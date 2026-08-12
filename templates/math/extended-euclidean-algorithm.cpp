// 随机验证：../verification/extended-euclidean-algorithm-random.cpp
// 返回 gcd 和一组裴蜀系数。

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

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

    auto [g, x, y] = exgcd(a, b);
    printf("%lld %lld %lld\n", g, x, y);
    return 0;
}
