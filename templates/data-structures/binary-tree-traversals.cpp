// 随机验证：../verification/binary-tree-traversals-random.cpp
// 孩子数组存储的二叉树前序、中序与后序遍历。

#include <bits/stdc++.h>

using namespace std;

const int MAXN = 2e5 + 5;

int value[MAXN];
int left_child[MAXN];
int right_child[MAXN];
vector<int> preorder_order;
vector<int> inorder_order;
vector<int> postorder_order;

void preorder(int u) {
    if (u == 0) {
        return;
    }
    preorder_order.push_back(value[u]);
    preorder(left_child[u]);
    preorder(right_child[u]);
}

void inorder(int u) {
    if (u == 0) {
        return;
    }
    inorder(left_child[u]);
    inorder_order.push_back(value[u]);
    inorder(right_child[u]);
}

void postorder(int u) {
    if (u == 0) {
        return;
    }
    postorder(left_child[u]);
    postorder(right_child[u]);
    postorder_order.push_back(value[u]);
}

void print(const vector<int>& order) {
    for (int i = 0; i < static_cast<int>(order.size()); i++) {
        printf("%d%c", order[i], " \n"[i + 1 == static_cast<int>(order.size())]);
    }
}

int main() {
    int n, root;
    scanf("%d%d", &n, &root);
    for (int u = 1; u <= n; u++) {
        scanf("%d%d%d", &value[u], &left_child[u], &right_child[u]);
    }

    preorder(root);
    inorder(root);
    postorder(root);
    print(preorder_order);
    print(inorder_order);
    print(postorder_order);
    return 0;
}
