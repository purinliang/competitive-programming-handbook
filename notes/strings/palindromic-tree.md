# 回文自动机

> 最近修订：2026-08-23 08:25 +10:00（未审阅）

一个字符串可能有平方级回文子串出现。例如全部字符相同的字符串中，每个区间都是回文。
但本质不同的回文子串至多只有 `n` 个：每加入一个新字符，至多产生一个从未出现过的
回文后缀。

回文自动机（Palindromic Tree，也称 Eertree）为每个本质不同回文串建立一个状态，并
用失败指针连接它的最长严格回文后缀。它可以在线完成：

- 统计本质不同回文子串数量；
- 统计每个回文子串出现次数；
- 找到最长回文子串长度；
- 在后续 DP 中沿回文后缀关系转移。

本文输入一个字符串，同时输出前三项统计结果。

## 状态表示一个回文串

与后缀自动机一个状态代表多个普通子串不同，回文自动机中的每个普通状态对应一个唯一
回文串。

状态 `u` 保存：

- `length[u]`：回文串长度；
- `fail[u]`：它的最长严格回文后缀状态；
- `child[u][c]`：在两端各加入字符 `c` 后得到的回文状态；
- `occurrence[u]`：这个回文在文本中的出现次数。

若状态 `u` 代表 `aba`，那么 `child[u]['c']` 代表：

```text
c + aba + c = cabac
```

前提是这个回文确实在已经扫描的文本中出现。

## 为什么需要两个根

偶数长度与奇数长度的回文扩展在最短处表现不同：

- 偶数回文从空串开始，例如 `"" -> aa`；
- 奇数回文从单个中心字符开始，例如 `a -> bab`。

为了统一处理，建立两个虚拟根：

```text
状态 1：length = -1，奇根
状态 2：length = 0，偶根
```

奇根不是实际字符串。检查新字符能否包住它时，比较位置会恰好落在新字符自身，因此
永远成功；这样单字符回文也能由同一段扩展逻辑产生。

偶根表示真实空串。单字符回文的失败指针指向偶根；偶根的失败指针指向奇根。

## 加入新字符时先找最长可扩展后缀

假设正在加入位置 `pos` 的字符，`last` 表示上一个前缀的最长回文后缀。

状态 `u` 代表长度 `length[u]` 的回文后缀。若要让新字符包在它的两端，前一端位置是：

```text
pos - length[u] - 1
```

检查：

```cpp
text[pos - length[u] - 1] == text[pos]
```

若不相等，就沿：

```cpp
u = fail[u];
```

跳到更短回文后缀继续尝试。奇根一定能让过程终止。

找到的第一个状态 `p` 是最长可扩展回文后缀；新回文长度为：

$$
length[p]+2.
$$

## 已有状态与新状态

若：

```cpp
child[p][c] != 0
```

说明这个回文以前已经出现，直接移动到已有状态并给出现次数加一。

否则新建状态 `current`，令：

```cpp
length[current] = length[p] + 2;
child[p][c] = current;
```

加入一个字符时可能产生很多回文后缀，但其中至多一个是本质不同的新回文：若某个较短
回文后缀第一次出现，那么包含它的当前最长新回文的内部或后缀关系会迫使它此前已经随
更早位置出现。算法只需为最长可扩展结果检查一次新状态。

## 新状态的失败指针

长度为 `1` 的回文没有非空严格回文后缀，直接链接偶根：

```cpp
fail[current] = 2;
```

更长回文需要从 `fail[p]` 开始，继续寻找能够被当前字符包住的最长回文后缀。设找到
状态 `candidate`，那么：

```cpp
fail[current] = child[candidate][c];
```

右侧状态一定已经存在，因为它是当前新回文的严格后缀，长度更短，并且也在当前位置
结尾。

最后令 `last` 指向当前最长回文后缀，并执行：

```cpp
occurrence[last]++;
```

此时先只记录“每个位置的最长回文后缀”出现了一次。

## 沿失败指针汇总所有出现

若回文 `P` 在某个位置结束，那么它的最长严格回文后缀 `fail[P]` 也在同一位置结束。
因此按回文长度从大到小传播：

```cpp
occurrence[fail[u]] += occurrence[u];
```

每个位置的最长回文后缀贡献会沿失败指针链传给这个位置结尾的全部回文。传播结束后，
每个普通状态的 `occurrence` 就是对应回文在文本中的完整出现次数。

状态长度位于 `1..n`，可以用计数排序得到从小到大的状态顺序，再逆序传播。

## 三个答案

设普通状态编号为 `3..size`。

### 本质不同回文数量

每个普通状态对应一个唯一回文，因此：

```cpp
distinct = size - 2;
```

减去的是奇根和偶根。

### 回文子串出现总数

每个区间出现应按对应回文状态计数：

```cpp
total = sum(occurrence[u]);
```

只汇总普通状态，不包括两个根。

### 最长回文长度

直接取所有普通状态的：

```cpp
max(length[u])
```

## 完整代码

输入一个只含小写英文字母的非空字符串，依次输出：

1. 本质不同回文子串数量；
2. 回文子串出现总数；
3. 最长回文子串长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct PalindromicTree {
    int size;
    int last;
    vector<char> text;
    vector<array<int, 26>> child;
    vector<int> length;
    vector<int> fail;
    vector<ll> occurrence;

    PalindromicTree(int text_length) {
        int capacity = text_length + 5;
        text.assign(capacity, 0);
        child.assign(capacity, array<int, 26>{});
        length.assign(capacity, 0);
        fail.assign(capacity, 0);
        occurrence.assign(capacity, 0);

        size = 2;
        last = 2;
        length[1] = -1;
        fail[1] = 1;
        length[2] = 0;
        fail[2] = 1;
    }

    int new_state(int palindrome_length) {
        ++size;
        child[size].fill(0);
        length[size] = palindrome_length;
        fail[size] = 0;
        occurrence[size] = 0;
        return size;
    }

    int find_extendable_suffix(int u, int pos) const {
        while (text[pos - length[u] - 1] != text[pos]) {
            u = fail[u];
        }
        return u;
    }

    void extend(char letter, int pos) {
        text[pos] = letter;
        int c = letter - 'a';
        int p = find_extendable_suffix(last, pos);

        if (child[p][c] == 0) {
            int current = new_state(length[p] + 2);

            if (length[current] == 1) {
                fail[current] = 2;
            } else {
                int candidate = find_extendable_suffix(fail[p], pos);
                fail[current] = child[candidate][c];
            }
            child[p][c] = current;
        }

        last = child[p][c];
        ++occurrence[last];
    }

    void build_occurrences(int text_length) {
        int real_states = size - 2;
        vector<int> count(text_length + 5, 0);
        vector<int> order(real_states + 1, 0);

        for (int u = 3; u <= size; ++u) {
            ++count[length[u]];
        }
        for (int value = 1; value <= text_length; ++value) {
            count[value] += count[value - 1];
        }
        for (int u = size; u >= 3; --u) {
            order[count[length[u]]--] = u;
        }

        for (int i = real_states; i >= 1; --i) {
            int u = order[i];
            occurrence[fail[u]] += occurrence[u];
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input;
    cin >> input;

    PalindromicTree tree(input.size());
    for (int pos = 1; pos <= (int)input.size(); ++pos) {
        tree.extend(input[pos - 1], pos);
    }
    tree.build_occurrences(input.size());

    int distinct = tree.size - 2;
    ll total = 0;
    int longest = 0;

    for (int u = 3; u <= tree.size; ++u) {
        total += tree.occurrence[u];
        longest = max(longest, tree.length[u]);
    }

    cout << distinct << '\n';
    cout << total << '\n';
    cout << longest << '\n';
    return 0;
}
```

## 正确性

加入位置 `pos` 时，沿 `last` 的失败指针枚举上一个前缀的全部回文后缀。第一个能够被
新字符包住的状态给出当前前缀最长回文后缀；若对应转移不存在，就恰好建立这个新回文
的唯一状态。因此每个本质不同回文建立一次，且所有新回文都会被发现。

新状态的失败指针从内部回文的失败指针继续寻找，得到当前回文最长严格回文后缀。两个
虚拟根保证单字符、奇数和偶数回文都使用同一逻辑。

每个文本位置先给其最长回文后缀加一。任意更短回文后缀都位于这条状态的失败指针链上；
按长度逆序传播后，每个位置恰好给以它结尾的每个回文贡献一次。因此各状态出现次数、
总出现数和最长长度都正确。

## 复杂度

每加入一个字符至多建立一个普通状态，状态总数不超过 `n+2`。固定小写字母表时：

- 构造回文自动机：`O(n)`；
- 汇总出现次数：`O(n)`；
- 空间复杂度：`O(26n)`，通常记作 `O(n)`。

若使用映射保存稀疏转移，复杂度还会包含相应容器的访问成本。

## 与 Manacher 的区别

Manacher 以每个中心为对象，在线性时间内求每个中心能够扩展的最大半径，特别适合最长
回文和回文区间判定。

回文自动机以本质不同回文为状态，更适合：

- 统计不同回文种类；
- 汇总每种回文的出现次数；
- 沿最长回文后缀关系做转移。

只求最长回文时，Manacher 通常更短；需要“回文种类之间的结构”时，回文自动机才体现
价值。

## 常见错误

- 只建立一个长度为 `0` 的根，单字符或奇偶回文需要大量特判；
- 奇根长度写成 `0`，使首次扩展的比较位置错误；
- 寻找可扩展后缀时使用 `pos-length[u]`，少减了右端新字符占据的一格；
- 新状态长度写成 `length[p]+1`，而不是两端各增加一个字符后的 `+2`；
- 长度为 `1` 的状态没有把失败指针设为偶根；
- 每个位置给整条失败链直接加一，最坏情况下重复扫描；
- 出现次数按长度正序传播，使长回文贡献没有继续传向更短后缀；
- 把两个虚拟根计入本质不同回文数量或出现总数；
- 只为最长回文使用复杂结构，没有根据问题选择更简单的 Manacher。

## 需要记住什么

- 回文自动机的普通状态与本质不同回文是什么关系？
- 为什么要同时建立长度 `-1` 和长度 `0` 的两个根？
- 加入位置 `pos` 时，怎样判断回文后缀能否被新字符包住？
- 为什么每加入一个字符至多产生一个本质不同的新回文？
- 新状态的失败指针怎样找到？
- 为什么先只给最长回文后缀加一，再沿失败指针逆长度传播？
- 回文自动机与 Manacher 各自更适合什么问题？
