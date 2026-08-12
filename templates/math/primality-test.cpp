// 随机验证：../verification/primality-test-random.cpp
// 试除法判断单个 64 位整数是否为质数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

bool is_prime(ll n) {
    if (n < 2) {
        return false;
    }

    for (ll i = 2; i <= n / i; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    ll n;
    scanf("%lld", &n);
    printf(is_prime(n) ? "Yes\n" : "No\n");
    return 0;
}
