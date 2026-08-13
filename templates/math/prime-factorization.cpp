// 试除法分解单个不超过 1e12 的正整数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

vector<pair<ll, int>> factorize(ll n) {
    vector<pair<ll, int>> factors;
    ll remaining = n;

    for (ll p = 2; p <= remaining / p; p++) {
        int exponent = 0;
        while (remaining % p == 0) {
            remaining /= p;
            exponent++;
        }
        if (exponent > 0) {
            factors.push_back({p, exponent});
        }
    }

    if (remaining > 1) {
        factors.push_back({remaining, 1});
    }

    return factors;
}

int main() {
    ll n;
    scanf("%lld", &n);

    vector<pair<ll, int>> factors = factorize(n);
    printf("%d\n", (int)factors.size());
    for (auto [prime, exponent] : factors) {
        printf("%lld %d\n", prime, exponent);
    }
    return 0;
}
