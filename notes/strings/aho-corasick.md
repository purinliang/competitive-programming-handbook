# AC 自动机

> 最近修订：2026-08-17 08:56 +10:00（未审阅）

内容审核系统保存了许多关键词，需要统计每个关键词在一篇长文本中出现多少次。若有
`pattern_count` 个模式串，逐个对文本做字符串匹配，总时间会重复扫描同一段文本。

[Trie](trie.md) 能让模式串共享前缀，但从文本的某个位置匹配失败以后，仍不知道
应该退到哪个前缀继续尝试。AC 自动机（Aho–Corasick automaton）在 Trie 上增加
失败指针，让所有模式串只用一次线性扫描就能同时匹配。

本篇输入只含小写英文字母，并统计每个模式串在文本中的出现次数；重叠出现也会计入。

## Trie 为什么还不够

模式串为：

```text
he
she
hers
```

扫描文本 `ushers` 时，读完 `us` 后，Trie 中不存在这条前缀。若直接回到根节点并
重新读取字符，就会反复检查已经读过的文本。

读到 `she` 时又有另一个问题：当前 Trie 节点代表 `she`，但它的后缀 `he` 也是
一个完整模式串。只检查当前节点会漏掉这次 `he`。

我们需要让每个节点知道：当前前缀不能继续以后，哪个更短的后缀仍可能是某个模式串
的前缀。

## 失败指针

Trie 中从根到节点 `u` 的字符组成字符串 $S_u$。`fail[u]` 指向满足下列条件的
最长字符串对应节点：

1. 它是 $S_u$ 的真后缀；
2. 它也是某个模式串的前缀，也就是 Trie 中已经存在的节点。

例如模式串中同时有 `he` 和 `she`，代表 `she` 的节点失败指针会指向代表 `he`
的节点。若下一字符无法延长 `she`，仍可以把已经读到的后缀 `he` 保留下来。

根节点编号为 `1`，它的失败指针仍指向根。根的直接孩子没有更长的可用真后缀，失败
指针也指向根。

## 按深度构造失败指针

计算 `fail[u]` 时，需要先知道比 `u` 更浅节点的失败指针，因此使用 BFS 按 Trie
深度从小到大处理。

假设从 `u` 沿字符 `c` 可以走到真实孩子 `v`。删去 $S_v$ 开头若干字符后，最长
仍可保留的后缀可以从 `fail[u]` 出发继续沿 `c` 寻找，所以：

```cpp
fail[v] = child[fail[u]][c];
```

如果 `u` 没有字符 `c` 的真实孩子，就把这个空位置补成失败以后应走的状态：

```cpp
child[u][c] = child[fail[u]][c];
```

补完以后，`child[u][c]` 不再只表示 Trie 的真实树边，而是自动机读入字符 `c`
时的完整转移。匹配阶段每个字符只需执行一次数组访问，不必反复沿失败指针跳转。

> 构造自动机以后，空转移已经被补成自动机转移，不能再把同一份 `child` 当成原始
> Trie 插入新模式串。应当先插入全部模式串，再统一构造失败指针。

## 一次扫描全部模式串

扫描文本时，`u` 表示已经读入的文本后缀中，能够匹配 Trie 前缀的最长部分：

```cpp
u = child[u][c];
occurrence[u]++;
```

仅记录当前状态仍会漏掉它的后缀模式。例如当前状态代表 `she`，还应当给失败指针
指向的 `he` 计数。

若每读一个字符都沿整条失败指针链加一，最坏情况下又可能退化。更好的方法是先只给
当前状态计数，扫描结束后按 BFS 顺序的逆序传播：

```cpp
occurrence[fail[u]] += occurrence[u];
```

节点越深越先传播。每次到达 `u`，意味着 `fail[u]` 代表的后缀也出现了一次；把
整棵失败指针树自底向上汇总以后，每个模式串结尾节点的计数就是它的出现次数。

## 完整代码

输入若干模式串和一篇文本，按输入顺序输出每个模式串的出现次数。重复输入相同模式串
时，它们指向同一个结尾节点，因而输出相同答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct AhoCorasick {
    vector<array<int, 26>> child;
    vector<int> fail;
    vector<int> bfs_order;

    AhoCorasick() {
        clear();
    }

    void clear() {
        child.assign(2, array<int, 26>{});
        fail.assign(2, 1);
        bfs_order.clear();
    }

    int new_node() {
        child.push_back(array<int, 26>{});
        fail.push_back(1);
        return child.size() - 1;
    }

    int insert(const string& pattern) {
        int u = 1;

        for (char letter : pattern) {
            int c = letter - 'a';

            if (child[u][c] == 0) {
                child[u][c] = new_node();
            }
            u = child[u][c];
        }
        return u;
    }

    void build() {
        queue<int> q;
        fail[1] = 1;
        bfs_order.clear();

        for (int c = 0; c < 26; c++) {
            int v = child[1][c];

            if (v != 0) {
                fail[v] = 1;
                q.push(v);
            } else {
                child[1][c] = 1;
            }
        }

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            bfs_order.push_back(u);

            for (int c = 0; c < 26; c++) {
                int v = child[u][c];

                if (v != 0) {
                    fail[v] = child[fail[u]][c];
                    q.push(v);
                } else {
                    child[u][c] = child[fail[u]][c];
                }
            }
        }
    }

    vector<ll> count_occurrences(const string& text) const {
        vector<ll> occurrence(child.size(), 0);
        int u = 1;

        for (char letter : text) {
            int c = letter - 'a';
            u = child[u][c];
            occurrence[u]++;
        }

        for (int i = (int)bfs_order.size() - 1; i >= 0; i--) {
            u = bfs_order[i];
            occurrence[fail[u]] += occurrence[u];
        }
        return occurrence;
    }
};

void solve() {
    int pattern_count;
    cin >> pattern_count;

    AhoCorasick automaton;
    vector<int> terminal(pattern_count + 5);

    for (int i = 1; i <= pattern_count; i++) {
        string pattern;
        cin >> pattern;
        terminal[i] = automaton.insert(pattern);
    }

    automaton.build();

    string text;
    cin >> text;
    vector<ll> occurrence = automaton.count_occurrences(text);

    for (int i = 1; i <= pattern_count; i++) {
        cout << occurrence[terminal[i]] << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

设全部模式串的总长度为 $S$，文本长度为 $T$，字符集大小为常数 26：

- 插入模式串需要 $O(S)$；
- 构造自动机需要 $O(26S)$，通常记作 $O(S)$；
- 扫描文本和逆序汇总需要 $O(T+S)$；
- 空间复杂度为 $O(26S)$，通常记作 $O(S)$。

## 为什么不会漏掉或重复统计

扫描到文本的每个位置时，当前状态代表以该位置结尾、同时又是 Trie 前缀的最长
后缀。所有同样以该位置结尾的更短模式串，都位于当前状态的失败指针链上。

扫描阶段给最长状态加一，逆序传播再把这一次出现恰好传给链上的每个后缀节点。一个
模式串每在某个文本位置结尾，就收到一次贡献；不在该位置结尾，就不会位于对应失败
链上。因此所有出现都会被计入，而且每次只计一次。

## 常见错误

- 只构造 Trie，没有为失配状态建立失败指针；
- 失败指针按照任意顺序构造，在浅层状态尚未完成时处理深层节点；
- 只统计扫描时到达的节点，漏掉同一位置结尾的后缀模式串；
- 沿失败指针链逐字符统计，重新引入最坏情况下的重复工作；
- 传播出现次数时按 BFS 正序处理，使深层贡献来不及继续向上汇总；
- 构造完成后继续向已经补全转移的 `child` 中插入模式串；
- 忘记同一个模式串可能重复输入，错误地只给节点保存一个模式串编号；
- 文本字符集与转移数组不一致，却仍直接计算 `letter - 'a'`。

## 需要记住什么

- Trie 单独进行多模式匹配时，失配以后缺少什么信息？
- `fail[u]` 代表哪个后缀？
- 为什么失败指针需要按照 BFS 顺序构造？
- 为什么可以把不存在的 Trie 边补成自动机转移？
- 扫描文本时，当前状态代表什么？
- 为什么出现次数要按照 BFS 逆序沿失败指针汇总？
- AC 自动机的时间复杂度为什么与模式串总长度和文本长度近似线性？

失败指针的定义和逆序计数传播需要能够重新推导；具体数组初始化顺序可以从完整代码
查阅，不要求逐行背诵。
