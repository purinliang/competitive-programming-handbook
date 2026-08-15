#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct DiophantineSolution {
    bool exists;
    ll x;
    ll y;
    ll step_x;
    ll step_y;
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

DiophantineSolution solve_diophantine(ll a, ll b, ll c) {
    auto [g, x, y] = exgcd(a, b);
    if (c % g != 0) {
        return {false, 0, 0, 0, 0};
    }

    ll scale = c / g;
    x *= scale;
    y *= scale;
    return {true, x, y, b / g, -a / g};
}

int main() {
    ll a, b, c;
    scanf("%lld%lld%lld", &a, &b, &c);

    DiophantineSolution solution = solve_diophantine(a, b, c);
    if (!solution.exists) {
        printf("No\n");
        return 0;
    }

    printf("%lld %lld\n", solution.x, solution.y);
    printf("%lld %lld\n", solution.step_x, solution.step_y);
    return 0;
}
