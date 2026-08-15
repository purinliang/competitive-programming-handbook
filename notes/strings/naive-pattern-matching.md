# 字符串：模式匹配与朴素算法

> 最近修订：2026-08-13 23:07 +10:00（未审阅）

给定一段较长文本和一个较短模式串，模式匹配（pattern matching）要找出模式串在哪些位置完整、连续地出现在文本中。

例如模式串 `aba` 在文本 `ababa` 中从位置 `1` 和位置 `3` 开始出现。两个匹配共享中间的字符 `a`，所以模式匹配必须明确是否允许重叠；本篇要求输出全部出现位置，包括重叠匹配。

本篇先固定文本、模式串与出现位置的定义，再枚举所有可能起点逐字符检查。这份朴素算法最坏为 $O(nm)$，也是以后验证 KMP、Z 函数与字符串哈希的可靠小规模参考算法。

## 文本与模式串

记：

- 文本串为 `text[1..n]`；
- 模式串为 `pattern[1..m]`。

若模式串从文本位置 `start` 开始出现，它占用的闭区间是：

```text
text[start..start + m - 1]
```

并且对于每个模式位置 `j = 1..m`，都必须满足：

$$
text[start+j-1]=pattern[j].
$$

当 `j = 1` 时比较 `text[start]`；当 `j = m` 时比较 `text[start + m - 1]`。表达式中的 `-1` 正是把模式串第 `1` 个字符对齐到文本起点。

## 连续匹配

模式匹配要求模式字符对应文本中的连续位置。例如：

```text
text:    a x b x c
pattern: a   b   c
```

虽然可以按顺序挑出 `a,b,c`，它们并不连续，所以 `abc` 只是文本的一个子序列，不是子串，也不是一次模式匹配。

在起点 `start` 固定以后，模式串第 `j` 个字符只能对应 `text[start + j - 1]`，不能跳过中间文本字符。

## 可能的起点

一个长度为 `m` 的匹配从 `start` 开始时，结束位置是 `start + m - 1`。要完整留在长度为 `n` 的文本内，必须满足：

$$
start+m-1\le n.
$$

因此所有可能起点是：

```text
1, 2, ..., n - m + 1
```

若 `m > n`，不存在任何合法起点，答案自然为空。

不能继续尝试更靠后的起点并依赖字符串结尾阻止访问；算法应当在循环边界上直接保证整个模式串放得下。

## 检查一个起点

先假设当前起点能够匹配：

```cpp
bool matches = true;
```

逐个检查模式字符：

```cpp
for (int j = 1; j <= m; j++) {
    if (text[start + j - 1] != pattern[j]) {
        matches = false;
        break;
    }
}
```

只要发现一个不同字符，当前起点就不可能完整匹配，可以立即 `break`。无需继续比较剩余字符。

循环结束后仍然保持 `matches == true`，说明全部 `m` 对字符都相同，记录当前起点：

```cpp
if (matches) {
    occurrences.push_back(start);
}
```

## 对齐过程

考虑：

```text
text:    a b a b a
pattern: a b a
```

从位置 `1` 开始：

```text
text:    a b a b a
pattern: a b a
```

三对字符全部相同，记录位置 `1`。

从位置 `2` 开始：

```text
text:    a b a b a
pattern:   a b a
```

第一对就是 `b != a`，立即失败。

从位置 `3` 开始：

```text
text:    a b a b a
pattern:     a b a
```

再次全部相同，记录位置 `3`。

每次只把模式串起点向右移动一个位置，因此不会遗漏重叠匹配。

## 重叠匹配

文本 `aaaaa` 与模式 `aaa` 的匹配区间是：

```text
[1, 3]
[2, 4]
[3, 5]
```

三个匹配彼此重叠，但起点 `1,2,3` 都满足逐字符定义，所以都必须输出。

找到一次匹配后不能把起点直接增加 `m`，否则会跳过起点 `2` 和 `3`。朴素算法始终让外层 `start` 每次增加 `1`。

题目若明确要求不重叠出现，需要在找到匹配后采用另一种选择规则；这不是默认模式匹配定义。

## 1-based 字符位置

C++ 原生 `string` 使用 0-based 下标，但本书自定义字符串算法统一使用从 `1` 开始的位置。输入完成后先保存真实长度，再在开头补一个不参与匹配的占位字符：

```cpp
string text, pattern;
cin >> text >> pattern;

int n = text.size();
int m = pattern.size();

text = " " + text;
pattern = " " + pattern;
```

输入只含小写英文字母，占位字符使用空格；算法从不访问它参与比较。转换以后：

```text
text[1..n]       是真实文本
pattern[1..m]    是真实模式串
text[0], pattern[0] 只是占位
```

`string.size()` 此后还包含占位字符，不能再从它反推真实长度，所以函数显式接收已经保存的 `n,m`。

这次转换只发生在输入与算法的边界。算法内部、返回的出现位置和正文公式全部保持 1-based，不在循环中反复加减下标体系。

## 完整匹配函数

朴素匹配只依赖本次输入，没有跨调用持续状态，使用普通函数：

```cpp
vector<int> find_occurrences(const string& text, const string& pattern, int n,
                             int m) {
    vector<int> occurrences;

    for (int start = 1; start + m - 1 <= n; start++) {
        bool matches = true;

        for (int j = 1; j <= m; j++) {
            if (text[start + j - 1] != pattern[j]) {
                matches = false;
                break;
            }
        }

        if (matches) {
            occurrences.push_back(start);
        }
    }
    return occurrences;
}
```

循环条件 `start + m - 1 <= n` 直接表达匹配区间不能越过文本末尾。`m > n` 时第一次判断就为假，不需要额外分支。

返回的 `occurrences` 是 STL `vector`，内部存储位置使用原生 0-based 下标；其中保存的每个数值仍然是文本中的 1-based 出现位置。这两种“下标”描述不同对象，不能混为一谈。

## 正确性

外层循环枚举且只枚举所有满足 `1 <= start`、`start + m - 1 <= n` 的合法起点，所以任何完整匹配的起点都不会遗漏，也不会访问越过文本末尾的位置。

对固定起点，内层循环检查每个 `j = 1..m`：

- 若发现某对字符不同，模式串不可能在该起点完整出现，算法不会记录它；
- 若所有字符都相同，恰好满足模式匹配的逐字符定义，算法记录它。

因此一个起点被记录，当且仅当模式串从该位置完整出现。外层每次只增加 `1`，所以重叠出现也会分别检查并记录。

## 完整代码

输入一行文本串和一行非空模式串，二者只含小写英文字母。保证 `1 <= n,m <= 5000`。程序输出出现次数和所有 1-based 起点；没有匹配时第二行为空行。

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<int> find_occurrences(const string& text, const string& pattern, int n,
                             int m) {
    vector<int> occurrences;

    for (int start = 1; start + m - 1 <= n; start++) {
        bool matches = true;

        for (int j = 1; j <= m; j++) {
            if (text[start + j - 1] != pattern[j]) {
                matches = false;
                break;
            }
        }

        if (matches) {
            occurrences.push_back(start);
        }
    }
    return occurrences;
}

int main() {
    string text, pattern;
    cin >> text >> pattern;

    int n = text.size();
    int m = pattern.size();
    text = " " + text;
    pattern = " " + pattern;

    vector<int> occurrences = find_occurrences(text, pattern, n, m);

    int count = occurrences.size();
    cout << count << '\n';
    for (int i = 0; i < count; i++) {
        cout << occurrences[i] << " \n"[i + 1 == count];
    }
    if (count == 0) {
        cout << '\n';
    }
    return 0;
}
```

输入：

```text
ababaabababa
ababa
```

输出：

```text
3
1 6 8
```

位置 `6` 与位置 `8` 的两个匹配发生重叠，仍然分别输出。

## 复杂度

最多有 `n - m + 1` 个合法起点，每个起点最多比较 `m` 对字符，所以精确的最坏时间上界是：

$$
O((n-m+1)m),
$$

通常简写为 $O(nm)$。

例如文本由许多个 `a` 组成，模式串前 `m - 1` 个字符也是 `a`、最后一个字符是 `b`。大多数起点都要比较到最后一个字符才失败，提前 `break` 不能改善最坏复杂度。

除返回结果外，算法只保存循环变量和布尔量，额外空间为 $O(1)$。若一共有 `k` 个出现位置，返回数组使用 $O(k)$ 空间。

## 与 substr 和 find 比较

可以在每个起点调用 `text.substr(...)` 再与模式串比较，但构造子串会复制字符并产生临时对象。只为了验证对应字符时，直接使用原字符串下标更清楚，也避免重复分配。

标准库 `string::find` 可以方便地完成普通的一次查找，并返回 0-based 起点；需要全部重叠出现时，还要从上一次起点加 `1` 继续查找。本篇手写朴素算法，是为了明确比较过程、复杂度和后续优化目标，不是要求所有简单题都放弃标准库接口。

## 常见错误

### 把子序列当成匹配

模式字符必须对应连续文本位置。能够按顺序挑出字符并不代表模式串连续出现。

### 起点枚举越过末尾

最后合法起点是 `n - m + 1`。更靠后的起点放不下完整模式串，继续比较会越界。

### 下标少一或多一

模式位置 `j` 对应 `text[start + j - 1]`。当 `j = 1` 时应当正好得到 `text[start]`，可以用这个边界检查公式。

### 失配后仍记录起点

发现一个不同字符后应设置 `matches = false` 并结束内层循环。不能只 `break` 却保留原来的真值。

### 找到以后跳过整个模式长度

默认需要保留重叠匹配，外层起点只能增加 `1`。跳过 `m` 个字符会漏解。

### 补占位字符后重算错误长度

真实长度必须在补占位字符以前保存。补完以后 `string.size()` 比真实长度多 `1`。

### 输出 0-based 起点

本文算法和题目输出都使用 1-based 位置。若改用 `string::find`，需要在接口边界把返回的 0-based 起点加 `1`。

## 基础练习

1. 手动检查模式 `aba` 在文本 `ababa` 的每个合法起点，写出比较到第几个字符停止。
2. 输入 `aaaaa` 与 `aaa`，验证输出位置为 `1,2,3`。
3. 让模式串比文本更长，确认程序输出零次且不访问越界位置。
4. 修改函数，只返回第一次出现位置；不存在时返回 `0`，并说明哨兵为什么不会与合法位置冲突。
5. 统计朴素算法一共执行了多少次字符比较，构造接近最坏情况的输入。
6. 使用 `string::find` 输出全部重叠出现，并集中完成 0-based 到 1-based 的转换。
7. 随机生成小写文本和模式，与直接切片比较的参考程序对拍。

## 需要记住什么

1. 文本串、模式串和出现位置分别是什么？
2. 模式从 `start` 开始时，第 `j` 个字符对应哪个文本位置？
3. 为什么最后合法起点是 `n - m + 1`？
4. 子序列与连续模式匹配有什么区别？
5. 为什么失配后可以立即停止检查当前起点？
6. 怎样保证重叠匹配不会被遗漏？
7. 为什么补占位字符以前必须保存真实长度？
8. 朴素匹配的最坏时间复杂度为什么是 $O(nm)$？
9. 怎样构造使大多数起点都比较到模式末尾才失败的数据？

KMP、Z 函数和字符串哈希都试图复用已经比较出的信息，避免每个起点从模式开头重新检查。朴素算法仍然是理解这些优化和随机验证它们的基准。

## 下一篇

下一阶段从 [容器适配器：priority_queue](../cpp/priority-queue.md) 开始，学习按照优先级而不是进入顺序取出元素的标准库接口。
