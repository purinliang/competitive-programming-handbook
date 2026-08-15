# 函数重载与运算符重载

> 最近修订：2026-08-16 13:48 +10:00（未审阅）

有些操作概念相同，却需要接收不同类型或不同数量的参数。例如打印整数和打印
字符串都可以叫 `print`；两个自定义点相加也希望沿用 `+`，而不是另造一个难读
的函数名。C++ 的**重载**允许同一个名字在不同参数或操作数类型下表示不同函数。

重载是在编译时根据表达式的静态类型选择函数。它不同于后续“多态”中通过基类
指针或引用在运行时选择虚函数实现。

## 函数重载

同一作用域中可以声明同名、但参数列表不同的函数：

```cpp
void print(int value) {
    cout << value << '\n';
}

void print(const string& value) {
    cout << value << '\n';
}
```

调用时，编译器根据实参选择能够匹配的版本：

```cpp
print(42);
print(string("hello"));
```

参数个数、参数类型或类型排列不同，都可以形成重载：

```cpp
int maximum(int a, int b);
int maximum(int a, int b, int c);
double maximum(double a, double b);
```

形参名字不参与区分。下面两行是同一个函数签名的重复声明，不是两个重载：

```cpp
int add(int a, int b);
int add(int x, int y);
```

## 返回类型不能单独区分重载

调用发生时，返回值可能被忽略，也可能出现在不能唯一推断目标类型的位置。因此
只有返回类型不同不够：

```cpp
int parse(string text);
double parse(string text);
```

这两个函数的参数列表相同，声明冲突。若操作语义确实不同，应使用不同函数名，
或让调用者通过参数明确选择。

## 重载决议与歧义

编译器收集同名候选函数，判断哪些能接收当前实参，再选择转换最合适的版本：

```cpp
void show(int value);
void show(double value);

show(3);    // 选择 int
show(3.5);  // 选择 double
```

若多个候选同样合适，调用会产生歧义，而不是凭声明顺序选择：

```cpp
void visit(long value);
void visit(double value);

visit(1); // int 转为 long 或 double 都没有唯一最佳选择
```

默认参数也可能让两个重载同时匹配。设计重载时应让常见调用拥有清楚的唯一版本，
不要依靠读者猜测复杂的隐式转换排名。

## 运算符函数

自定义类型可以把某些已有运算符定义成函数。下面为二维点定义加法：

```cpp
struct Point {
    int x;
    int y;
};

Point operator+(const Point& a, const Point& b) {
    return {a.x + b.x, a.y + b.y};
}
```

表达式：

```cpp
Point c = a + b;
```

会调用与参数匹配的 `operator+`。它仍然是函数，只是调用语法由运算符表达式提供。

至少一个操作数必须是类类型或枚举类型。程序不能把两个内置 `int` 的 `+` 改成
减法，也不能创建 C++ 不存在的新运算符。

## 成员与非成员形式

二元运算符可以写成非成员函数，如前面的 `operator+`；也可以写成成员函数：

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

只有当一种顺序确实是类型稳定、自然的默认顺序时，才适合定义 `operator<`。
同一类型在不同题目中需要多套临时顺序时，向 `sort` 传入独立比较器更清楚。

## 不能改变的语法规则

运算符重载只能改变自定义类型参与运算时调用哪个函数，不能改变运算符本身的：

- 优先级；
- 结合方向；
- 操作数数量；
- 内置求值语法。

例如重载后的 `a + b * c` 仍然先按照 `*` 优先于 `+` 解析。为了避免误读，自定义
运算符应尽量保持原运算符的直观含义；不要让 `+` 删除对象或让 `<` 修改操作数。

并非所有运算符都允许重载。成员访问 `.`、作用域解析 `::`、条件运算符 `?:` 和
`sizeof` 等不能被用户重载。竞赛中通常只需要读懂少量比较、算术、下标、调用和
输入输出运算符，不需要背完整列表。

## 重载、覆盖与隐藏

三个相似词不要混用：

- **重载**：同一作用域的同名函数具有不同参数列表，编译时选择；
- **覆盖**：派生类重新实现基类的虚函数，签名关系由虚函数规则约束；
- **隐藏**：内层作用域或派生类的同名声明让外层名字不参与普通查找。

本篇只要求掌握重载。覆盖与运行时选择在“多态”中学习，隐藏在遇到真实名称查找
问题时再具体分析。

## 完整代码

程序展示函数重载和二维点的加法重载：

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

void print(int value) {
    cout << value << '\n';
}

void print(const Point& point) {
    cout << point.x << ' ' << point.y << '\n';
}

void solve() {
    Point a;
    Point b;
    cin >> a.x >> a.y >> b.x >> b.y;

    Point sum = a + b;
    print(sum);
    print(sum.x + sum.y);
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
11
```

`print(sum)` 根据 `Point` 实参选择第二个重载，`print(sum.x + sum.y)` 根据
`int` 实参选择第一个重载。

## 常见错误

### 只修改形参名字

形参名称不是函数签名的区分条件。必须改变参数数量、类型或排列。

### 只修改返回类型

返回类型不能单独区分重载。相同参数列表的函数声明会冲突。

### 写出同样合适的候选

隐式转换让多个重载都匹配且没有唯一最佳函数时，调用会产生歧义。

### 让比较器在相等时返回 true

排序要求严格顺序；相等元素不应互相“小于”。不要用 `<=` 代替 `<` 语义。

### 认为重载会改变优先级

表达式先按 C++ 固定语法分组，再选择相应运算符函数。需要不同分组时仍要写括号。

## 需要记住什么

1. 函数重载允许哪些部分不同？哪些部分不能单独区分？
2. 重载函数在编译时还是运行时选择？
3. 多个候选同样合适时，编译器会按声明顺序选一个吗？
4. 运算符重载为什么仍然属于函数重载？
5. 二元运算符的成员形式中，左右操作数分别在哪里？
6. `operator<` 为什么不能在相等时返回 `true`？
7. 运算符重载能否改变优先级、结合方向和操作数数量？
8. 重载与覆盖有什么根本区别？
