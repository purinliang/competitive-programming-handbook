#include <bits/stdc++.h>
using namespace std;

#define main monotonic_queue_template_main
#include "../algorithm-basics/monotonic-queue.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 200 + 1;
        int k = rng() % n + 1;
        vector<int> a(n + 5);
        for (int i = 1; i <= n; i++) {
            a[i] = (int)(rng() % 2001) - 1000;
        }

        vector<int> answer = sliding_window_maximum(a, n, k);

        for (int l = 1; l + k - 1 <= n; l++) {
            int expected = a[l];
            for (int i = l + 1; i <= l + k - 1; i++) {
                expected = max(expected, a[i]);
            }
            if (answer[l] != expected) {
                return 1;
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
