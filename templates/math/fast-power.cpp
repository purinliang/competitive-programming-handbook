#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

ll power(ll base, ll exponent) {
    base %= MOD;
    if (base < 0) {
        base += MOD;
    }

    ll result = 1;
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }
    return result;
}

int main() {
    ll base, exponent;
    scanf("%lld%lld", &base, &exponent);
    printf("%lld\n", power(base, exponent));
    return 0;
}
