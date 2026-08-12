// 随机验证：../verification/mod-int-random.cpp
// 固定模数的模整数；要求 (MOD - 1) * (MOD - 1) 能放入 ll。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

struct modint {
    ll x;

    modint(ll value = 0) {
        x = value % MOD;
        if (x < 0) {
            x += MOD;
        }
    }

    ll value() const {
        return x;
    }

    modint& operator+=(const modint& other) {
        x += other.x;
        if (x >= MOD) {
            x -= MOD;
        }
        return *this;
    }

    modint& operator-=(const modint& other) {
        x -= other.x;
        if (x < 0) {
            x += MOD;
        }
        return *this;
    }

    modint& operator*=(const modint& other) {
        x = x * other.x % MOD;
        return *this;
    }

    friend modint operator+(modint a, const modint& b) {
        return a += b;
    }

    friend modint operator-(modint a, const modint& b) {
        return a -= b;
    }

    friend modint operator*(modint a, const modint& b) {
        return a *= b;
    }
};

typedef modint mint;

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

    mint x = a;
    mint y = b;
    printf("%lld\n", (x + y).value());
    printf("%lld\n", (x - y).value());
    printf("%lld\n", (x * y).value());
    return 0;
}
