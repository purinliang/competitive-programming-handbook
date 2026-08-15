// 随机验证：../verification/divisor-count-random.cpp

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll divisor_count(ll n) {
    ll answer = 1;
    ll remaining = n;

    for (ll p = 2; p <= remaining / p; p++) {
        int exponent = 0;
        while (remaining % p == 0) {
            remaining /= p;
            exponent++;
        }
        if (exponent > 0) {
            answer *= exponent + 1;
        }
    }

    if (remaining > 1) {
        answer *= 2;
    }
    return answer;
}

int main() {
    ll n;
    scanf("%lld", &n);
    printf("%lld\n", divisor_count(n));
    return 0;
}
