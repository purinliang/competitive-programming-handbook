// 穷举较小位数检查排列、相邻一位变化和逆转换，再随机验证 64 位值。

#define main gray_code_template_main
#include "../algorithm-basics/gray-code.cpp"
#undef main

int main() {
    for (int n = 1; n <= 20; n++) {
        unsigned long long total = 1ULL << n;
        vector<bool> seen(total, false);

        for (unsigned long long value = 0; value < total; value++) {
            unsigned long long code = gray_code(value);
            if (code >= total || seen[code] || gray_to_binary(code) != value) {
                printf("bijection test failed: n=%d value=%llu\n", n, value);
                return 1;
            }
            seen[code] = true;

            unsigned long long next_code = gray_code((value + 1) % total);
            if (__builtin_popcountll(code ^ next_code) != 1) {
                printf("adjacency test failed: n=%d value=%llu\n", n, value);
                return 1;
            }
        }
    }

    mt19937_64 rng(20260814);
    for (int test = 1; test <= 100000; test++) {
        unsigned long long value = rng();
        if (gray_to_binary(gray_code(value)) != value) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("20 exhaustive sizes and 100000 random values passed\n");
    return 0;
}
