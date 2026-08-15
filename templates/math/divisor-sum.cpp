// 随机验证：../verification/divisor-sum-random.cpp
// 正因数和必须能够放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll divisor_sum(ll n) {
    ll answer = 1;
    ll remaining = n;

    for (ll p = 2; p <= remaining / p; p++) {
        ll power = 1;
        ll series = 1;
        while (remaining % p == 0) {
            remaining /= p;
            power *= p;
            series += power;
        }
        answer *= series;
    }

    if (remaining > 1) {
        answer *= remaining + 1;
    }
    return answer;
}

int main() {
    ll n;
    scanf("%lld", &n);
    printf("%lld\n", divisor_sum(n));
    return 0;
}
