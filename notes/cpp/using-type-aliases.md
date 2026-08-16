# `using` 类型别名

> 最近修订：2026-08-16 13:24 +10:00（未审阅）

[`typedef` 类型别名](type-aliases.md) 已经能给一个已有类型增加新名字：

```cpp
typedef long long ll;
```

C++11 又提供了 `using` 别名声明。它解决的是同一个问题，但把正在定义的别名放在
等号左侧，复杂类型通常更容易阅读。

## 声明 `using` 类型别名

基本形式是：

```text
using 别名 = 原类型;
```

例如：

```cpp
using ll = long long;
```

它与下面的声明表示同一个类型别名：

```cpp
typedef long long ll;
```

两种写法都不会创造新类型，也不会改变对象的存储方式。本仓库为了保持长期代码
风格，竞赛模板继续使用 `typedef long long ll;`；阅读其他代码时则需要认识两种
写法。

## 复杂类型更容易阅读

比较同一种 `vector` 类型的两种声明：

```cpp
typedef vector<pair<int, int>> WeightedEdges;
using WeightedEdges = vector<pair<int, int>>;
```

第二行始终保持“别名等于原类型”的顺序。函数指针也可以按相同顺序阅读：

```cpp
typedef bool (*Compare)(int, int);
using Compare = bool (*)(int, int);
```

两行都把 `Compare` 声明为同一种函数指针类型；`using` 只是让名称与类型的边界
更直接。

## 不要混淆三种 `using`

下面三行都使用 `using`，作用却不同：

```cpp
using ll = long long;
using std::cin;
using namespace std;
```

- 第一行是别名声明，为 `long long` 增加类型名 `ll`；
- 第二行是 using 声明，使后续代码可以用未限定名称 `cin` 指代 `std::cin`；
- 第三行是 using 指令，使 `std` 中的名称参与后续的未限定名称查找。

[命名空间与 `std`](namespace-and-std.md) 负责后两种写法。本篇只讨论等号两侧分别
是别名和原类型的别名声明。

`using namespace std;` 不是类型别名，也不是把 `std` 中的每个名称复制到当前
作用域。它改变的是未限定名称查找的候选范围，所以直接写 `vector`、`sort` 或
`cout` 时可以找到 `std` 中的对应声明；出现同名候选时仍可能产生歧义。

## 别名的作用域

`using` 类型别名与 `typedef` 一样遵守普通 C++ 作用域。函数中的局部别名只能从
声明位置使用到所在代码块结束：

```cpp
void solve() {
    using ll = long long;
    ll answer = 0;
}
```

离开 `solve` 后，这个 `ll` 不再可见。这里的 `using ll = long long;` 是声明，
不是预处理替换。

## 别名模板

`using` 可以让别名本身带有模板参数：

```cpp
template <class T> using Matrix = vector<vector<T>>;
```

于是同一个别名可以生成不同元素类型的矩阵：

```cpp
Matrix<int> distance;
Matrix<double> probability;
```

传统 `typedef` 不能直接声明这种别名模板。竞赛主线很少需要自己编写别名模板，
这里只需要理解为什么现代泛型代码通常更偏好 `using`。

## 完整代码

下面的程序用 `using` 声明边类型和边表类型，再输出全部边：

```cpp
#include <bits/stdc++.h>
using namespace std;

using Edge = pair<int, int>;
using Edges = vector<Edge>;

int main() {
    int m;
    cin >> m;

    Edges edges(m);
    for (Edge& edge : edges) {
        cin >> edge.first >> edge.second;
    }

    for (const Edge& edge : edges) {
        cout << edge.first << ' ' << edge.second << '\n';
    }
    return 0;
}
```

输入：

```text
3
1 2
2 4
4 5
```

输出：

```text
1 2
2 4
4 5
```

这里的 `Edge` 仍然是 `pair<int, int>`，`Edges` 仍然是
`vector<pair<int, int>>`；别名只缩短了声明。

## 常见错误

### 把等号两侧写反

`using` 先写别名，等号右侧才是原类型：

```cpp
using ll = long long;
```

### 把类型别名写成 using 声明

`using std::cin;` 引入的是已有名称，不是“把 `std::cin` 改名为 `cin`”。类型别名
必须带有等号。

### 以为 `using` 会创造新类型

它与 `typedef` 一样，只为原类型增加名称。需要真正不同的类型时，仍应声明结构体
或类。

## 需要记住什么

1. `using ll = long long;` 中等号两侧分别是什么？
2. 它与 `typedef long long ll;` 在这个例子中有什么语义差别？
3. `using Name = Type;` 与 `using namespace name;` 分别解决什么问题？
4. 函数内部声明的 `using` 类型别名可以在函数外直接使用吗？
5. 为什么复杂类型使用 `using` 往往更容易阅读？
6. 哪一种写法可以直接声明别名模板？
