# Trie

> 最近修订：2026-08-17 04:27 +10:00（未审阅）

给定许多单词，我们可能反复询问：

- 某个单词出现了多少次；
- 有多少个单词以给定字符串开头；
- 从某个前缀还能接出哪些字符。

逐个扫描全部单词，一次查询可能需要检查所有字符。Trie 把相同前缀只存一次，
查询时间只取决于待查询字符串的长度。

Trie 常译为**字典树**或**前缀树**。本书标题保留竞赛代码和题面中常用的
`Trie`。

## 从共同前缀建树

插入三个单词：

```text
app
apple
ape
```

它们都从 `a` 开始，接着都走向 `p`，到第三个字符才分叉：

```text
root
  |
  a
  |
  p
 / \
p   e
|
l
|
e
```

树根表示空前缀。沿根到某个节点经过的字符，拼成这个节点代表的前缀。

一个节点不等于一个完整单词。`app` 与 `apple` 共享路径；`app` 对应的节点
既是一个单词的结尾，也是更长单词的中间节点。因此必须另外记录“有多少单词在
这里结束”。

## 节点编号

输入只含小写英文字母，每个节点最多有 `26` 条出边。用数组保存下一节点：

```cpp
vector<array<int, 26>> child;
```

`child[u][c]` 表示从节点 `u` 沿字符 `c` 走到的节点编号。

本书的数据结构节点从 `1` 开始：

- 节点 `1` 是根；
- 节点 `0` 表示这条边不存在；
- 每创建一个新节点，就取得下一个正整数编号。

这种约定让“空指针”和真实节点天然区分，也与树、线段树等结构的节点习惯一致。

## 插入一个单词

从根节点开始，依次处理单词中的每个字符：

```cpp
int u = 1;

for (char letter : word) {
    int c = letter - 'a';

    if (child[u][c] == 0) {
        child[u][c] = new_node();
    }
    u = child[u][c];
}
```

若边不存在，就创建节点；若已经存在，就复用其他单词留下的共同前缀。

到达最后一个字符后：

```cpp
terminal_count[u]++;
```

`terminal_count[u]` 记录有多少个已插入单词恰好在节点 `u` 结束。使用计数而
不是 `bool`，才能保留重复插入的单词。

## 统计前缀

插入单词时，每走到一个节点，就说明这个单词经过了对应前缀：

```cpp
u = child[u][c];
prefix_count[u]++;
```

于是查询前缀时，只需沿字符走到最后一个节点并返回 `prefix_count[u]`。

例如插入 `app`、`apple` 和 `ape`：

- 前缀 `a` 的计数为 `3`；
- 前缀 `ap` 的计数为 `3`；
- 前缀 `app` 的计数为 `2`；
- 单词 `app` 的结尾计数为 `1`。

`terminal_count` 回答“完整单词出现几次”，`prefix_count` 回答“有几个单词
经过此前缀”，二者不能混用。

## 查询不存在的路径

查询过程中如果发现：

```cpp
child[u][c] == 0
```

说明没有任何已插入单词经过这条路径，可以立即返回 `0`。不能继续把 `u` 赋值
为 `0` 后访问下一层；节点 `0` 只是不存在的标记，不是真实 Trie 节点。

## 为什么复杂度只与字符串长度有关

插入或查询长度为 $L$ 的字符串时，每个字符只进行一次数组访问，因此时间复杂度
是 $O(L)$。

所有节点的数量不超过“所有插入字符串的总长度加一个根节点”，因为每处理一个
字符最多新建一个节点。设总字符数为 $S$，空间复杂度为 $O(26S)$；字母表大小
`26` 是常数时通常写作 $O(S)$。

固定 `26` 个孩子访问很快，但字符种类很大时会浪费空间。那时可以把孩子改成
`map`、`unordered_map` 或压缩后的边表；这属于存储实现的取舍，不改变 Trie
按前缀共享路径的本质。

## 完整代码

下面维护一个允许重复单词的 Trie。操作含义：

```text
1 word  插入 word
2 word  查询 word 作为完整单词出现多少次
3 word  查询有多少个单词以 word 为前缀
```

输入单词只含小写英文字母。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Trie {
    vector<array<int, 26>> child;
    vector<int> terminal_count;
    vector<int> prefix_count;

    Trie() {
        clear();
    }

    void clear() {
        child.assign(2, array<int, 26>{});
        terminal_count.assign(2, 0);
        prefix_count.assign(2, 0);
    }

    int new_node() {
        child.push_back(array<int, 26>{});
        terminal_count.push_back(0);
        prefix_count.push_back(0);
        return child.size() - 1;
    }

    void insert(const string& word) {
        int u = 1;

        for (char letter : word) {
            int c = letter - 'a';

            if (child[u][c] == 0) {
                child[u][c] = new_node();
            }
            u = child[u][c];
            prefix_count[u]++;
        }
        terminal_count[u]++;
    }

    int count_word(const string& word) const {
        int u = 1;

        for (char letter : word) {
            int c = letter - 'a';

            if (child[u][c] == 0) {
                return 0;
            }
            u = child[u][c];
        }
        return terminal_count[u];
    }

    int count_prefix(const string& prefix) const {
        int u = 1;

        for (char letter : prefix) {
            int c = letter - 'a';

            if (child[u][c] == 0) {
                return 0;
            }
            u = child[u][c];
        }
        return prefix_count[u];
    }
};

void solve() {
    int q;
    cin >> q;

    Trie trie;

    while (q--) {
        int operation;
        string word;
        cin >> operation >> word;

        if (operation == 1) {
            trie.insert(word);
        } else if (operation == 2) {
            cout << trie.count_word(word) << '\n';
        } else {
            cout << trie.count_prefix(word) << '\n';
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 常见错误

- 只记录路径，不记录某个节点是否为单词结尾；
- 用 `bool` 标记结尾，导致重复单词计数丢失；
- 把 `terminal_count` 当作前缀计数；
- 忘记把 `0` 留给不存在的孩子；
- 查询缺失路径时继续访问节点 `0`；
- 清空 Trie 时只清计数，没有同时清除孩子关系；
- 字符集不止小写英文字母，却仍直接使用大小为 `26` 的数组。

## 需要记住什么

- Trie 为什么能共享不同单词的共同前缀？
- 为什么一个节点需要单独记录单词是否在这里结束？
- `terminal_count` 与 `prefix_count` 分别回答什么问题？
- 节点 `0` 和根节点 `1` 分别表示什么？
- 为什么节点总数不超过插入字符串的总字符数加一？

