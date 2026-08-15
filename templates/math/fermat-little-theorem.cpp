// 随机验证：../verification/fermat-little-theorem-random.cpp
// 费马小定理处理十进制大指数；p 必须是质数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll power(ll base, ll exponent, ll mod) {
    base %= mod;
    if (base < 0) {
        base += mod;
    }

    ll result = 1 % mod;
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (__int128)result * base % mod;
        }
        base = (__int128)base * base % mod;
        exponent /= 2;
    }
    return result;
}

bool is_zero(const string& number) {
    for (char digit : number) {
        if (digit != '0') {
            return false;
        }
    }
    return true;
}

ll decimal_mod(const string& number, ll mod) {
    ll remainder = 0;
    for (char digit : number) {
        remainder = ((__int128)remainder * 10 + digit - '0') % mod;
    }
    return remainder;
}

ll fermat_power(ll a, const string& exponent, ll p) {
    if (is_zero(exponent)) {
        return 1 % p;
    }

    a %= p;
    if (a < 0) {
        a += p;
    }
    if (a == 0) {
        return 0;
    }

    ll reduced_exponent = decimal_mod(exponent, p - 1);
    return power(a, reduced_exponent, p);
}

int main() {
    ll a, p;
    string exponent;
    cin >> a >> exponent >> p;

    cout << fermat_power(a, exponent, p) << '\n';
    return 0;
}
