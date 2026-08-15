#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct CongruenceSolution {
    bool exists;
    ll first;
    ll step;
    ll count;
};

tuple<ll, ll, ll> exgcd(ll a, ll b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    auto [g, x1, y1] = exgcd(b, a % b);
    ll x = y1;
    ll y = x1 - a / b * y1;
    return {g, x, y};
}

CongruenceSolution solve_congruence(ll a, ll c, ll m) {
    a %= m;
    if (a < 0) {
        a += m;
    }

    auto result = exgcd(a, m);
    ll g = get<0>(result);
    ll x = get<1>(result);
    if (c % g != 0) {
        return {false, 0, 0, 0};
    }

    ll step = m / g;
    ll first = (__int128)x * (c / g) % step;
    if (first < 0) {
        first += step;
    }
    return {true, first, step, g};
}

int main() {
    ll a, c, m;
    scanf("%lld%lld%lld", &a, &c, &m);

    CongruenceSolution solution = solve_congruence(a, c, m);
    if (!solution.exists) {
        printf("No\n");
        return 0;
    }

    printf("%lld %lld %lld\n", solution.first, solution.step, solution.count);
    return 0;
}
