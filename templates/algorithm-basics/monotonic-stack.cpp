#include <bits/stdc++.h>
using namespace std;

vector<int> next_greater_right(const vector<int>& a, int n) {
    vector<int> answer(n + 5);
    stack<int> st;

    for (int i = 1; i <= n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            int u = st.top();
            st.pop();
            answer[u] = i;
        }
        st.push(i);
    }

    return answer;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
    }

    vector<int> answer = next_greater_right(a, n);
    for (int i = 1; i <= n; i++) {
        if (i > 1) {
            printf(" ");
        }
        printf("%d", answer[i]);
    }
    printf("\n");
    return 0;
}
