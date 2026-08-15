// 随机验证：../verification/euler-sieve-random.cpp

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

pair<vector<int>, vector<int>> euler_sieve(int n) {
    vector<int> primes;
    vector<int> min_prime(n + 5);

    for (int x = 2; x <= n; x++) {
        if (min_prime[x] == 0) {
            min_prime[x] = x;
            primes.push_back(x);
        }

        for (int p : primes) {
            if (p > min_prime[x] || 1LL * x * p > n) {
                break;
            }
            min_prime[x * p] = p;
        }
    }
    return {primes, min_prime};
}

int main() {
    int n;
    scanf("%d", &n);

    auto result = euler_sieve(n);
    const vector<int>& primes = result.first;
    printf("%d\n", (int)primes.size());
    for (int p : primes) {
        printf("%d ", p);
    }
    printf("\n");
    return 0;
}
