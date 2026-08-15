// 随机验证：../verification/euler-totient-random.cpp
// 使用质因数分解计算单个正整数的欧拉函数值。

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

int main() {
    ll n;
    scanf("%lld", &n);
    printf("%lld\n", phi(n));
    return 0;
}
