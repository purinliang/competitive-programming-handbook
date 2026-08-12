// 随机验证：../verification/big-integer-random.cpp
// 非负压位高精度；减法要求 a >= b。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int WIDTH = 8;
const int BASE = 100000000;

struct bigint {
    int n;
    vector<int> d;

    bigint() {
        n = 1;
        d.assign(n + 5, 0);
    }

    bigint(const string& s) {
        int length = s.size();
        n = (length + WIDTH - 1) / WIDTH;
        d.assign(n + 5, 0);

        for (int i = 1; i <= n; i++) {
            int r = length - (i - 1) * WIDTH;
            int l = max(0, r - WIDTH);
            for (int j = l; j < r; j++) {
                d[i] = d[i] * 10 + s[j] - '0';
            }
        }
        trim();
    }

    void trim() {
        while (n > 1 && d[n] == 0) {
            n--;
        }
        d.resize(n + 5);
    }

    string str() const {
        string result = to_string(d[n]);
        for (int i = n - 1; i >= 1; i--) {
            string part = to_string(d[i]);
            result += string(WIDTH - part.size(), '0') + part;
        }
        return result;
    }
};

int compare(const bigint& a, const bigint& b) {
    if (a.n != b.n) {
        return a.n < b.n ? -1 : 1;
    }
    for (int i = a.n; i >= 1; i--) {
        if (a.d[i] != b.d[i]) {
            return a.d[i] < b.d[i] ? -1 : 1;
        }
    }
    return 0;
}

bigint add(const bigint& a, const bigint& b) {
    bigint c;
    c.n = max(a.n, b.n) + 1;
    c.d.assign(c.n + 5, 0);

    ll carry = 0;
    for (int i = 1; i <= c.n; i++) {
        ll current = carry;
        if (i <= a.n) {
            current += a.d[i];
        }
        if (i <= b.n) {
            current += b.d[i];
        }
        c.d[i] = current % BASE;
        carry = current / BASE;
    }
    c.trim();
    return c;
}

bigint subtract(const bigint& a, const bigint& b) {
    assert(compare(a, b) >= 0);

    bigint c;
    c.n = a.n;
    c.d.assign(c.n + 5, 0);

    ll borrow = 0;
    for (int i = 1; i <= c.n; i++) {
        ll current = (ll)a.d[i] - borrow;
        if (i <= b.n) {
            current -= b.d[i];
        }
        if (current < 0) {
            current += BASE;
            borrow = 1;
        } else {
            borrow = 0;
        }
        c.d[i] = current;
    }
    c.trim();
    return c;
}

bigint multiply(const bigint& a, const bigint& b) {
    bigint c;
    c.n = a.n + b.n;
    c.d.assign(c.n + 5, 0);

    for (int i = 1; i <= a.n; i++) {
        ll carry = 0;
        for (int j = 1; j <= b.n; j++) {
            ll current = c.d[i + j - 1] + (ll)a.d[i] * b.d[j] + carry;
            c.d[i + j - 1] = current % BASE;
            carry = current / BASE;
        }
        c.d[i + b.n] = carry;
    }
    c.trim();
    return c;
}

int main() {
    string sa, sb;
    cin >> sa >> sb;

    bigint a(sa);
    bigint b(sb);
    cout << add(a, b).str() << '\n';
    cout << subtract(a, b).str() << '\n';
    cout << multiply(a, b).str() << '\n';
    return 0;
}
