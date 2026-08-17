# KMP 与前缀函数

> 最近修订：2026-08-17 04:06 +10:00（未审阅）

[朴素字符串匹配](naive-pattern-matching.md) 在每个起点重新比较模式串。若文本和
模式都含大量重复字符，已经比较成功的信息会被反复丢弃。

例如模式 `ababac` 已经匹配到 `ababa`，下一位却失配。已经匹配的部分同时
以 `aba` 结尾，而 `aba` 也是模式的前缀；下一次匹配可以直接保留这三位，
不必退回文本中的匹配起点。

KMP 的核心不是“让文本回退得更聪明”，而是**文本位置永远不回退，只根据模式
自身的前后缀关系缩短当前匹配长度**。这个关系由前缀函数预处理。

## 前缀函数的定义

对模式串 `pattern[1..m]`，`pi[i]` 表示：

> 子串 `pattern[1..i]` 的最长相等真前缀与真后缀长度。

“真”表示不能取整个 `pattern[1..i]`。例如：

```text
pattern = ababaca
```

对前缀 `ababa`：

- 前缀 `aba` 等于后缀 `aba`；
- 它的长度是 `3`；
- 因此该位置的前缀函数值是 `3`。

`pi[i] = j` 等价于：

```text
pattern[1..j] = pattern[i-j+1..i]
```

`pi[1] = 0`，因为长度为 `1` 的字符串没有非空真前缀。

## 从前一个位置继续

计算 `pi[i]` 时，先令：

```cpp
int j = pi[i - 1];
```

这表示 `pattern[1..i-1]` 的末尾已经与模式前 `j` 个字符相同。若：

```cpp
pattern[j + 1] == pattern[i]
```

那么这段相等关系可以同时向右扩展一位：

```cpp
j++;
pi[i] = j;
```

真正的问题是下一位不同的时候该怎么办。

## 失配后缩短候选

若 `pattern[j + 1] != pattern[i]`，长度为 `j` 的候选不能扩展。新的候选
还必须：

1. 是原候选 `pattern[1..j]` 的真后缀；
2. 同时是整个模式串的前缀。

满足这两个条件的最长长度恰好是 `pi[j]`，因此：

```cpp
while (j > 0 && pattern[j + 1] != pattern[i]) {
    j = pi[j];
}
```

若仍然失配，就继续取 `pi[j]`。候选长度严格减小，最终会找到能够扩展的最长
候选，或者退到 `0`。

完整转移是：

```cpp
for (int i = 2; i <= m; i++) {
    int j = pi[i - 1];

    while (j > 0 && pattern[j + 1] != pattern[i]) {
        j = pi[j];
    }

    if (pattern[j + 1] == pattern[i]) {
        j++;
    }
    pi[i] = j;
}
```

## 为什么不会退成平方复杂度

`while` 看起来可能在每个位置执行很多次，但 `j` 的增加只能来自成功字符比较，
每次最多增加 `1`；失配循环每执行一次，`j` 都会严格减小。

整个预处理过程中，`j` 总增加次数和总减小次数都不超过线性数量，因此前缀函数
的总时间复杂度是 $O(m)$，不是 $O(m^2)$。这是均摊分析的一个简单例子。

## 用前缀函数匹配文本

扫描文本时，`j` 表示：

> 当前文本位置以前，已经匹配了模式串前 `j` 个字符。

对当前 `text[i]`，转移与计算前缀函数完全相同：

```cpp
while (j > 0 && pattern[j + 1] != text[i]) {
    j = pi[j];
}

if (pattern[j + 1] == text[i]) {
    j++;
}
```

当 `j == m` 时，模式的最后一个字符对齐到 `text[i]`，所以匹配起点是：

$$
i-m+1.
$$

记录答案后不能把 `j` 清零。一次匹配的后缀可能同时是下一次匹配的前缀，
重叠匹配需要保留它：

```cpp
if (j == m) {
    occurrences.push_back(i - m + 1);
    j = pi[j];
}
```

例如文本 `aaaaa`、模式 `aaa` 的匹配起点是 `1,2,3`。若找到一次后直接
令 `j = 0`，后两个重叠匹配会被遗漏。

## 正确性

处理每个文本字符前，`j` 始终是“已经扫描的文本后缀”与“模式前缀”相等的
最大长度。

- 下一位相同时，最长匹配自然增加 `1`；
- 下一位不同时，任何仍可能成立的候选必须同时是当前匹配的后缀和模式前缀；
- `pi[j]` 按定义给出其中最长的更短候选；
- 反复跳转直到能够扩展或退到 `0`，不会漏掉更长可行候选。

因此 `j == m` 当且仅当模式串在当前位置结束。文本下标 `i` 始终只向右移动，
每个合法出现都会被记录一次。

## 完整代码

下面输出模式串在文本串中的所有 1-based 起点，包括重叠出现。输入字符串只含
小写英文字母。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
string text, pattern;
vector<int> pi;

void build_prefix_function() {
    pi.assign(m + 5, 0);

    for (int i = 2; i <= m; i++) {
        int j = pi[i - 1];

        while (j > 0 && pattern[j + 1] != pattern[i]) {
            j = pi[j];
        }

        if (pattern[j + 1] == pattern[i]) {
            j++;
        }
        pi[i] = j;
    }
}

vector<int> find_occurrences() {
    vector<int> occurrences;
    int j = 0;

    for (int i = 1; i <= n; i++) {
        while (j > 0 && pattern[j + 1] != text[i]) {
            j = pi[j];
        }

        if (pattern[j + 1] == text[i]) {
            j++;
        }

        if (j == m) {
            occurrences.push_back(i - m + 1);
            j = pi[j];
        }
    }
    return occurrences;
}

void solve() {
    cin >> text >> pattern;

    n = text.size();
    m = pattern.size();
    text = " " + text;
    pattern = " " + pattern;

    build_prefix_function();
    vector<int> occurrences = find_occurrences();

    cout << occurrences.size() << '\n';
    for (int position : occurrences) {
        cout << position << ' ';
    }
    cout << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 复杂度

- 构造模式串前缀函数：$O(m)$；
- 扫描文本：$O(n)$；
- 总时间复杂度：$O(n+m)$；
- 前缀函数空间复杂度：$O(m)$。

## 常见错误

- 把 `pi[i]` 理解成任意重复子串长度，而不是最长相等真前后缀长度；
- 失配时写成 `j--`，丢失前缀函数提供的跳转；
- 使用 `j = pi[j - 1]`，混淆 0-based 与本文的 1-based 定义；
- 匹配完成后直接清零，遗漏重叠匹配；
- 忘记匹配起点是 `i - m + 1`；
- 给字符串补位后重新使用 `size()` 作为真实长度。

## 需要记住什么

- `pi[i]` 准确表示什么？
- 为什么失配后跳到 `pi[j]`，而不是把文本位置退回？
- 为什么 KMP 的嵌套 `while` 总计仍是线性时间？
- 找到一次匹配后为什么要令 `j = pi[j]`？

