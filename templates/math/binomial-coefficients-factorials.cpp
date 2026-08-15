// 随机验证：../verification/binomial-coefficients-factorials-random.cpp
// 固定质数模下预处理组合数；必须满足 0 <= max_n < MOD。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

ll power(ll a, ll b) {
    ll answer = 1;
    while (b > 0) {
        if (b % 2 == 1) {
            answer = answer * a % MOD;
        }
        a = a * a % MOD;
        b /= 2;
    }
    return answer;
}

struct Combinations {
    int max_n;
    vector<ll> factorial;
    vector<ll> inverse_factorial;

    Combinations(int max_n) : max_n(max_n), factorial(max_n + 5), inverse_factorial(max_n + 5) {
        init();
    }

    void init() {
        factorial[0] = 1;
        for (int i = 1; i <= max_n; i++) {
            factorial[i] = factorial[i - 1] * i % MOD;
        }

        inverse_factorial[max_n] = power(factorial[max_n], MOD - 2);
        for (int i = max_n; i >= 1; i--) {
            inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
        }
    }

    ll choose(int n, int k) const {
        if (k < 0 || k > n) {
            return 0;
        }

        return factorial[n] * inverse_factorial[k] % MOD * inverse_factorial[n - k] % MOD;
    }
};

int main() {
    int max_n, q;
    scanf("%d%d", &max_n, &q);

    Combinations combinations(max_n);
    while (q--) {
        int n, k;
        scanf("%d%d", &n, &k);
        printf("%lld\n", combinations.choose(n, k));
    }
    return 0;
}
