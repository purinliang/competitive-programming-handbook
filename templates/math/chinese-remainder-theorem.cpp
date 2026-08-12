// 随机验证：../verification/chinese-remainder-theorem-random.cpp
// 经典 CRT；模数必须两两互质，模数乘积必须能放入 ll。

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

ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }

    ll x1, y1;
    ll g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

bool crt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& M) {
    M = 1;
    for (ll x : m) {
        M *= x;
    }

    mint::set_mod(M);
    mint result = 0;
    int n = a.size();
    for (int i = 0; i < n; i++) {
        ll Mi = M / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return false;
        }

        result += mint(a[i]) * mint(Mi) * mint(ti);
    }
    ans = result.value();
    return true;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n);
    vector<ll> m(n);
    for (int i = 0; i < n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    ll ans, M;
    if (!crt(a, m, ans, M)) {
        printf("Moduli are not pairwise coprime\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
