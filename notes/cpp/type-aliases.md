# typedef 与 using 类型别名

> 最近修订：2026-08-16 12:48 +10:00（未审阅）

同一个类型可能在代码中反复出现，也可能拥有很长的拼写。竞赛代码最常见的例子
是 `long long`：

```cpp
long long answer;
long long distance;
```

**类型别名**为已有类型增加一个更短或更能表达用途的名字。它不会创造新类型，
也不会改变对象的存储方式。C++ 提供 `typedef` 和 `using` 两种写法。

## typedef

`typedef` 的基本形式是：

```text
typedef 原类型 别名;
```

本仓库把 `long long` 简写为 `ll`：

```cpp
typedef long long ll;
```

之后可以在需要类型的位置使用 `ll`：

```cpp
ll answer = 0;
ll distance = 10000000000LL;
```

这里的两个对象仍然是 `long long`。`ll` 只是另一个类型名称，不会自动改变
字面量的类型，也不会扩大原来使用 `int` 的表达式。

## using 类型别名

`using` 可以用更接近赋值的顺序声明同一种别名：

```text
using 别名 = 原类型;
```

例如：

```cpp
using ll = long long;
```

这与 `typedef long long ll;` 表示相同的别名。注意它不同于
`using namespace std;`：前者声明类型别名，后者让未限定名称查找考虑一个
命名空间。

## 复杂类型的可读性

原类型较长时，`using` 的左右顺序通常更容易阅读：

```cpp
typedef vector<pair<int, int>> WeightedEdges;
using WeightedEdges = vector<pair<int, int>>;
```

两行效果相同，但第二行先给出正在定义的名字，再给出它代表的类型。

函数指针更能体现这种差别：

```cpp
typedef bool (*Compare)(int, int);
using Compare = bool (*)(int, int);
```

二者都表示“指向接收两个 `int`、返回 `bool` 的函数的指针”。`using` 形式仍然
保持 `别名 = 类型` 的固定结构。

## 别名不是新类型

下面两个名字最终都表示 `long long`：

```cpp
typedef long long Score;
typedef long long Distance;
```

因此 `Score` 与 `Distance` 可以直接互相赋值，编译器也不能用它们区分两个函数
重载：

```cpp
Score score = 100;
Distance distance = score;
```

如果问题真的需要两个不能混用的类型，就要设计不同的结构体或类；改一个名字
并不会增加这种约束。

## 别名不会改变表达式

别名只影响声明中的类型拼写。下面的乘法仍然先以 `int` 计算：

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

这一点与直接把变量声明成 `long long` 时完全相同。

## 模板别名

`using` 还可以声明带模板参数的别名：

```cpp
template <class T>
using Matrix = vector<vector<T>>;

Matrix<int> distance;
```

传统 `typedef` 不能直接表达这种别名模板。竞赛主线很少需要自己声明模板别名，
这里只用于解释现代 C++ 更常偏好 `using` 的一个原因，不要求记忆。

## 为什么不用 define

下面的写法只是预处理文本替换：

```cpp
#define ll long long
```

它没有声明类型别名，可能在意外位置替换同名记号，也不受 C++ 类型与作用域规则
完整约束。[#define 宏](define-macros.md) 已经解释这种风险。

本仓库的竞赛代码使用：

```cpp
typedef long long ll;
```

这是长期保持一致的代码风格。阅读其他代码时也要能认出
`using ll = long long;`；二者在这里没有语义差异。

## 完整代码

程序读入两个可能超出 32 位整数范围的数，使用本仓库的 `ll` 别名求和：

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

### 以为别名创造了新类型

别名只是同一类型的另一个名字，不能阻止不同语义的整数互相赋值。

### 以为结果变量的别名会提前转换表达式

表达式按照操作数类型计算。需要 64 位乘法时，先把操作数提升到
`long long`，例如写 `1LL * a * b`。

### 混淆两种 using

`using Name = Type;` 声明类型别名；`using namespace name;` 是命名空间指令。
两者共享关键字，但解决的问题不同。

### 用宏替代类型别名

类型别名由 C++ 语言理解，宏只是预处理替换。本仓库不写
`#define ll long long`。

## 需要记住什么

1. `typedef long long ll;` 中哪个是原类型，哪个是别名？
2. `using ll = long long;` 与上述 `typedef` 有什么语义差别？
3. 类型别名会不会创造一个与原类型不能互相赋值的新类型？
4. `ll product = a * b;` 为什么仍可能先发生 `int` 溢出？
5. `using Name = Type;` 与 `using namespace name;` 分别做什么？
6. 本仓库使用哪一种 `ll` 声明？为什么不使用 `#define`？
