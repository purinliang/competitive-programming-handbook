# 输出格式控制

> 最近修订：2026-08-16 09:56 +10:00（未审阅）

[`scanf` 与 `printf`](scanf-and-printf.md) 和
[`cin` 与 `cout`](cin-and-cout.md) 已经能够输出不同类型的值。题目有时还会规定
值应该显示成什么形状，例如“小数点后保留两位”“使用科学计数法”或“不足两位
时在左侧补零”。这些要求改变的是输出文本，不是变量中的数值。

## 固定小数位数

假设 `average` 的值是 `2.5`，题目要求小数点后恰好保留两位。

`printf` 在 `%f` 中加入 `.2`：

```cpp
printf("%.2f\n", average);
```

输出：

```text
2.50
```

`.2` 表示小数点后输出两位。位数不足时补 `0`，位数过多时对显示结果
进行舍入。

`cout` 使用 `fixed` 与 `setprecision(2)`：

```cpp
cout << fixed << setprecision(2) << average << '\n';
```

`fixed` 选择定点表示；处于这种表示方式时，`setprecision(2)` 才表示小数点
后两位。

格式化不会把变量本身改成舍入后的数：

```cpp
double value = 1.0 / 3.0;

cout << fixed << setprecision(2) << value << '\n';
cout << fixed << setprecision(6) << value << '\n';
```

输出：

```text
0.33
0.333333
```

第二行仍能使用更高精度，说明第一行只改变了显示方式。

> 二进制浮点数只能近似表示许多十进制小数，显示舍入会受到原值近似的
> 影响。题目若允许误差，应按照题面选择足够精度，不要把两位小数当成所有
> 浮点题的固定写法。

## 有效数字与科学计数法

不使用 `fixed` 时，`cout` 的 `setprecision` 控制**有效数字总数**，不是小数位：

```cpp
double value = 123.456;
cout << setprecision(4) << value << '\n';
```

输出通常是：

```text
123.5
```

整数部分的三位也计入四位有效数字。

需要科学计数法时，`printf` 使用 `%e`，`cout` 使用 `scientific`：

```cpp
printf("%.3e\n", value);
cout << scientific << setprecision(3) << value << '\n';
```

两种写法都会把数写成一位整数部分、三位小数和指数的形式。指数中的字母大小写
可以分别用 `%e` / `%E` 或 `scientific` 配合 `uppercase` 控制；竞赛题通常只在
明确要求时使用。

`cout` 的 `fixed`、`scientific` 和 `setprecision` 会影响后续浮点输出。想恢复
默认浮点形式，可以写：

```cpp
cout << defaultfloat;
```

## 最小宽度与补零

若时间中的小时必须显示成两位，可以把 `8` 输出为 `08`。

`printf` 写作：

```cpp
printf("%02d\n", hour);
```

`2` 表示最小宽度为两位，`0` 表示空余位置用零填充。`hour == 8` 时输出
`08`；`hour == 123` 时仍输出 `123`。最小宽度只补足较短内容，不会截断
较长内容。

`cout` 的对应写法是：

```cpp
cout << setfill('0') << setw(2) << hour << '\n';
```

这两个控制项的持续范围不同：

- `setw(2)` 只影响紧跟在它后面的一个输出值；
- `setfill('0')` 会持续生效，直到再次修改填充字符。

例如：

```cpp
cout << setfill('0');
cout << setw(2) << 8 << ' ';
cout << 9 << '\n';
```

输出是 `08 9`，不是 `08 09`，因为第二个整数前没有再次使用 `setw(2)`。

## 左右对齐

默认情况下，数值在给定宽度内右对齐：

```cpp
cout << setfill(' ') << right << setw(5) << 42 << '\n';
```

输出文本相当于三个空格后接 `42`。改用 `left` 可以左对齐：

```cpp
cout << left << setw(5) << 42 << '|' << '\n';
```

输出中的 `42` 后面补三个空格，再出现竖线。对齐主要用于题目明确要求的表格
或固定格式，不是普通 OJ 答案的默认需要。

`printf` 的宽度默认右对齐，在宽度前加入负号可以左对齐：

```cpp
printf("|%5d|\n", 42);
printf("|%-5d|\n", 42);
```

## 完整代码

输入一个浮点数和一个小时。程序分别输出保留两位小数的浮点数，以及补足两位
的小时。完整程序只使用 `cin` 与 `cout`：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    double value;
    int hour;
    cin >> value >> hour;

    cout << fixed << setprecision(2) << value << '\n';
    cout << setfill('0') << setw(2) << hour << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3.14159 8
```

输出：

```text
3.14
08
```

## 常见错误

### 把 setprecision 一律理解成小数位数

只有配合 `fixed` 或 `scientific` 时，`setprecision(n)` 才控制小数点后的位数。
默认浮点形式中，它控制有效数字总数。

### 以为格式化修改了变量

输出时的舍入和补零只生成文本。后续计算仍使用变量原来保存的浮点近似值或整数。

### 忘记控制项会不会持续

`setw` 只影响下一个值，`setfill`、`fixed` 和 `setprecision` 会继续影响后续
相关输出。连续输出多种格式时，应在需要的位置明确重新设置。

### 把最小宽度当成截断

宽度不足时会补字符，值本身已经超过最小宽度时会完整输出，不会只保留末尾
几位。

## 需要记住什么

1. 怎样用 `printf` 和 `cout` 输出小数点后固定的位数？
2. 没有 `fixed` 时，`setprecision` 控制小数位还是有效数字？
3. 科学计数法分别使用什么接口？
4. 输出时的舍入会不会修改变量本身？
5. `%02d` 中的 `2` 和 `0` 分别表示什么？
6. `setw` 与 `setfill` 的生效范围有什么区别？
7. 最小宽度会不会截断更长的值？
