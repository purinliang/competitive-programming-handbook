# 字符分类与转换

> 最近修订：2026-08-16 20:34 +10:00（未审阅）

程序读到一个字符以后，经常还要判断它属于哪一类：它是数字、英文字母、空白，
还是普通标点？如果它是字母，我们还可能需要忽略大小写进行比较。

逐个列出所有可能字符当然可以，但容易漏掉边界。C++ 的 `<cctype>` 提供了一组
专门完成字符分类和大小写转换的函数。

## 用范围判断字符

数字字符在字符编码中连续排列，因此可以直接判断一个字符是否落在 `'0'` 到
`'9'` 之间：

```cpp
char ch;
cin >> ch;

if ('0' <= ch && ch <= '9') {
    cout << "digit" << '\n';
}
```

英文字母也可以分别检查大写和小写范围：

```cpp
bool uppercase = 'A' <= ch && ch <= 'Z';
bool lowercase = 'a' <= ch && ch <= 'z';

if (uppercase || lowercase) {
    cout << "letter" << '\n';
}
```

这种写法能直接看见边界，很适合解释字符编码。但要反复判断数字、字母和空白时，
继续手写范围会让代码变长，也容易遗漏某一种字符。

## 字符分类函数

使用 `<cctype>` 中的函数时，把需要检查的字符放进圆括号：

| 函数 | 当前竞赛语境中的含义 |
| --- | --- |
| `isdigit(ch)` | 是否为 `'0'` 到 `'9'` |
| `isalpha(ch)` | 是否为英文字母 |
| `isalnum(ch)` | 是否为英文字母或数字 |
| `isspace(ch)` | 是否为空白字符 |

竞赛代码通常包含 `<bits/stdc++.h>`，不需要再单独包含 `<cctype>`。只包含实际需要
的标准头文件时，可以写：

```cpp
#include <cctype>
```

分类函数适合直接放进条件：

```cpp
if (isdigit(ch)) {
    cout << "digit" << '\n';
} else if (isalpha(ch)) {
    cout << "letter" << '\n';
} else {
    cout << "other" << '\n';
}
```

这些函数返回 `0` 表示假，返回**非零值**表示真。非零值不保证恰好等于 `1`，
所以不要写 `isdigit(ch) == 1`。直接把结果用作条件，或者保存进 `bool`，都能得到
正确的真假含义：

```cpp
bool digit = isdigit(ch);
```

## 空白字符

空白不只有普通空格。`isspace(ch)` 还会识别换行 `\n`、制表符 `\t` 等用于分隔
文本的字符：

```cpp
cout << isspace(' ') << '\n';
cout << isspace('\n') << '\n';
cout << isspace('\t') << '\n';
```

三次判断都是真，但输出的具体非零数值不重要。

`cin >> ch` 会先跳过空白，因此它无法用来观察输入中的空格或换行。需要读取下一个
字符而不跳过空白时，可以使用：

```cpp
char ch;
cin.get(ch);
```

这里先把 `cin.get(ch)` 当作“连空白也读取”的输入接口。各种输入方式的区别会在
[标准输入](standard-input.md) 中统一整理。

## 大小写转换

`tolower(ch)` 把英文字母转换成小写，`toupper(ch)` 把英文字母转换成大写：

```cpp
char lower = tolower(ch);
char upper = toupper(ch);
```

若 `ch` 不是需要转换的英文字母，函数会返回原字符。例如数字 `'7'` 转换后仍然
是 `'7'`。因此不必先调用 `isalpha`，再决定能否转换：

```cpp
char a = tolower('Q');
char b = toupper('m');
char c = tolower('7');

cout << a << ' ' << b << ' ' << c << '\n';
```

输出：

```text
q M 7
```

忽略大小写比较两个英文字母时，可以先把两边统一转换成小写：

```cpp
if (tolower(a) == tolower(b)) {
    cout << "same" << '\n';
}
```

## 数字字符与数值

`isdigit(ch)` 只回答“是不是数字字符”，不会自动得到该字符代表的整数。确认它是
数字以后，仍然使用 [字符类型](character-type.md#数字字符) 中的偏移关系：

```cpp
if (isdigit(ch)) {
    int value = ch - '0';
    cout << value << '\n';
}
```

反过来，`0` 到 `9` 的整数可以转换成对应数字字符：

```cpp
int value = 6;
char digit = '0' + value;
```

这两种写法只处理一位十进制数字。十六进制字母和任意进制中的字符、数值转换会在
后面的“进制转换”中组合成完整函数。

## 完整代码

下面的程序读取输入中的第一个字符，包括空白字符，然后输出它的类别。对于英文字母，
程序还会输出统一的小写和大写形式；对于数字字符，则输出对应整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    char ch;
    cin.get(ch);

    if (isspace(ch)) {
        cout << "whitespace" << '\n';
    } else if (isdigit(ch)) {
        cout << "digit" << '\n';
        cout << ch - '0' << '\n';
    } else if (isalpha(ch)) {
        cout << "letter" << '\n';
        cout << (char)tolower(ch) << ' ';
        cout << (char)toupper(ch) << '\n';
    } else {
        cout << "other" << '\n';
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
G
```

输出：

```text
letter
g G
```

每次分类和转换只检查一个字符，因此时间复杂度为 $O(1)$，额外空间复杂度也是
$O(1)$。

## 非 ASCII 字节

本篇处理的是竞赛中常见的 ASCII 字母、数字、空白和标点。在这种范围内，直接把
`char` 传给 `<cctype>` 函数即可。

若程序处理任意原始字节，普通 `char` 可能得到负值。此时 `<cctype>` 函数要求参数
能表示为 `unsigned char`，或者是特殊值 `EOF`；稳妥写法是先转换：

```cpp
bool letter = isalpha((unsigned char)ch);
```

这条限制用于避免一般程序中的未定义行为，但基础竞赛题的英文字符输入通常不需要
额外处理。UTF-8 中文字符通常由多个字节组成，也不能靠这些函数逐个 `char` 分类。

## 常见错误

### 把返回值与 1 比较

```cpp
if (isalpha(ch) == 1) {
    cout << "letter" << '\n';
}
```

`isalpha` 的真值只保证非零，不保证为 `1`。应直接写 `if (isalpha(ch))`。

### 用逻辑运算代替分类函数

```cpp
if (ch == 'A' || 'B') {
    cout << "A or B" << '\n';
}
```

`'B'` 自己就是一个非零整数，所以这个条件总为真。正确写法必须完整比较两次：

```cpp
if (ch == 'A' || ch == 'B') {
    cout << "A or B" << '\n';
}
```

### 忘记格式化输入会跳过空白

需要判断输入是否为空格时，`cin >> ch` 会先跳过目标字符。使用 `cin.get(ch)` 才能
把空白本身读入 `ch`。

## 需要记住什么

1. `isdigit`、`isalpha`、`isalnum` 和 `isspace` 分别判断什么？
2. 为什么不应把字符分类函数的返回值与 `1` 比较？
3. `tolower` 和 `toupper` 遇到不需要转换的字符会怎样处理？
4. `cin >> ch` 与 `cin.get(ch)` 对空白字符的处理有什么区别？
5. 判断出一个字符是数字以后，怎样得到它表示的整数？
6. 为什么 `<cctype>` 不能直接按单个 `char` 识别 UTF-8 中文字符？

不需要背诵分类函数返回的具体非零数值。当前需要记住的是函数各自判断的类别，
以及分类结果应当按真假使用。
