# 函数重载

> 最近修订：2026-08-16 17:18 +10:00（未审阅）

打印整数和打印字符串完成的是同一类操作，却要接收不同类型的参数。如果被迫把它们
命名成 `print_int` 和 `print_string`，调用者还要把参数类型写进函数名。C++ 的
**函数重载**允许同一作用域中的多个函数共享名字，再由参数列表区分版本。

重载在编译时根据表达式的静态类型选择函数。它不同于后续多态中通过基类指针或引用
在运行时选择虚函数实现。

## 参数列表区分重载

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

调用发生时，返回值可能被忽略，也可能出现在不能唯一推断目标类型的位置。因此只有
返回类型不同不够：

```cpp
int parse(string text);
double parse(string text);
```

这两个函数的参数列表相同，声明冲突。若操作语义确实不同，应使用不同函数名，或让
调用者通过参数明确选择。

## 重载决议与歧义

编译器收集同名候选函数，判断哪些能接收当前实参，再选择转换最合适的版本：

```cpp
void show(int value);
void show(double value);

show(3);   // 选择 int
show(3.5); // 选择 double
```

若多个候选同样合适，调用会产生歧义，而不是凭声明顺序选择：

```cpp
void visit(long value);
void visit(double value);

visit(1); // int 转为 long 或 double 都没有唯一最佳选择
```

默认参数也可能让两个重载同时匹配。设计重载时应让常见调用拥有清楚的唯一版本，
不要依靠读者猜测复杂的隐式转换排名。

## 重载、覆盖与隐藏

三个相似词不要混用：

- **重载**：同一作用域的同名函数具有不同参数列表，编译时选择；
- **覆盖**：派生类重新实现基类的虚函数，签名关系由虚函数规则约束；
- **隐藏**：内层作用域或派生类的同名声明让外层名字不参与普通查找。

本篇只要求掌握重载。覆盖与运行时选择在“多态”中学习，隐藏在遇到真实名称查找
问题时再具体分析。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

void print(int value) {
    cout << value << '\n';
}

void print(const string& value) {
    cout << value << '\n';
}

void solve() {
    int number;
    string text;
    cin >> number >> text;

    print(number);
    print(text);
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
42 hello
```

输出：

```text
42
hello
```

## 常见错误

### 只修改形参名字

形参名称不是函数签名的区分条件。必须改变参数数量、类型或排列。

### 只修改返回类型

返回类型不能单独区分重载。相同参数列表的函数声明会冲突。

### 写出同样合适的候选

隐式转换让多个重载都匹配且没有唯一最佳函数时，调用会产生歧义。

## 需要记住什么

1. 函数重载允许哪些部分不同？
2. 哪些部分不能单独区分两个重载？
3. 重载函数在编译时还是运行时选择？
4. 多个候选同样合适时，编译器会按声明顺序选一个吗？
5. 重载与覆盖有什么根本区别？

## 扩展阅读

[运算符重载](operator-overloading.md) 说明自定义类型怎样让 `+`、`<` 等运算符
调用相应的重载函数。
