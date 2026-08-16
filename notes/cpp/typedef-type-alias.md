# `typedef` 类型别名

> 最近修订：2026-08-16 13:24 +10:00（未审阅）

同一个类型可能在代码中反复出现，也可能拥有很长的拼写。竞赛代码最常见的例子
是 `long long`：

```cpp
long long answer;
long long distance;
```

如果这些量都需要使用 64 位整数，可以给 `long long` 增加一个更短的名字 `ll`。
这个新名字称为**类型别名**。

## 使用 `typedef` 声明别名

`typedef` 的基本形式是：

```text
typedef 原类型 别名;
```

本仓库统一写作：

```cpp
typedef long long ll;
```

其中 `long long` 是已有类型，最后的 `ll` 是刚刚声明的别名。以后凡是能够写
`long long` 的位置，通常都可以改写成 `ll`：

```cpp
ll answer = 0;
ll distance = 10000000000LL;
```

## 别名不是变量

`typedef long long ll;` 没有创建一个名为 `ll` 的整数，也没有分配用来保存整数的
空间。它只告诉编译器：`ll` 是类型名，可以用来声明后面的对象。

下面才真正声明了一个变量：

```cpp
ll answer = 0;
```

因此 `typedef` 声明本身不需要初始化，也不能从输入中读入一个“别名的值”。

## 别名不会创造新类型

下面两个名字最终都表示 `long long`：

```cpp
typedef long long Score;
typedef long long Distance;
```

`Score` 与 `Distance` 可以直接互相赋值：

```cpp
Score score = 100;
Distance distance = score;
```

编译器也不能依靠这两个别名区分函数重载。如果确实需要两个不能混用的类型，
应当声明不同的结构体或类；给同一个类型换两个名字不会增加这种约束。

## 复杂类型的别名

`typedef` 不只适用于整数。下面为一种较长的标准库类型建立别名：

```cpp
typedef vector<pair<int, int>> WeightedEdges;
```

随后可以直接声明：

```cpp
WeightedEdges edges;
```

函数指针的写法更特别：

```cpp
typedef bool (*Compare)(int, int);
```

这里的 `Compare` 表示“指向一个接收两个 `int`、返回 `bool` 的函数的指针”。
复杂声明不要求在主线背诵；需要时可以改用
[`using` 类型别名](using-type-aliases.md)，让别名与原类型的边界更直观。

## 别名的作用域

`typedef` 声明的名称遵守普通 C++ 作用域。放在函数内部时，别名从声明位置开始，
到所在代码块结束；放在命名空间作用域时，它可以被该命名空间中的后续代码使用。

```cpp
void solve() {
    typedef long long ll;
    ll answer = 0;
}
```

离开 `solve` 后，其他函数不能直接使用这个局部别名。`typedef` 应当称为声明；它
不是预处理指令，也不会像宏那样越过花括号继续替换后面的同名记号。

## 别名不会改变表达式

类型别名只改变声明时的拼写。下面的乘法仍然先以 `int` 计算：

```cpp
typedef long long ll;

int a = 1000000000;
int b = 1000000000;
ll product = a * b;
```

赋给 `ll` 发生在乘法以后，不能挽救已经溢出的 `int` 计算。需要先让至少一个
操作数成为 `long long`：

```cpp
ll product = 1LL * a * b;
```

这一点与把结果变量直接声明成 `long long` 时完全相同。

## 为什么不用宏

下面的写法只是预处理文本替换：

```cpp
#define ll long long
```

它没有声明类型别名，可能在意外位置替换同名记号，也不完整遵守 C++ 的类型与
作用域规则。[预处理：`#define`](define.md) 会继续解释这些风险。

本仓库使用 `typedef long long ll;`：它是 C++ 语言理解的类型声明，不是预处理器
进行的字符串替换。

## 完整代码

下面的程序使用 `ll` 读入两个 64 位整数并输出它们的和：

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

void solve() {
    ll a;
    ll b;
    cin >> a >> b;
    cout << a + b << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3000000000 5000000000
```

输出：

```text
8000000000
```

把代码中的 `ll` 全部替换为 `long long`，程序含义不会改变。

## 常见错误

### 把原类型和别名写反

`typedef` 先写原类型，最后写别名。正确写法是：

```cpp
typedef long long ll;
```

### 以为别名创造了新类型

别名只是同一类型的另一个名字，不能阻止不同语义的整数互相赋值。

### 以为结果变量会提前改变计算类型

表达式按照操作数类型计算。需要 64 位乘法时，应当让操作数先成为
`long long`，例如写 `1LL * a * b`。

## 需要记住什么

1. `typedef long long ll;` 中哪个是原类型，哪个是别名？
2. 类型别名会不会创建对象或分配存储空间？
3. 函数内部声明的 `typedef` 别名可以在函数外直接使用吗？
4. 两个不同别名能否把同一个原类型变成两个互不兼容的新类型？
5. `ll product = a * b;` 为什么仍可能先发生 32 位整数溢出？
6. 为什么类型别名比 `#define ll long long` 更合适？

## 继续阅读

[`using` 类型别名](using-type-aliases.md) 使用另一种语法完成相同任务，并能声明
别名模板。
