#include <bits/stdc++.h>
using namespace std;

#define main monotonic_stack_template_main
#include "../algorithm-basics/monotonic-stack.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 500; test++) {
        int n = rng() % 200 + 1;
        vector<int> a(n + 5);
        for (int i = 1; i <= n; i++) {
            a[i] = (int)(rng() % 101) - 50;
        }

        vector<int> answer = next_greater_right(a, n);

        for (int u = 1; u <= n; u++) {
            int expected = 0;
            for (int i = u + 1; i <= n; i++) {
                if (a[i] > a[u]) {
                    expected = i;
                    break;
                }
            }
            if (answer[u] != expected) {
                return 1;
            }
        }
    }

    printf("500 random tests passed\n");
    return 0;
}
