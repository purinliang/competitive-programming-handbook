// 随机验证：../verification/extended-chinese-remainder-theorem-random.cpp
// exCRT；允许模数不互质，最终最小公倍数必须能放入 ll。

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

pair<ll, ll> merge_congruence(ll a1, ll m1, ll a2, ll m2) {
    ll s, y;
    ll g = exgcd(m1, m2, s, y);
    ll c = a2 - a1;
    if (c % g != 0) {
        return {-1, -1};
    }

    ll period = m2 / g;
    mint::set_mod(period);
    ll t = (mint(s) * mint(c / g)).value();

    ll new_M = m1 / g * m2;
    mint::set_mod(new_M);
    ll new_a = (mint(a1) + mint(m1) * mint(t)).value();
    return {new_a, new_M};
}

pair<ll, ll> excrt(int n, const vector<ll>& a, const vector<ll>& m) {
    ll M = m[1];
    mint::set_mod(M);
    ll ans = mint(a[1]).value();
    for (int i = 2; i <= n; i++) {
        mint::set_mod(m[i]);
        ll next_a = mint(a[i]).value();
        auto [new_ans, new_M] = merge_congruence(ans, M, next_a, m[i]);
        if (new_ans == -1) {
            return {-1, -1};
        }
        ans = new_ans;
        M = new_M;
    }
    return {ans, M};
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n + 5);
    vector<ll> m(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    auto [ans, M] = excrt(n, a, m);
    if (ans == -1) {
        printf("No solution\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
