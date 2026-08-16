# 运算符重载

> 最近修订：2026-08-16 17:18 +10:00（未审阅）

两个自定义点相加时，`add(a, b)` 能完成工作，但 `a + b` 更直接地表达“相加”。
C++ 允许为已有运算符定义适用于自定义类型的函数，这就是**运算符重载**。

运算符重载建立在 [函数重载](function-overloading.md) 之上：`operator+` 仍然是
函数，编译器仍根据操作数类型在编译时选择版本。

## 运算符函数

下面为二维点定义加法：

```cpp
struct Point {
    int x;
    int y;
};

Point operator+(const Point& a, const Point& b) {
    return {a.x + b.x, a.y + b.y};
}
```

表达式 `Point c = a + b;` 会调用与参数匹配的 `operator+`。

至少一个操作数必须是类类型或枚举类型。程序不能把两个内置 `int` 的 `+` 改成
减法，也不能创建 C++ 不存在的新运算符。

## 成员与非成员形式

二元运算符可以写成前面的非成员函数，也可以写成成员函数：

```cpp
struct Point {
    int x;
    int y;

    Point operator+(const Point& other) const {
        return {x + other.x, y + other.y};
    }
};
```

成员形式中，左操作数是当前对象，右操作数是显式参数 `other`。两种形式不要为同一
组参数同时定义，否则调用可能产生歧义。

当左右操作数地位对称，或需要让左侧也发生允许的类型转换时，非成员形式通常更
自然。若成员是私有的，可以把非成员运算符声明为 `friend`，但公开访问函数足够
时不必为了重载自动使用友元。

## 比较运算符

排序和有序容器常需要一种严格顺序。可以为类型定义 `operator<`：

```cpp
struct Contestant {
    int score;
    int id;
};

bool operator<(const Contestant& a, const Contestant& b) {
    if (a.score != b.score) {
        return a.score > b.score;
    }
    return a.id < b.id;
}
```

这里规定分数高的排在前面；分数相同则编号小的在前。相等对象比较时必须返回
`false`，不能把 `<=` 或 `>=` 直接当作严格比较。

只有当一种顺序确实是类型稳定、自然的默认顺序时，才适合定义 `operator<`。同一
类型在不同题目中需要多套临时顺序时，向 `sort` 传入独立比较器更清楚。

## 不能改变的语法规则

运算符重载只能改变自定义类型参与运算时调用哪个函数，不能改变运算符本身的：

- 优先级；
- 结合方向；
- 操作数数量；
- 内置求值语法。

例如重载后的 `a + b * c` 仍然先按照 `*` 优先于 `+` 解析。为了避免误读，自定义
运算符应尽量保持原运算符的直观含义。

并非所有运算符都允许重载。成员访问 `.`、作用域解析 `::`、条件运算符 `?:` 和
`sizeof` 等不能被用户重载。竞赛中通常只需要读懂少量比较、算术、下标、调用和
输入输出运算符，不需要背完整列表。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Point {
    int x;
    int y;
};

Point operator+(const Point& a, const Point& b) {
    return {a.x + b.x, a.y + b.y};
}

void solve() {
    Point a;
    Point b;
    cin >> a.x >> a.y >> b.x >> b.y;

    Point sum = a + b;
    cout << sum.x << ' ' << sum.y << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
1 2 3 5
```

输出：

```text
4 7
```

## 常见错误

### 同时定义等价的成员与非成员版本

两个版本都能精确匹配时，表达式可能产生歧义。应为同一组操作数选择一种形式。

### 让比较器在相等时返回 true

排序要求严格顺序；相等元素不应互相“小于”。不要用 `<=` 代替 `<` 语义。

### 认为重载会改变优先级

表达式先按 C++ 固定语法分组，再选择相应运算符函数。需要不同分组时仍要写括号。

## 需要记住什么

1. 为什么说运算符重载仍然是函数重载？
2. 二元运算符的成员形式中，左右操作数分别在哪里？
3. `operator<` 为什么不能在相等时返回 `true`？
4. 运算符重载能否改变优先级、结合方向和操作数数量？
5. 哪些类型的操作数才允许使用用户定义的运算符重载？
