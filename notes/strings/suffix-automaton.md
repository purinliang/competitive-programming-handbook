# 后缀自动机

> 最近修订：2026-08-23 08:14 +10:00（未审阅）

给定一篇文本，还要回答许多模式串在文本中出现多少次。逐个做字符串匹配会重复扫描
文本；保存所有子串又需要平方级空间。

后缀自动机（Suffix Automaton，SAM）用至多 `2n` 个状态概括长度为 `n` 的字符串
全部子串。沿转移读取一个字符串：

- 能走完，说明它是原文本的子串；
- 结束状态保存的出现次数，就是这个子串在文本中的出现次数。

它没有为每个子串建立独立节点。真正被合并的是“在文本中拥有完全相同结束位置集合”
的子串；这些子串对继续向右延伸的行为完全相同。

## 结束位置集合

对文本中的一个子串 `t`，定义 `endpos(t)` 为它所有出现的结束位置集合。

以 `ababa` 为例：

```text
endpos("ba")  = {2, 4}
endpos("aba") = {2, 4}
```

两者虽然内容和长度不同，却在完全相同的位置结束。以后再向右接同一个字符时，能够成功
延伸的位置也相同，因此可以归入同一个状态。

后缀自动机的一个状态代表一个 `endpos` 等价类。状态 `u` 保存：

- `max_length[u]`：这个等价类中最长子串长度；
- `link[u]`：删去若干开头后，进入严格更大的 `endpos` 集合的最长后缀状态；
- `child[u][c]`：在代表的子串后追加字符 `c` 后到达的状态；
- `occurrence[u]`：该等价类的结束位置数量。

## 一个状态代表哪些长度

除根节点外，状态 `u` 代表的子串长度恰好形成连续区间：

$$
max\_length[link[u]]+1
\quad\text{到}\quad
max\_length[u].
$$

每个长度对应这个状态最长代表串的一个后缀，并且它们拥有相同 `endpos`。

因此状态代表的不同子串数量是：

$$
max\_length[u]-max\_length[link[u]].
$$

这个结论会在后续本质不同子串计数中直接使用。本文先集中完成状态构造和出现次数。

## 在线加入一个字符

算法从左到右扫描文本。`last` 表示整个当前前缀对应的状态。

加入新字符 `c` 时，新建状态 `current`：

```cpp
max_length[current] = max_length[last] + 1;
occurrence[current] = 1;
```

新增字符产生一个新的前缀结束位置，所以 `occurrence[current]=1`。

从 `last` 沿后缀链接向上跳。对所有尚无字符 `c` 转移的状态，补上：

```cpp
child[p][c] = current;
```

这些状态代表的后缀原来都不能接 `c`；新字符出现后，它们第一次拥有这个延伸。

## 第一种情况：一路跳到空状态

若沿后缀链接最终到达编号 `0`，说明以前没有任何相关后缀能接字符 `c`。新状态的最长
可用严格后缀只能是空串，因此：

```cpp
link[current] = 1;
```

根节点编号为 `1`，表示空串；编号 `0` 只表示不存在的状态。

## 第二种情况：直接连接已有状态

若在状态 `p` 找到已有转移：

```cpp
q = child[p][c];
```

并且：

```text
max_length[p] + 1 == max_length[q]
```

说明从 `p` 追加一个字符得到的长度恰好就是 `q` 的最短必要长度，不会把两个应当分开的
长度区间强行合并。此时直接令：

```cpp
link[current] = q;
```

## 第三种情况：克隆状态

若：

```text
max_length[p] + 1 < max_length[q]
```

状态 `q` 同时承担了过短和较长两类上下文。新加入的前缀只应链接到其中较短的一部分，
必须把这个等价类拆开。

新建克隆状态 `clone`：

```cpp
child[clone] = child[q];
link[clone] = link[q];
max_length[clone] = max_length[p] + 1;
occurrence[clone] = 0;
```

它复制 `q` 的转移和后缀链接，因为两者当前拥有相同的未来行为；但缩短
`max_length`，只代表较短的那段长度区间。

克隆状态不是某次新前缀结束位置直接产生的，所以初始出现次数必须为 `0`。

继续沿 `p` 的后缀链接向上，把所有原本指向 `q` 的字符 `c` 转移改向 `clone`。最后：

```cpp
link[q] = clone;
link[current] = clone;
```

克隆不会复制子串出现，只是把原状态中的长度区间和转移来源重新分组。

## 为什么后缀链接能够汇总出现次数

每次加入字符时，`current` 对应一个新的文本前缀结束位置，因此先给它加 `1`。一个状态
`u` 的所有结束位置，也都是它所代表最长子串的后缀状态 `link[u]` 的结束位置：

$$
endpos(u)\subseteq endpos(link[u]).
$$

按 `max_length` 从大到小传播：

```cpp
occurrence[link[u]] += occurrence[u];
```

深状态的贡献会沿后缀链接完整流向所有相关短后缀。最终 `occurrence[u]` 就是该状态
`endpos` 集合大小，也就是状态内任意子串的出现次数。

按长度排序可以用计数排序，因为 `max_length` 位于 `0..n`。

## 查询一个模式串

从根节点开始逐字符转移：

```cpp
u = child[u][c];
```

若某一步不存在转移，模式不是文本子串，答案为 `0`。若能够读完，结束状态可能代表
多个不同长度的子串，但它们拥有同一个 `endpos` 集合，所以直接返回：

```cpp
occurrence[u]
```

查询时间只与模式长度成正比。

## 完整代码

输入一个只含小写英文字母的非空文本，以及若干非空模式串。对每个模式串输出它在文本
中的出现次数，重叠出现也计入。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct SuffixAutomaton {
    int size;
    int last;
    vector<array<int, 26>> child;
    vector<int> link;
    vector<int> max_length;
    vector<ll> occurrence;

    SuffixAutomaton(int text_length) {
        int capacity = 2 * text_length + 5;
        child.assign(capacity, array<int, 26>{});
        link.assign(capacity, 0);
        max_length.assign(capacity, 0);
        occurrence.assign(capacity, 0);
        size = 1;
        last = 1;
    }

    int new_state() {
        ++size;
        child[size].fill(0);
        link[size] = 0;
        max_length[size] = 0;
        occurrence[size] = 0;
        return size;
    }

    void extend(char letter) {
        int c = letter - 'a';
        int current = new_state();
        max_length[current] = max_length[last] + 1;
        occurrence[current] = 1;

        int p = last;
        while (p != 0 && child[p][c] == 0) {
            child[p][c] = current;
            p = link[p];
        }

        if (p == 0) {
            link[current] = 1;
        } else {
            int q = child[p][c];
            if (max_length[p] + 1 == max_length[q]) {
                link[current] = q;
            } else {
                int clone = new_state();
                child[clone] = child[q];
                link[clone] = link[q];
                max_length[clone] = max_length[p] + 1;
                occurrence[clone] = 0;

                while (p != 0 && child[p][c] == q) {
                    child[p][c] = clone;
                    p = link[p];
                }

                link[q] = clone;
                link[current] = clone;
            }
        }

        last = current;
    }

    void build_occurrences(int text_length) {
        vector<int> count(text_length + 5, 0);
        vector<int> order(size + 1, 0);

        for (int u = 1; u <= size; ++u) {
            ++count[max_length[u]];
        }
        for (int length = 1; length <= text_length; ++length) {
            count[length] += count[length - 1];
        }
        for (int u = size; u >= 1; --u) {
            order[count[max_length[u]]--] = u;
        }

        for (int i = size; i >= 2; --i) {
            int u = order[i];
            occurrence[link[u]] += occurrence[u];
        }
    }

    ll count_occurrences(const string& pattern) const {
        int u = 1;

        for (char letter : pattern) {
            int c = letter - 'a';
            if (child[u][c] == 0) {
                return 0;
            }
            u = child[u][c];
        }
        return occurrence[u];
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    cin >> text;

    SuffixAutomaton automaton(text.size());
    for (char letter : text) {
        automaton.extend(letter);
    }
    automaton.build_occurrences(text.size());

    int query_count;
    cin >> query_count;
    while (query_count--) {
        string pattern;
        cin >> pattern;
        cout << automaton.count_occurrences(pattern) << '\n';
    }

    return 0;
}
```

## 正确性

构造过程中，`last` 始终代表完整当前前缀。新字符加入后，从 `last` 及其后缀状态补全
缺失转移，恰好加入所有以新位置结尾的新子串。

若已有转移对应的状态长度连续，直接建立后缀链接即可；若长度区间出现跳跃，克隆状态
复制未来行为并缩短最大长度，再重定向相关转移，把原等价类拆成两个合法连续区间。
因此构造结束后，从根能够读出的字符串恰好是文本的全部子串。

每个新 `current` 记录一个前缀结束位置，克隆不新增结束位置。按最大长度逆序沿后缀链接
传播后，每个结束位置恰好进入它所有后缀所属的状态，所以 `occurrence[u]` 等于
`endpos(u)` 大小。

查询模式时，确定转移唯一模拟它在自动机中的路径。路径不存在当且仅当模式不是子串；
路径存在时，结束状态的 `occurrence` 正好是模式出现次数。

## 复杂度

固定小写字母表时：

- 状态数不超过 `2n`；
- 构造后缀自动机：`O(n)`；
- 汇总出现次数：`O(n)`；
- 单次查询：`O(pattern_length)`；
- 空间复杂度：`O(26n)`，通常记作 `O(n)`。

若字符集很大，可把固定数组改成有序映射或哈希表；转移的时间和空间复杂度会随容器
改变。

## 常见错误

- 把一个状态误解为一个唯一子串，而忽略它代表连续长度区间；
- 克隆状态的 `max_length` 仍复制 `q`，没有缩短到 `max_length[p]+1`；
- 给克隆状态设置 `occurrence=1`，凭空增加文本结束位置；
- 建立克隆后只修改 `link[current]`，忘记修改 `link[q]`；
- 重定向转移时不检查它是否仍指向原状态 `q`；
- 出现次数按长度从小到大传播，使深层贡献来不及继续向上；
- 根节点与不存在状态都使用编号 `0`，让循环结束条件和真实状态混淆；
- 查询时返回路径长度，而不是结束状态的 `endpos` 大小；
- 文本与模式字符集不一致，却直接使用 `letter-'a'`。

## 需要记住什么

- `endpos` 等价类为什么可以合并成一个状态？
- `max_length[u]` 与 `link[u]` 怎样确定状态代表的长度区间？
- 加入一个字符时，为什么要沿 `last` 的后缀链接补转移？
- 在什么条件下可以直接链接已有状态 `q`？
- 克隆状态解决了怎样的长度区间冲突？
- 克隆的出现次数为什么初始化为 `0`？
- 为什么出现次数要按最大长度从大到小沿后缀链接传播？
- 一个模式走到状态 `u` 后，为什么 `occurrence[u]` 就是它的出现次数？
