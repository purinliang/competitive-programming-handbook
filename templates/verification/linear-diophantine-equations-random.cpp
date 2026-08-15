#include <bits/stdc++.h>
using namespace std;

#define main linear_diophantine_equations_template_main
#include "../math/linear-diophantine-equations.cpp"
#undef main

int main() {
    mt19937 rng(712367);

    for (int test = 1; test <= 100000; test++) {
        ll a = rng() % 1000 + 1;
        ll b = rng() % 1000 + 1;
        ll c = (int)(rng() % 20001) - 10000;

        DiophantineSolution solution = solve_diophantine(a, b, c);
        bool expected = c % gcd(a, b) == 0;
        if (solution.exists != expected) {
            return 1;
        }
        if (!solution.exists) {
            continue;
        }

        for (ll k = -10; k <= 10; k++) {
            ll x = solution.x + k * solution.step_x;
            ll y = solution.y + k * solution.step_y;
            if (a * x + b * y != c) {
                return 1;
            }
        }
    }

    printf("100000 random tests passed\n");
    return 0;
}
