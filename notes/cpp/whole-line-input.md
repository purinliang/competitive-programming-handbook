# 整行输入

> 最近修订：2026-08-16 10:07 +10:00（未审阅）

普通格式化输入把空格和换行当成数据之间的分隔符。若题目要读取一句可能包含
空格的文字，例如 `competitive programming handbook`，`cin >> s` 只能读到
第一个单词 `competitive`。这时应改为一次读取整行。

本篇放在 [C 字符串](c-strings.md) 和 [`string`](string.md) 之后，分别说明
两种字符串表示对应的整行输入方法。

## getline 读取 string

`getline(cin, s)` 从 `cin` 读取一行并保存到 `string`：

```cpp
string s;
getline(cin, s);
```

它从当前位置一直读取到换行符：

- 行内空格会作为字符串内容保留；
- 行末换行符会从输入中取走，但不会保存在 `s` 中；
- 空行会得到空字符串。

输入：

```text
competitive programming handbook
```

读取后，`s` 保存完整的 `competitive programming handbook`，而不是第一个
单词。

`getline` 的返回结果也能作为条件。题目要求逐行读取直到文件结束时，可以写：

```cpp
string s;
while (getline(cin, s)) {
    cout << s << '\n';
}
```

## 前一次读入留下的换行

`cin >> n` 读取整数时会跳过前导空白，并在数字结束处停止。数字后的换行符
通常还留在输入中：

```cpp
int n;
string s;

cin >> n;
getline(cin, s);
```

紧接着的 `getline` 会把这个残留换行当作当前行的结尾，因此 `s` 得到空字符串，
没有读到下一行正文。

若题目要求读完一个格式化数值后，从**下一行**开始读取正文，可以先丢弃当前行
剩余内容：

```cpp
cin >> n;
cin.ignore(numeric_limits<streamsize>::max(), '\n');
getline(cin, s);
```

`ignore` 最多跳过给定数量的字符，并在遇到 `\n` 时停止。这里使用最大流长度，
表示无论数字后还有多少空格或其他内容，都把当前行清理到换行处。

不要机械地在每次 `getline` 前调用 `ignore`。如果上一次操作本身就是 `getline`，
换行已经被取走，再次忽略会误删下一行内容。只有输入接口的边界确实留下了当前
行余项时才清理。

## cin.getline 读取字符数组

字符数组使用输入流的成员函数 `cin.getline`：

```cpp
const int MAXL = 1000 + 5;
char s[MAXL];

cin.getline(s, MAXL);
```

它在换行处停止，丢弃换行，并在字符数组末尾补上 `\0`。第二个参数是整个数组
的容量，因此最多只能保存 `MAXL - 1` 个普通字符，还要给末尾空字符留出位置。

`cin.getline(s, MAXL)` 与 `getline(cin, s)` 名称相近，但参数类型不同：前者
接收字符数组和容量，后者接收 `string`。

前面若刚使用 `cin >> n`，`cin.getline` 同样会遇到残留换行，也要先使用
`cin.ignore` 清理当前行。

## fgets 读取字符数组

选择 C 标准输入输出接口时，可以用 `fgets` 读取字符数组：

```cpp
const int MAXL = 1000 + 5;
char s[MAXL];

fgets(s, MAXL, stdin);
```

`fgets` 最多读取 `MAXL - 1` 个字符并补上 `\0`。它与前两种方法有一个重要
区别：如果本轮确实读到行末换行，而且数组有足够空间，这个 `\n` 会保存在
字符串中。

需要去掉行末换行时，先确认最后一个字符确实是 `\n`：

```cpp
int length = strlen(s);

if (length > 0 && s[length - 1] == '\n') {
    s[length - 1] = '\0';
}
```

最后一行可能直接在文件末尾结束，没有换行；一行也可能长到本轮没有读到换行。
因此不能无条件删除最后一个字符。

`scanf` 后接 `fgets` 时也可能留下当前行。若必须组合两种读取方式，可以先读到
当前行结束：

```cpp
int c;
while ((c = getchar()) != '\n' && c != EOF) {
}
```

不过，一份正式程序优先从一开始就选择同一套接口：`cin` 配合 `getline`，或者
`scanf` 配合 `fgets`。不要只为了读一行而随意混用两套缓冲体系。

## 完整代码

输入第一行的整数 `n`，再读取接下来的 `n` 行文字，原样输出并在每行前加上
从 `1` 开始的编号：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    for (int i = 1; i <= n; i++) {
        string s;
        getline(cin, s);
        cout << i << ": " << s << '\n';
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
2
hello world
competitive programming
```

输出：

```text
1: hello world
2: competitive programming
```

## 常见错误

### 用 cin >> s 读取带空格文本

`>>` 以空白分隔字符串，只适合读取单词。需要保留空格时使用 `getline`。

### 数值读入后立刻 getline

前一次 `>>` 留下的换行会让 `getline` 立即得到空字符串。确认题目从下一行开始
给正文后，先用 `ignore` 清理当前行。

### 每次 getline 前都 ignore

`getline` 自己已经取走行末换行。没有残留内容时再次 `ignore`，反而可能删掉
下一行。

### 无条件删除 fgets 的最后一个字符

`fgets` 不保证本轮一定保存了换行。只有检查到末尾确实是 `\n` 时才能删除。

## 需要记住什么

1. 为什么 `cin >> s` 不能读取包含空格的完整一行？
2. `getline(cin, s)` 会不会把行末换行保存在 `string` 中？
3. 为什么 `cin >> n` 后直接 `getline` 可能得到空字符串？
4. `cin.ignore` 应在什么边界使用，为什么不能机械地每次调用？
5. `cin.getline` 与 `getline` 分别接收哪种字符串表示？
6. `fgets` 会怎样处理容量、末尾空字符和行末换行？
7. 为什么删除 `fgets` 读到的末尾字符以前必须检查它是不是 `\n`？
