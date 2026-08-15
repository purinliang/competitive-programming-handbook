// 随机验证：../verification/sieve-of-eratosthenes-random.cpp

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

vector<int> sieve(int n) {
    vector<char> is_prime(n + 5, true);
    is_prime[0] = false;
    is_prime[1] = false;

    for (int p = 2; p <= n / p; p++) {
        if (!is_prime[p]) {
            continue;
        }
        for (ll multiple = 1LL * p * p; multiple <= n; multiple += p) {
            is_prime[multiple] = false;
        }
    }

    vector<int> primes;
    for (int x = 2; x <= n; x++) {
        if (is_prime[x]) {
            primes.push_back(x);
        }
    }
    return primes;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<int> primes = sieve(n);
    printf("%d\n", (int)primes.size());
    for (int p : primes) {
        printf("%d ", p);
    }
    printf("\n");
    return 0;
}
