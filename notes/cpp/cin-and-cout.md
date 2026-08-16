# `cin` 与 `cout`

> 最近修订：2026-08-16 21:45 +10:00（未审阅）

[A+B Problem](a-plus-b-problem.md) 已经使用 `cin` 读取两个整数，再用 `cout`
输出它们的和。二者是 C++ 标准库提供的输入流与输出流；它们会根据变量和值的类型
选择读写方式，不需要为每个类型单独写格式控制符。

## `cin` 读入数据

运算符 `>>` 从左向右依次读取：

```cpp
int count;
long long total;
double ratio;

cin >> count >> total >> ratio;
```

被读入变量的类型决定怎样解释输入文本。对整数、浮点数和 `string` 等格式化输入，
`>>` 会先跳过空格、换行和制表符，再读取下一个值。因此下面三种排版对
`cin >> a >> b;` 没有区别：

```text
3 5
```

```text
3
5
```

```text
    3       5
```

`cin >> ch` 默认也跳过空白并读取下一个非空白字符。若空格或换行本身就是数据，
可以使用 `cin.get(ch)`；包含空格的完整文本行使用 `getline(cin, s)`。这些边界在
[字符分类与转换](character-classification-and-conversion.md) 和
[整行输入](whole-line-input.md) 中结合文本处理说明。

## `cout` 输出数据

运算符 `<<` 把右侧值依次写到标准输出：

```cpp
int a = 3;
int b = 5;

cout << a << ' ' << b << '\n';
```

程序依次输出 `a`、一个空格、`b` 和换行，结果是：

```text
3 5
```

空格和换行不会自动产生。需要什么分隔符，就必须明确输出什么。`cout` 会按照值的
类型输出整数、浮点数、字符、字符串和布尔值：

```cpp
int count = 3;
double ratio = 0.5;
char grade = 'A';

cout << count << ' ' << ratio << ' ' << grade << '\n';
```

## 换行与刷新

普通竞赛输出统一使用 `\n`：

```cpp
cout << answer << '\n';
```

`endl` 也会换行，但还会立即刷新输出缓冲区：

```cpp
cout << answer << endl;
```

频繁刷新会降低大量输出时的速度，所以普通题目不使用 `endl` 代替每一处换行。
只有交互题要求把询问及时送给评测程序时，才需要显式刷新：

```cpp
cout << query << '\n' << flush;
```

交互题会明确给出交互规则；非交互程序正常结束时会处理剩余输出。

## 判断读入是否成功

`cin >> x` 不仅执行读入，也能在条件中表示这次读入是否成功。读取整数直到输入
结束时，可以写：

```cpp
int x;
while (cin >> x) {
    cout << x << '\n';
}
```

如果题面已经给出数据数量，应优先按次数读取；不要把“直到文件结束”当作所有输入
的固定模板。

输入失败以后，流会保留失败状态，后续普通 `>>` 不会自动恢复。OJ 通常保证按题面
提供合法数据；本篇只要求会判断文件结束，不展开交互式错误恢复。

## 流同步与绑定

选择 `cin` 与 `cout` 处理大量数据时，竞赛代码常在第一次输入输出以前写：

```cpp
ios::sync_with_stdio(false);
cin.tie(nullptr);
```

第一行关闭 C++ 流与 C 标准输入输出之间的同步；第二行解除 `cin` 在读入前自动
刷新 `cout` 的绑定。普通 OJ 不需要先显示提示文字，这样通常更快。

关闭同步以后，不要再与 `scanf`、`printf` 混用。即使没有关闭同步，一份正式程序
也最好从开始就选择一个接口家族。另一组接口见 [scanf 与 printf](scanf-and-printf.md)。
本书后续模板默认使用后者；教学中的简单程序仍可在整份代码保持一致的前提下使用
`cin` 与 `cout`。

## 完整代码

输入整数 `n`，再输入 `n` 个绝对值不超过 $10^9$ 的整数，输出它们的和：

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

void solve() {
    int n;
    cin >> n;

    ll sum = 0;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        sum += x;
    }

    cout << sum << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 常见错误

### 忘记输出分隔符

`cout << a << b;` 会把两个值的文本直接连在一起。题目要求空格或换行时必须明确
输出。

### 用 `endl` 处理每一行

普通输出只需要 `\n`。`endl` 额外刷新缓冲，循环中频繁使用可能显著变慢。

### 数值读入后直接读取整行

格式化读入通常把行末换行留在输入中，紧接着的 `getline` 可能先读到空行。正确的
接口边界处理见 [整行输入](whole-line-input.md)。

### 关闭同步后混用两套接口

调用 `ios::sync_with_stdio(false)` 后，再混用 C 与 C++ 输入输出会让缓冲顺序不再
可靠。整份程序只保留一套接口。

### 自行添加提示文字

OJ 只比较题目要求的输出。不要添加“请输入”或“答案是”等未要求文本。

## 需要记住什么

1. `cin >> a >> b` 按什么顺序读入？数值之间的普通空白是否影响结果？
2. `cout << a << b` 会不会自动在两个值之间加入空格？
3. 为什么普通竞赛输出使用 `\n`，而不是每一行都使用 `endl`？
4. 怎样用 `cin` 判断读入是否成功并读取到文件结束？
5. `ios::sync_with_stdio(false)` 和 `cin.tie(nullptr)` 分别改变什么？
6. 为什么关闭同步以后不能再混用 `scanf` / `printf`？
