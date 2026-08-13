// 用子集 DP 枚举二叉前缀树的所有根划分，验证哈夫曼编码的最小代价。

#define main huffman_coding_template_main
#include "../algorithm-basics/huffman-coding.cpp"
#undef main

ll brute_cost(int mask, const vector<ll>& subset_sum, vector<ll>& memo) {
    if ((mask & (mask - 1)) == 0) {
        return 0;
    }
    if (memo[mask] != -1) {
        return memo[mask];
    }

    int first_bit = mask & -mask;
    ll best = LLONG_MAX;
    for (int left = (mask - 1) & mask; left > 0; left = (left - 1) & mask) {
        if ((left & first_bit) == 0) {
            continue;
        }
        int right = mask ^ left;
        if (right == 0) {
            continue;
        }
        best = min(best, subset_sum[mask] + brute_cost(left, subset_sum, memo) +
                             brute_cost(right, subset_sum, memo));
    }
    return memo[mask] = best;
}

bool prefix_free(int n, const vector<string>& codes) {
    set<string> seen;
    for (int i = 1; i <= n; i++) {
        if (codes[i].empty() || !seen.insert(codes[i]).second) {
            return false;
        }
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (i == j || codes[i].size() > codes[j].size()) {
                continue;
            }
            if (codes[j].compare(0, codes[i].size(), codes[i]) == 0) {
                return false;
            }
        }
    }
    return true;
}

bool check_case(int n, const vector<ll>& frequency) {
    HuffmanResult result = huffman_coding(n, frequency);
    if (!prefix_free(n, result.codes)) {
        return false;
    }

    ll actual_bits = 0;
    for (int i = 1; i <= n; i++) {
        actual_bits += frequency[i] * (ll)result.codes[i].size();
    }
    if (actual_bits != result.encoded_bits) {
        return false;
    }
    if (n == 1) {
        return result.encoded_bits == frequency[1] && result.codes[1] == "0";
    }

    int full_mask = (1 << n) - 1;
    vector<ll> subset_sum(1 << n, 0);
    for (int mask = 1; mask <= full_mask; mask++) {
        int bit = __builtin_ctz(mask);
        subset_sum[mask] = subset_sum[mask ^ (1 << bit)] + frequency[bit + 1];
    }
    vector<ll> memo(1 << n, -1);
    return result.encoded_bits == brute_cost(full_mask, subset_sum, memo);
}

int main() {
    for (int n = 1; n <= 9; n++) {
        vector<ll> frequency(n + 5, 1);
        if (!check_case(n, frequency)) {
            printf("equal-frequency test failed: n=%d\n", n);
            return 1;
        }
    }

    mt19937 rng(20260814);
    for (int test = 1; test <= 5000; test++) {
        int n = (int)(rng() % 9) + 1;
        vector<ll> frequency(n + 5);
        for (int i = 1; i <= n; i++) {
            frequency[i] = (ll)(rng() % 100) + 1;
        }
        if (!check_case(n, frequency)) {
            printf("random test %d failed\n", test);
            return 1;
        }
    }

    printf("9 equal-frequency and 5000 random tests passed\n");
    return 0;
}
