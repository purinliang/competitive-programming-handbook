// 用筛法得到的小范围质数表对拍试除法。

#define main primality_test_template_main
#include "../math/primality-test.cpp"
#undef main

int main() {
    const int LIMIT = 1000000;
    vector<bool> expected(LIMIT + 1, true);
    expected[0] = expected[1] = false;
    for (int i = 2; i <= LIMIT / i; i++) {
        if (!expected[i]) {
            continue;
        }
        for (int j = i * i; j <= LIMIT; j += i) {
            expected[j] = false;
        }
    }

    for (int n = 0; n <= LIMIT; n++) {
        if (is_prime(n) != expected[n]) {
            printf("n = %d failed\n", n);
            return 1;
        }
    }

    vector<pair<ll, bool>> fixed_cases = {
        {-1, false}, {0, false},         {1, false},          {2, true},
        {97, true},  {1000000007, true}, {1000000014, false}, {999983LL * 999983, false},
    };
    for (auto [n, answer] : fixed_cases) {
        if (is_prime(n) != answer) {
            printf("fixed case %lld failed\n", n);
            return 1;
        }
    }

    printf("all tests passed\n");
    return 0;
}
