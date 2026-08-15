#include <bits/stdc++.h>
using namespace std;

struct SparseTable {
    int n;
    int max_log;
    vector<int> log_table;
    vector<vector<int>> table;

    SparseTable(int n, const vector<int>& a) : n(n), log_table(n + 5) {
        max_log = 1;
        while ((1LL << max_log) <= n) {
            max_log++;
        }

        table.assign(max_log + 5, vector<int>(n + 5));

        for (int i = 1; i <= n; i++) {
            table[0][i] = a[i];
        }

        for (int j = 1; j < max_log; j++) {
            int length = 1 << j;
            int half = length / 2;
            for (int i = 1; i + length - 1 <= n; i++) {
                table[j][i] = max(table[j - 1][i], table[j - 1][i + half]);
            }
        }

        for (int length = 2; length <= n; length++) {
            log_table[length] = log_table[length / 2] + 1;
        }
    }

    int query(int l, int r) const {
        int length = r - l + 1;
        int j = log_table[length];
        return max(table[j][l], table[j][r - (1 << j) + 1]);
    }
};

int main() {
    int n, q;
    scanf("%d%d", &n, &q);

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
    }

    SparseTable sparse(n, a);

    while (q--) {
        int l, r;
        scanf("%d%d", &l, &r);
        printf("%d\n", sparse.query(l, r));
    }
    return 0;
}
