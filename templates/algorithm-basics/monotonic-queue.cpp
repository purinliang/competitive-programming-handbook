#include <bits/stdc++.h>
using namespace std;

vector<int> sliding_window_maximum(const vector<int>& a, int n, int k) {
    vector<int> answer(n + 5);
    deque<int> q;

    for (int i = 1; i <= n; i++) {
        while (!q.empty() && q.front() <= i - k) {
            q.pop_front();
        }
        while (!q.empty() && a[q.back()] <= a[i]) {
            q.pop_back();
        }
        q.push_back(i);

        if (i >= k) {
            answer[i - k + 1] = a[q.front()];
        }
    }

    return answer;
}

int main() {
    int n, k;
    scanf("%d%d", &n, &k);

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
    }

    vector<int> answer = sliding_window_maximum(a, n, k);
    int window_count = n - k + 1;
    for (int l = 1; l <= window_count; l++) {
        if (l > 1) {
            printf(" ");
        }
        printf("%d", answer[l]);
    }
    printf("\n");
    return 0;
}
