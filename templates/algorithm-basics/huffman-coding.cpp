// 随机验证：../verification/huffman-coding-random.cpp
// 根据正频率构造一套确定的二进制哈夫曼编码。

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct HuffmanNode {
    ll weight;
    int left;
    int right;
};

struct HuffmanResult {
    ll encoded_bits;
    vector<string> codes;
};

void build_codes(int u, int symbol_count, const vector<HuffmanNode>& nodes,
                 string& code, vector<string>& codes) {
    if (u <= symbol_count) {
        codes[u] = code;
        return;
    }

    code.push_back('0');
    build_codes(nodes[u].left, symbol_count, nodes, code, codes);
    code.pop_back();

    code.push_back('1');
    build_codes(nodes[u].right, symbol_count, nodes, code, codes);
    code.pop_back();
}

HuffmanResult huffman_coding(int n, const vector<ll>& frequency) {
    vector<HuffmanNode> nodes(2 * n + 5);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<pair<ll, int>>>
        q;

    for (int i = 1; i <= n; i++) {
        nodes[i] = {frequency[i], 0, 0};
        q.push({frequency[i], i});
    }

    vector<string> codes(n + 5);
    if (n == 1) {
        codes[1] = "0";
        return {frequency[1], codes};
    }

    int node_count = n;
    ll encoded_bits = 0;
    while (q.size() > 1) {
        auto [weight_x, x] = q.top();
        q.pop();
        auto [weight_y, y] = q.top();
        q.pop();

        node_count++;
        ll weight_sum = weight_x + weight_y;
        nodes[node_count] = {weight_sum, x, y};
        encoded_bits += weight_sum;
        q.push({weight_sum, node_count});
    }

    int root = q.top().second;
    string code;
    build_codes(root, n, nodes, code, codes);
    return {encoded_bits, codes};
}

int main() {
    int n;
    scanf("%d", &n);

    vector<string> symbols(n + 5);
    vector<ll> frequency(n + 5);
    for (int i = 1; i <= n; i++) {
        char buffer[105];
        scanf("%100s%lld", buffer, &frequency[i]);
        symbols[i] = buffer;
    }

    HuffmanResult result = huffman_coding(n, frequency);
    printf("%lld\n", result.encoded_bits);
    for (int i = 1; i <= n; i++) {
        printf("%s %s\n", symbols[i].c_str(), result.codes[i].c_str());
    }
    return 0;
}
