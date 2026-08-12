// 随机验证：../verification/mod-int-random.cpp
// 运行时模数的模整数；乘法使用龟速乘，不依赖 __int128。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct modint {
    static ll m;
    ll x;

    modint(ll x = 0) : x(normalize(x)) {}

    static void set_mod(ll new_m) {
        m = new_m;
    }

    static ll normalize(ll x) {
        x %= m;
        if (x < 0) {
            x += m;
        }
        return x;
    }

    static ll add(ll a, ll b) {
        if (a >= m - b) {
            return a - (m - b);
        }
        return a + b;
    }

    ll value() const {
        return x;
    }

    modint& operator+=(const modint& other) {
        x = add(x, other.x);
        return *this;
    }

    modint& operator-=(const modint& other) {
        if (x < other.x) {
            x += m - other.x;
        } else {
            x -= other.x;
        }
        return *this;
    }

    modint& operator*=(const modint& other) {
        ll a = x;
        ll b = other.x;
        x = 0;
        while (b > 0) {
            if (b % 2 == 1) {
                x = add(x, a);
            }
            a = add(a, a);
            b /= 2;
        }
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

ll modint::m = 1;

typedef modint mint;

int main() {
    ll m, a, b;
    scanf("%lld%lld%lld", &m, &a, &b);

    mint::set_mod(m);
    mint x = a;
    mint y = b;
    printf("%lld\n", (x + y).value());
    printf("%lld\n", (x - y).value());
    printf("%lld\n", (x * y).value());
    return 0;
}
