# 进制转换

> 最近修订：2026-08-17 10:11 +10:00（未审阅）

[进制表示](base-notation.md) 已经说明，一个 $b$ 进制数的每一位都有对应位权。
纸笔计算时，我们可以展开所有位权；程序则需要把同一规律改写成一次从左到右的
扫描。反方向转换时，程序还要把十进制整数逐步拆成目标进制的各位。

本篇只处理 $2$ 到 $36$ 进制的非负整数。输入保证数字合法，转换结果能够放进
`long long`；负数、小数和任意精度整数不混入第一份实现。

## 数字字符与数值

进制文本保存在 `string` 中，每一位首先是一个字符。计算位权以前，必须把字符
转换成它代表的数值：

```text
'0' ... '9'  ->  0 ... 9
'a' ... 'z'  -> 10 ... 35
'A' ... 'Z'  -> 10 ... 35
```

数字字符使用已经学过的 `ch - '0'`。英文字母同样连续排列，因此可以从 `'a'`
或 `'A'` 计算偏移：

```cpp
int digit_to_value(char ch) {
    if ('0' <= ch && ch <= '9') {
        return ch - '0';
    }
    if ('a' <= ch && ch <= 'z') {
        return ch - 'a' + 10;
    }
    if ('A' <= ch && ch <= 'Z') {
        return ch - 'A' + 10;
    }
    return -1;
}
```

返回 `-1` 表示它不是当前规则中的数字字符。基础程序的输入保证合法，因此后面不再
重复处理失败；一般程序则应同时检查返回值不小于 `0`，并且严格小于当前进制。

反方向转换时，数值 `0` 到 `9` 变成数字字符，`10` 到 `35` 变成小写字母：

```cpp
char value_to_digit(int value) {
    if (value < 10) {
        return '0' + value;
    }
    return 'a' + value - 10;
}
```

本书统一输出小写字母，但读取时同时接受大小写。

## 任意进制转十进制

先考虑 $b$ 进制的三位数 $xyz$。按位权展开：

$$
x\times b^2+y\times b+z.
$$

把它改写成嵌套形式：

$$
(x\times b+y)\times b+z.
$$

这说明我们不必先计算每个幂。扫描到一个新数字 `digit` 时，只需把已经读过的前缀
整体左移一位，再加入新数字：

```cpp
value = value * base + digit;
```

例如把二进制 `101101` 转成十进制时，`value` 依次变成：

```text
0 -> 1 -> 2 -> 5 -> 11 -> 22 -> 45
```

每一步都只依赖此前前缀的值和当前数字：

```cpp
ll to_decimal(string text, int base) {
    ll value = 0;
    int n = (int)text.size();
    for (int i = 0; i < n; i++) {
        char ch = text[i];
        int digit = digit_to_value(ch);
        value = value * base + digit;
    }
    return value;
}
```

这里直接遍历标准库 `string` 中的字符，不自行定义下标；因此保留 `string` 的原生
遍历方式。

## 十进制转任意进制

反方向转换要不断询问：这个数除以 `base` 后，当前最低位是多少？整数除法的余数
正好给出最低位。

以十进制 $13$ 转二进制为例：

| 当前值 | 除以 2 的商 | 余数 |
| ---: | ---: | ---: |
| 13 | 6 | 1 |
| 6 | 3 | 0 |
| 3 | 1 | 1 |
| 1 | 0 | 1 |

余数产生的顺序是从最低位到最高位，也就是正常答案 `1101` 的反方向。程序先把
余数依次保存下来，再反转得到正常书写顺序。

本书自定义序列默认从 `1` 开始，因此临时字符串在位置 `0` 放一个不参与答案的
占位字符：

```cpp
string from_decimal(ll value, int base) {
    if (value == 0) {
        return "0";
    }

    string answer = " ";
    while (value > 0) {
        int digit = value % base;
        answer += value_to_digit(digit);
        value /= base;
    }

    int n = answer.size() - 1;
    for (int i = 1; i <= n / 2; ++i) {
        char temp = answer[i];
        answer[i] = answer[n - i + 1];
        answer[n - i + 1] = temp;
    }
    return answer.substr(1);
}
```

第一次余数就是最低位，所以反转不是可有可无的排版步骤。若忘记反转，十进制
$13$ 会错误输出 `1011`，而不是 `1101`。对于恰好回文的结果，这个错误可能暂时
看不见，测试时还应选择位序不对称的数。

## 零的特殊情况

当 `value` 一开始就是 `0` 时，`while (value > 0)` 一次也不会执行。若直接返回临时
结果，就会把零表示成空字符串。

因此函数在进入循环以前单独返回 `"0"`。这不是进制转换的特殊数学规则，而是循环
只在“还有非零部分需要拆分”时执行所产生的程序边界。

## 完整代码

输入一个原进制 `from_base`、一个非负整数文本 `text` 和目标进制 `to_base`。程序先
把原文本转换成十进制整数，再转换成目标进制。输入保证两个进制都在 $2$ 到 $36$
之间，`text` 合法，而且中间结果能放进 64 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int digit_to_value(char ch) {
    if ('0' <= ch && ch <= '9') {
        return ch - '0';
    }
    if ('a' <= ch && ch <= 'z') {
        return ch - 'a' + 10;
    }
    if ('A' <= ch && ch <= 'Z') {
        return ch - 'A' + 10;
    }
    return -1;
}

char value_to_digit(int value) {
    if (value < 10) {
        return '0' + value;
    }
    return 'a' + value - 10;
}

ll to_decimal(string text, int base) {
    ll value = 0;
    int n = (int)text.size();
    for (int i = 0; i < n; i++) {
        char ch = text[i];
        int digit = digit_to_value(ch);
        value = value * base + digit;
    }
    return value;
}

string from_decimal(ll value, int base) {
    if (value == 0) {
        return "0";
    }

    string answer = " ";
    while (value > 0) {
        int digit = value % base;
        answer += value_to_digit(digit);
        value /= base;
    }

    int n = answer.size() - 1;
    for (int i = 1; i <= n / 2; ++i) {
        char temp = answer[i];
        answer[i] = answer[n - i + 1];
        answer[n - i + 1] = temp;
    }
    return answer.substr(1);
}

void solve() {
    int from_base;
    string text;
    int to_base;
    cin >> from_base >> text >> to_base;

    ll value = to_decimal(text, from_base);
    cout << from_decimal(value, to_base) << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
16 2d 2
```

输出：

```text
101101
```

## 复杂度与范围

设原表示有 $n$ 位，目标表示有 $m$ 位。转成十进制扫描 $n$ 个字符，转出目标进制
执行 $m$ 次除法并反转 $m$ 个字符，因此总时间复杂度是 $O(n+m)$。当前函数按值
接收字符串，会复制 $n$ 个字符；连同转换结果共使用 $O(n+m)$ 额外空间。学习
[引用](references.md) 以后，可以用只读引用避免这次复制。

复杂度很低不代表数值一定安全。`value * base + digit` 可能超过 `long long`；基础
版本依赖题目保证中间结果不溢出。位数更长时需要高精度整数，不能仅把返回类型继续
换成另一个固定宽度类型。

## 常见错误

### 没有检查数字是否属于当前进制

字符 `'9'` 可以出现在十进制中，却不能出现在八进制中。一般程序应检查：

```cpp
int digit = digit_to_value(ch);
bool valid = 0 <= digit && digit < base;
```

本篇完整代码依赖输入保证合法，不应在没有保证的题目中照搬这一假设。

### 忘记反转余数

除基取余最先得到最低位。直接按产生顺序输出，会把整个答案倒过来。

### 遗漏零

`while (value > 0)` 无法为零产生任何一位。必须在循环以前单独返回 `"0"`。

### 把源码前缀当作输入的一部分

本篇的 `text` 只包含实际数字，不包含 `0b` 或 `0x`。若题目输入前缀，程序需要先
识别并去掉它，再决定 `from_base`；这与编译器识别源码字面量不是同一步骤。

## 需要记住什么

1. 为什么扫描一个新数字时可以写 `value = value * base + digit`？
2. 为什么十进制转任意进制要不断除以目标进制并记录余数？
3. 为什么余数必须反转以后才是正常表示？
4. 为什么 `value == 0` 需要单独处理？
5. 怎样在数字字符和 $0$ 到 $35$ 的数值之间转换？
6. 一般程序还需要怎样检查一个数字对当前进制是否合法？
7. 为什么这份程序即使时间复杂度足够低，也仍可能发生整数溢出？
