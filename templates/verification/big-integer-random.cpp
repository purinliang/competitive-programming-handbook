// 用每格一位十进制数字的朴素实现作为独立答案。

#define main big_integer_template_main
#include "../math/big-integer.cpp"
#undef main

string normalize_decimal(const string& s) {
    int i = 0;
    while (i + 1 < (int)s.size() && s[i] == '0') {
        i++;
    }
    return s.substr(i);
}

int oracle_compare(const string& raw_a, const string& raw_b) {
    string a = normalize_decimal(raw_a);
    string b = normalize_decimal(raw_b);
    if (a.size() != b.size()) {
        return a.size() < b.size() ? -1 : 1;
    }
    if (a == b) {
        return 0;
    }
    return a < b ? -1 : 1;
}

string oracle_add(const string& raw_a, const string& raw_b) {
    string a = normalize_decimal(raw_a);
    string b = normalize_decimal(raw_b);
    string result;

    int i = a.size() - 1;
    int j = b.size() - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry > 0) {
        int current = carry;
        if (i >= 0) {
            current += a[i--] - '0';
        }
        if (j >= 0) {
            current += b[j--] - '0';
        }
        result.push_back('0' + current % 10);
        carry = current / 10;
    }
    reverse(result.begin(), result.end());
    return result;
}

string oracle_subtract(const string& raw_a, const string& raw_b) {
    string a = normalize_decimal(raw_a);
    string b = normalize_decimal(raw_b);
    string result;

    int j = b.size() - 1;
    int borrow = 0;
    for (int i = a.size() - 1; i >= 0; i--) {
        int current = a[i] - '0' - borrow;
        if (j >= 0) {
            current -= b[j--] - '0';
        }
        if (current < 0) {
            current += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        result.push_back('0' + current);
    }
    while (result.size() > 1 && result.back() == '0') {
        result.pop_back();
    }
    reverse(result.begin(), result.end());
    return result;
}

string oracle_multiply(const string& raw_a, const string& raw_b) {
    string a = normalize_decimal(raw_a);
    string b = normalize_decimal(raw_b);
    vector<int> d(a.size() + b.size(), 0);

    for (int i = a.size() - 1; i >= 0; i--) {
        for (int j = b.size() - 1; j >= 0; j--) {
            d[i + j + 1] += (a[i] - '0') * (b[j] - '0');
        }
    }
    for (int i = d.size() - 1; i >= 1; i--) {
        d[i - 1] += d[i] / 10;
        d[i] %= 10;
    }

    string result;
    int i = 0;
    while (i + 1 < (int)d.size() && d[i] == 0) {
        i++;
    }
    for (; i < (int)d.size(); i++) {
        result.push_back('0' + d[i]);
    }
    return result;
}

string random_number(mt19937_64& rng, int length) {
    string s(length, '0');
    s[0] = '1' + rng() % 9;
    for (int i = 1; i < length; i++) {
        s[i] = '0' + rng() % 10;
    }
    return s;
}

bool check(string sa, string sb) {
    if (oracle_compare(sa, sb) < 0) {
        swap(sa, sb);
    }

    bigint a(sa);
    bigint b(sb);
    if (a.str() != normalize_decimal(sa) || b.str() != normalize_decimal(sb)) {
        return false;
    }
    if (compare(a, b) != oracle_compare(sa, sb)) {
        return false;
    }
    if (add(a, b).str() != oracle_add(sa, sb)) {
        return false;
    }
    if (subtract(a, b).str() != oracle_subtract(sa, sb)) {
        return false;
    }
    return multiply(a, b).str() == oracle_multiply(sa, sb);
}

int main() {
    vector<pair<string, string>> fixed = {
        {"0", "0"},
        {"00000000", "0000"},
        {"1", "0"},
        {"100000000", "1"},
        {"9999999999999999", "2"},
        {"12345678901234567890", "987654321"},
    };
    for (auto& [a, b] : fixed) {
        if (!check(a, b)) {
            printf("fixed test failed: %s %s\n", a.c_str(), b.c_str());
            return 1;
        }
    }

    mt19937_64 rng(20050314);
    for (int test = 1; test <= 10000; test++) {
        int n = rng() % 200 + 1;
        int m = rng() % 200 + 1;
        string a = random_number(rng, n);
        string b = random_number(rng, m);
        if (!check(a, b)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
