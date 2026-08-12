// 用三种迭代遍历对拍递归遍历。

#define main binary_tree_traversals_template_main
#include "../data-structures/binary-tree-traversals.cpp"
#undef main

vector<int> iterative_preorder(int root) {
    vector<int> result;
    stack<int> s;
    s.push(root);
    while (!s.empty()) {
        int u = s.top();
        s.pop();
        if (u == 0) {
            continue;
        }
        result.push_back(value[u]);
        s.push(right_child[u]);
        s.push(left_child[u]);
    }
    return result;
}

vector<int> iterative_inorder(int root) {
    vector<int> result;
    stack<int> s;
    int u = root;
    while (u != 0 || !s.empty()) {
        while (u != 0) {
            s.push(u);
            u = left_child[u];
        }
        u = s.top();
        s.pop();
        result.push_back(value[u]);
        u = right_child[u];
    }
    return result;
}

vector<int> iterative_postorder(int root) {
    vector<int> result;
    stack<int> s;
    s.push(root);
    while (!s.empty()) {
        int u = s.top();
        s.pop();
        if (u == 0) {
            continue;
        }
        result.push_back(value[u]);
        s.push(left_child[u]);
        s.push(right_child[u]);
    }
    reverse(result.begin(), result.end());
    return result;
}

int main() {
    mt19937 rng(20050314);
    int previous_n = 0;

    for (int test = 1; test <= 10000; test++) {
        int n = static_cast<int>(rng() % 500) + 1;
        for (int u = 1; u <= max(n, previous_n); u++) {
            left_child[u] = right_child[u] = 0;
        }
        previous_n = n;
        preorder_order.clear();
        inorder_order.clear();
        postorder_order.clear();

        for (int u = 1; u <= n; u++) {
            value[u] = static_cast<int>(rng());
            if (u * 2 <= n) {
                left_child[u] = u * 2;
            }
            if (u * 2 + 1 <= n) {
                right_child[u] = u * 2 + 1;
            }
            if (rng() % 2 == 0) {
                swap(left_child[u], right_child[u]);
            }
        }

        preorder(1);
        inorder(1);
        postorder(1);
        if (preorder_order != iterative_preorder(1) || inorder_order != iterative_inorder(1) ||
            postorder_order != iterative_postorder(1)) {
            printf("test %d failed\n", test);
            return 1;
        }
    }

    printf("10000 random tests passed\n");
    return 0;
}
