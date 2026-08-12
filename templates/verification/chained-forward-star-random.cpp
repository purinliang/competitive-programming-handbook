// 验证每条记录恰好进入一个邻接链，并检查成对反向边。

#define main chained_forward_star_template_main
#include "../graph-theory/chained-forward-star.cpp"
#undef main

struct InputEdge {
    int u;
    int v;
    int w;
};

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 100) + 1;
        int m = static_cast<int>(rng() % 300);
        fill(head, head + max(n, previous_n) + 1, -1);
        previous_n = n;
        cnt = 0;

        vector<InputEdge> input;
        for (int i = 0; i < m; i++) {
            int u = static_cast<int>(rng() % n) + 1;
            int v = static_cast<int>(rng() % n) + 1;
            int w = static_cast<int>(rng() % 2001) - 1000;
            input.push_back({u, v, w});
            add_edge(u, v, w);
            add_edge(v, u, w);
        }

        if (cnt != 2 * m) {
            printf("edge count mismatch on test %d\n", test);
            return 1;
        }
        for (int i = 0; i < m; i++) {
            int first = 2 * i;
            int second = first ^ 1;
            if (e[first].v != input[i].v || e[second].v != input[i].u || e[first].w != input[i].w ||
                e[second].w != input[i].w) {
                printf("paired edge mismatch on test %d\n", test);
                return 1;
            }
        }

        vector<bool> seen(cnt);
        for (int u = 1; u <= n; u++) {
            for (int i = head[u]; i != -1; i = e[i].next) {
                if (i < 0 || i >= cnt || seen[i]) {
                    printf("invalid chain on test %d\n", test);
                    return 1;
                }
                seen[i] = true;
                int edge_id = i / 2;
                int expected_u = i % 2 == 0 ? input[edge_id].u : input[edge_id].v;
                if (u != expected_u) {
                    printf("wrong head on test %d\n", test);
                    return 1;
                }
            }
        }
        if (count(seen.begin(), seen.end(), true) != cnt) {
            printf("missing edge on test %d\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
