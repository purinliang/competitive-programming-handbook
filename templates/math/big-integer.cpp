// 随机验证：../verification/big-integer-random.cpp
// 有符号九位压位高精度，支持比较、加减乘和除以低精度整数。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int WIDTH = 9;
const int BASE = 1000000000;

struct bigint {
    int sign;
    int n;
    vector<int> d;

    bigint() {
        sign = 0;
        n = 1;
        d.assign(n + 5, 0);
    }

    bigint(const string& s) {
        int begin = 0;
        sign = 1;
        if (s[0] == '-' || s[0] == '+') {
            sign = s[0] == '-' ? -1 : 1;
            begin = 1;
        }

        int length = s.size();
        n = max(1, (length - begin + WIDTH - 1) / WIDTH);
        d.assign(n + 5, 0);

        for (int i = 1; i <= n; i++) {
            int r = length - (i - 1) * WIDTH;
            int l = max(begin, r - WIDTH);
            for (int j = l; j < r; j++) {
                d[i] = d[i] * 10 + s[j] - '0';
            }
        }
        normalize();
    }

    void normalize() {
        while (n > 1 && d[n] == 0) {
            n--;
        }
        d.resize(n + 5);
        if (n == 1 && d[1] == 0) {
            sign = 0;
        }
    }

    string str() const {
        if (sign == 0) {
            return "0";
        }

        string result = sign < 0 ? "-" : "";
        result += to_string(d[n]);
        for (int i = n - 1; i >= 1; i--) {
            string part = to_string(d[i]);
            int padding = WIDTH - (int)part.size();
            result += string(padding, '0') + part;
        }
        return result;
    }
};

int compare_abs(const bigint& a, const bigint& b) {
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

int compare(const bigint& a, const bigint& b) {
    if (a.sign != b.sign) {
        return a.sign < b.sign ? -1 : 1;
    }
    if (a.sign == 0) {
        return 0;
    }

    int order = compare_abs(a, b);
    return a.sign > 0 ? order : -order;
}

bigint add_abs(const bigint& a, const bigint& b) {
    bigint c;
    c.sign = 1;
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
    c.normalize();
    return c;
}

bigint subtract_abs(const bigint& a, const bigint& b) {
    assert(compare_abs(a, b) >= 0);

    bigint c;
    c.sign = 1;
    c.n = a.n;
    c.d.assign(c.n + 5, 0);

    ll borrow = 0;
    for (int i = 1; i <= a.n; i++) {
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
    c.normalize();
    return c;
}

bigint add(const bigint& a, const bigint& b) {
    if (a.sign == 0) {
        return b;
    }
    if (b.sign == 0) {
        return a;
    }
    if (a.sign == b.sign) {
        bigint c = add_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    int order = compare_abs(a, b);
    if (order == 0) {
        return bigint();
    }
    if (order > 0) {
        bigint c = subtract_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    bigint c = subtract_abs(b, a);
    c.sign = b.sign;
    return c;
}

bigint opposite(bigint a) {
    a.sign = -a.sign;
    return a;
}

bigint subtract(const bigint& a, const bigint& b) {
    return add(a, opposite(b));
}

bigint multiply(const bigint& a, const bigint& b) {
    bigint c;
    c.sign = a.sign * b.sign;
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
    c.normalize();
    return c;
}

pair<bigint, int> divide(const bigint& a, int divisor) {
    assert(divisor != 0);

    ll positive_divisor = abs((ll)divisor);

    bigint quotient;
    quotient.sign = a.sign * (divisor < 0 ? -1 : 1);
    quotient.n = a.n;
    quotient.d.assign(quotient.n + 5, 0);

    ll remainder = 0;
    for (int i = a.n; i >= 1; i--) {
        ll current = remainder * BASE + a.d[i];
        quotient.d[i] = current / positive_divisor;
        remainder = current % positive_divisor;
    }
    quotient.normalize();

    int signed_remainder = remainder;
    if (a.sign < 0) {
        signed_remainder = -signed_remainder;
    }
    return {quotient, signed_remainder};
}

int main() {
    string sa, sb;
    int divisor;
    cin >> sa >> sb >> divisor;

    bigint a(sa);
    bigint b(sb);
    auto [quotient, remainder] = divide(a, divisor);

    cout << compare(a, b) << '\n';
    cout << add(a, b).str() << '\n';
    cout << subtract(a, b).str() << '\n';
    cout << multiply(a, b).str() << '\n';
    cout << quotient.str() << ' ' << remainder << '\n';
    return 0;
}
