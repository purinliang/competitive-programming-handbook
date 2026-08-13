// 随机验证：../verification/gray-code-random.cpp
// 二进制整数与二进制反射格雷码互相转换，并生成 n 位格雷码序列。

#include <bits/stdc++.h>

using namespace std;

unsigned long long gray_code(unsigned long long value) {
    return value ^ (value >> 1);
}

unsigned long long gray_to_binary(unsigned long long gray) {
    unsigned long long value = 0;
    while (gray > 0) {
        value ^= gray;
        gray >>= 1;
    }
    return value;
}

string binary_string(unsigned long long value, int width) {
    string bits(width, '0');
    for (int i = width - 1; i >= 0; i--) {
        bits[i] = char('0' + (value & 1));
        value >>= 1;
    }
    return bits;
}

int main() {
    int n;
    scanf("%d", &n);

    unsigned long long total = 1ULL << n;
    for (unsigned long long value = 0; value < total; value++) {
        string code = binary_string(gray_code(value), n);
        printf("%s\n", code.c_str());
    }
    return 0;
}
