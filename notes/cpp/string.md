# string

> 最近修订：2026-08-16 10:49 +10:00（未审阅）

[C 字符串](c-strings.md) 使用字符数组保存文本，需要自己预留容量并维护末尾
的空字符。文本长度改变时，还要保证写入没有越过数组边界。

标准库的 `string` 把一段文本保存为一个可以整体赋值、比较和自动调整长度的对象。竞赛中的普通字符串题通常优先使用 `string`；只有题目要求固定的全局字符缓冲区或对接 C 接口时，才需要直接处理 C 字符串。

## 声明与初始化

声明一个 `string` 时不需要先决定最大长度：

```cpp
string s;
```

此时 `s` 是空字符串，包含 $0$ 个字符。可以使用字符串字面量初始化：

```cpp
string s = "cat";
```

也可以在之后整体赋值：

```cpp
s = "dog";
```

`string` 会自己保存当前长度并管理所需空间，不需要在正文字符后手动追加 `\0`，也不需要为它声明 `MAXL`。

## 长度与空字符串

`size()` 返回当前字符数量：

```cpp
int n = s.size();
```

`length()` 与 `size()` 完全等价：

```cpp
int n = s.length();
```

本书统一使用更适合一般容器的 `size()`。与 C 字符串的 `strlen(s)` 不同，`string` 已经保存自己的长度，因此查询 `size()` 是 $O(1)$，不需要重新扫描正文。

判断字符串是否为空时使用 `empty()`：

```cpp
if (s.empty()) {
    printf("empty\n");
}
```

`clear()` 删除全部字符，使字符串重新变空：

```cpp
s.clear();
```

## 读入与输出

输入流可以直接读写 `string`。`cin >> s` 跳过开头空白，再读取一个连续的非空白字符串：

```cpp
string word;
cin >> word;
cout << word << '\n';
```

它适合竞赛题中不包含空格的单词、数字文本和普通字符串。

文本本身可能包含空格时，使用 `getline(cin, s)` 读取一整行：

```cpp
string line;
getline(cin, line);
cout << line << '\n';
```

`getline` 在换行处停止并丢弃换行，保存的 `string` 不包含行末的 `\n`。

若前面刚用 `cin >> value` 读过一个值，输入中的换行仍然存在。读取下一整行前先丢弃当前行余下内容：

```cpp
int n;
cin >> n;
cin.ignore(numeric_limits<streamsize>::max(), '\n');

string line;
getline(cin, line);
```

这里只需要记住：全部输入按空白分隔时使用 `>>`；需要保留空格时使用
`getline`。前一次格式化读入留下换行等边界见 [整行输入](whole-line-input.md)。
同一个程序不要混用 `cin` / `cout` 与 `scanf` / `printf`。

## 下标与遍历

`string` 是标准库原生接口，使用 0-based 下标。字符串 `cat` 的三个字符位于 `s[0]`、`s[1]`、`s[2]`：

```cpp
string s = "cat";
s[0] = 'C';
cout << s << '\n'; // Cat
```

下标得到的是可以修改的 `char`。遍历前保存长度，再使用普通循环：

```cpp
int n = s.size();
for (int i = 0; i < n; i++) {
    cout << s[i] << '\n';
}
```

`operator[]` 不做一般的越界检查，`0..n-1` 才是正文字符的有效下标。C++17 允许读取 `s[n]` 得到特殊的空字符结尾，但它不属于正文，不能当作普通元素修改或纳入遍历；大于 `n` 的下标越界。

非空字符串还可以通过 `front()` 和 `back()` 访问首尾字符：

```cpp
char first = s.front();
char last = s.back();
```

它们分别等价于 `s[0]` 和 `s[n - 1]`。空字符串没有首尾字符，因此调用前必须已经知道字符串非空，或先用 `empty()` 判断。

## 拼接与末尾修改

运算符 `+` 产生一个拼接后的新字符串：

```cpp
string first = "hello";
string second = "world";
string result = first + " " + second;
```

这里 `first` 和 `second` 都不改变，`result` 是 `hello world`。

若要直接修改原字符串，使用 `+=`：

```cpp
string text = "hello";
text += " world";
text += '!';
```

追加单个字符也可以写成 `push_back`：

```cpp
text.push_back('?');
```

删除最后一个字符使用 `pop_back()`：

```cpp
if (!text.empty()) {
    text.pop_back();
}
```

`pop_back()` 不会返回被删除的字符，而且不能对空字符串调用。需要保留末尾字符时，应当先读取 `back()`，再删除。

## 整体赋值与比较

`string` 可以像普通对象一样整体复制：

```cpp
string a = "cat";
string b = a;
b[0] = 'C';
```

修改 `b` 不会修改 `a`。

运算符 `==` 和 `!=` 比较文本内容，不需要像 C 字符串一样调用 `strcmp`：

```cpp
if (a == b) {
    cout << "same\n";
}
```

`<`、`>`、`<=`、`>=` 按字典序比较：从开头寻找第一个不同字符；如果一方是另一方的完整前缀，较短者更小。

字符之间的先后由字符编号决定，并不等于自然语言词典的完整排序规则。普通竞赛题通常只包含同一种大小写的英文字母，按题目定义直接使用这些比较运算即可。

## 子串

`substr(start, count)` 从 0-based 下标 `start` 开始，复制至多 `count` 个字符并返回一个新的 `string`：

```cpp
string s = "abcdefgh";
string part = s.substr(2, 3); // cde
```

`start` 是起点，`count` 是字符数量，不是结束下标。若从某个位置一直取到末尾，可以省略第二个参数：

```cpp
string suffix = s.substr(5); // fgh
```

`start` 可以恰好等于 `s.size()`，此时得到空字符串；不能大于 `s.size()`。`count` 超过剩余长度时只取到末尾，不会越界。

构造长度为 $k$ 的子串需要复制这些字符，时间和新字符串占用的空间都是 $O(k)$。只为了逐字符检查原字符串时，直接使用原下标，不要反复制造子串。

## 查找

`find(pattern)` 返回模式串第一次出现的 0-based 起点：

```cpp
string s = "competitive programming";
auto position = s.find("program");
```

找不到时返回特殊值 `string::npos`，因此判断应写成：

```cpp
if (position != string::npos) {
    cout << position << '\n';
}
```

不要用 `position >= 0` 判断，因为这个返回类型本来就是标准库用于表示长度和位置的无符号类型。当前用 `auto` 保留它的正确类型即可。

`find` 适合直接完成普通的一次查找。题目要求处理很长文本、很多次匹配或证明特定复杂度时，会在字符串算法中另外学习 KMP 等方法；本篇不讨论 `find` 的内部实现。

## 中文与其他多字节文本

`string` 本质上保存一串 `char`。竞赛环境通常使用 UTF-8 表示中文，一个汉字往往由多个字节组成，因此：

- `size()` 得到的是字节数量，不一定是人眼看到的字符数量；
- `s[i]` 取得一个字节，不一定能单独表示完整汉字；
- 倒序每个 `char` 可能破坏原来的 UTF-8 文本。

普通算法竞赛字符串题通常明确限制为英文字母、数字或其他单字节字符，此时一个 `char` 就对应题目中的一个字符。真正的 Unicode 文本处理不属于本篇范围。

## 完整代码

下面的程序读入一个非空文本行，输出字符数量、首尾字符，再在末尾追加一个感叹号。因为输入允许包含空格，所以直接使用 `getline`。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    string text;
    getline(cin, text);

    int n = text.size();
    cout << n << '\n';
    cout << text.front() << ' ' << text.back() << '\n';

    text += '!';
    cout << text << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
Competitive Programming
```

输出：

```text
23
C g
Competitive Programming!
```

读取、输出和拼接整个长度为 $n$ 的文本都需要处理其中的字符，时间复杂度是 $O(n)$；`string` 保存正文需要 $O(n)$ 空间。

## 常见错误

### 对空字符串访问首尾

空字符串没有 `front()`、`back()` 或可以删除的末尾字符。调用前先根据题意保证
非空，或使用 `empty()` 判断。

### 把 substr 的第二个参数当成结束下标

`substr(start, count)` 的第二个参数是字符数量。想取闭区间 $[l,r]$ 时，长度
应为 `r - l + 1`，并且 STL 下标仍然从 `0` 开始。

### 用 position >= 0 判断 find

位置类型是无符号类型，找不到时返回 `string::npos`。直接与 `string::npos`
比较，不要套用负数哨兵的判断方式。

### 把字节数量当成所有文字的字符数量

竞赛中的英文、数字等单字节字符可以直接按 `char` 处理。UTF-8 中文通常由多个
字节组成，不能用同一套逐字节下标假装完成 Unicode 字符处理。

## 需要记住什么

1. `string` 相对字符数组自动管理了哪些信息和空间？
2. `size()`、`empty()` 和 `clear()` 分别完成什么操作？
3. `cin >> s` 与 `getline(cin, s)` 读取文本的边界有什么不同？
4. `string` 使用什么下标约定？访问 `front()` 和 `back()` 前需要保证什么？
5. `+`、`+=`、`push_back()`、`pop_back()` 对原字符串分别有什么影响？
6. `string` 如何比较内容和字典序？它与 C 字符串有什么区别？
7. `substr(start, count)` 的两个参数分别表示什么？
8. `find` 找不到模式串时返回什么？应当怎样判断？
9. 为什么包含中文的 UTF-8 `string` 中，`size()` 和 `s[i]` 不一定对应人眼看到的字符？

`string` 的容量增长策略、短字符串优化、迭代器失效规则、分配器以及 Unicode 编码与分词不属于本篇的竞赛基础用法，不要求理解或记忆。
