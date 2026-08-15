// 随机验证：../verification/euler-theorem-random.cpp
// 仅在 b >= 0、n >= 1 且 gcd(a, n) == 1 时用 phi(n) 缩小指数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll phi(ll n) {
    ll answer = n;
    ll x = n;

    for (ll p = 2; p <= x / p; p++) {
        if (x % p != 0) {
            continue;
        }

        answer = answer / p * (p - 1);
        while (x % p == 0) {
            x /= p;
        }
    }

    if (x > 1) {
        answer = answer / x * (x - 1);
    }
    return answer;
}

ll power(ll a, ll b, ll mod) {
    a %= mod;
    if (a < 0) {
        a += mod;
    }

    ll answer = 1 % mod;
    while (b > 0) {
        if (b % 2 == 1) {
            answer = (__int128)answer * a % mod;
        }
        a = (__int128)a * a % mod;
        b /= 2;
    }
    return answer;
}

int main() {
    ll a, b, n;
    scanf("%lld%lld%lld", &a, &b, &n);

    ll period = phi(n);
    printf("%lld\n", power(a, b % period, n));
    return 0;
}
