#define main big_integer_template_main
#include "../math/big-integer.cpp"
#undef main

struct decimal {
    int sign;
    string d;
};

decimal normalize_decimal(decimal a) {
    int begin = 0;
    while (begin + 1 < (int)a.d.size() && a.d[begin] == '0') {
        begin++;
    }
    a.d = a.d.substr(begin);
    if (a.d == "0") {
        a.sign = 0;
    }
    return a;
}

decimal parse_decimal(const string& s) {
    decimal a;
    int begin = 0;
    a.sign = 1;
    if (s[0] == '-' || s[0] == '+') {
        a.sign = s[0] == '-' ? -1 : 1;
        begin = 1;
    }
    a.d = s.substr(begin);
    return normalize_decimal(a);
}

string decimal_str(const decimal& a) {
    return a.sign < 0 ? "-" + a.d : a.d;
}

int oracle_compare_abs(const decimal& a, const decimal& b) {
    if (a.d.size() != b.d.size()) {
        return a.d.size() < b.d.size() ? -1 : 1;
    }
    if (a.d == b.d) {
        return 0;
    }
    return a.d < b.d ? -1 : 1;
}

int oracle_compare(const decimal& a, const decimal& b) {
    if (a.sign != b.sign) {
        return a.sign < b.sign ? -1 : 1;
    }
    if (a.sign == 0) {
        return 0;
    }
    int order = oracle_compare_abs(a, b);
    return a.sign > 0 ? order : -order;
}

decimal oracle_add_abs(const decimal& a, const decimal& b) {
    string result;
    int i = a.d.size() - 1;
    int j = b.d.size() - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry > 0) {
        int current = carry;
        if (i >= 0) {
            current += a.d[i--] - '0';
        }
        if (j >= 0) {
            current += b.d[j--] - '0';
        }
        result.push_back('0' + current % 10);
        carry = current / 10;
    }
    reverse(result.begin(), result.end());
    return {1, result};
}

decimal oracle_subtract_abs(const decimal& a, const decimal& b) {
    string result;
    int j = b.d.size() - 1;
    int borrow = 0;
    for (int i = a.d.size() - 1; i >= 0; i--) {
        int current = a.d[i] - '0' - borrow;
        if (j >= 0) {
            current -= b.d[j--] - '0';
        }
        if (current < 0) {
            current += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        result.push_back('0' + current);
    }
    reverse(result.begin(), result.end());
    return normalize_decimal({1, result});
}

decimal oracle_add(const decimal& a, const decimal& b) {
    if (a.sign == 0) {
        return b;
    }
    if (b.sign == 0) {
        return a;
    }
    if (a.sign == b.sign) {
        decimal c = oracle_add_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    int order = oracle_compare_abs(a, b);
    if (order == 0) {
        return {0, "0"};
    }
    if (order > 0) {
        decimal c = oracle_subtract_abs(a, b);
        c.sign = a.sign;
        return c;
    }

    decimal c = oracle_subtract_abs(b, a);
    c.sign = b.sign;
    return c;
}

decimal oracle_opposite(decimal a) {
    a.sign = -a.sign;
    return a;
}

decimal oracle_multiply(const decimal& a, const decimal& b) {
    vector<int> d(a.d.size() + b.d.size(), 0);
    for (int i = a.d.size() - 1; i >= 0; i--) {
        for (int j = b.d.size() - 1; j >= 0; j--) {
            d[i + j + 1] += (a.d[i] - '0') * (b.d[j] - '0');
        }
    }
    for (int i = d.size() - 1; i >= 1; i--) {
        d[i - 1] += d[i] / 10;
        d[i] %= 10;
    }

    string result;
    for (int digit : d) {
        result.push_back('0' + digit);
    }
    return normalize_decimal({a.sign * b.sign, result});
}

pair<decimal, int> oracle_divide(const decimal& a, int divisor) {
    ll positive_divisor = abs((ll)divisor);
    ll remainder = 0;
    string result;

    for (char digit : a.d) {
        ll current = remainder * 10 + digit - '0';
        result.push_back('0' + current / positive_divisor);
        remainder = current % positive_divisor;
    }

    decimal quotient =
        normalize_decimal({a.sign * (divisor < 0 ? -1 : 1), result});
    int signed_remainder = remainder;
    if (a.sign < 0) {
        signed_remainder = -signed_remainder;
    }
    return {quotient, signed_remainder};
}

string random_number(mt19937_64& rng, int length) {
    string s(length, '0');
    s[0] = '1' + rng() % 9;
    for (int i = 1; i < length; i++) {
        s[i] = '0' + rng() % 10;
    }
    if (rng() % 2 == 0) {
        s = "-" + s;
    }
    return s;
}

bool check(const string& sa, const string& sb, int divisor) {
    bigint a(sa);
    bigint b(sb);
    decimal expected_a = parse_decimal(sa);
    decimal expected_b = parse_decimal(sb);

    if (a.str() != decimal_str(expected_a) ||
        b.str() != decimal_str(expected_b)) {
        return false;
    }
    if (compare(a, b) != oracle_compare(expected_a, expected_b)) {
        return false;
    }
    if (add(a, b).str() != decimal_str(oracle_add(expected_a, expected_b))) {
        return false;
    }
    if (subtract(a, b).str() !=
        decimal_str(oracle_add(expected_a, oracle_opposite(expected_b)))) {
        return false;
    }
    if (multiply(a, b).str() !=
        decimal_str(oracle_multiply(expected_a, expected_b))) {
        return false;
    }

    auto [quotient, remainder] = divide(a, divisor);
    auto [expected_quotient, expected_remainder] =
        oracle_divide(expected_a, divisor);
    return quotient.str() == decimal_str(expected_quotient) &&
           remainder == expected_remainder;
}

int main() {
    vector<tuple<string, string, int>> fixed = {
        {"0", "-0", 1},
        {"+000000000", "-000", -1},
        {"1", "-1", INT_MIN},
        {"-12345678901234567890", "98765432109876543210", 97},
        {"999999999999999999", "-1000000000000000000", INT_MAX},
    };
    for (auto& [a, b, divisor] : fixed) {
        if (!check(a, b, divisor)) {
            printf("fixed test failed: %s %s %d\n", a.c_str(), b.c_str(),
                   divisor);
            return 1;
        }
    }

    mt19937_64 rng(20260817);
    for (int test = 1; test <= 10000; test++) {
        int n = rng() % 300 + 1;
        int m = rng() % 300 + 1;
        string a = random_number(rng, n);
        string b = random_number(rng, m);
        int divisor = rng();
        if (divisor == 0) {
            divisor = 1;
        }

        if (!check(a, b, divisor)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("10000 random signed tests passed\n");
    return 0;
}
