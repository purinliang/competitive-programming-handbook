# 类的成员

> 最近修订：2026-08-16 13:07 +10:00（未审阅）

[类与对象](class.md) 说明类是类型，对象是这种类型的实例。类的花括号中
声明的名字称为**成员**：数据成员保存状态，成员函数提供与这种状态相关的操作。

日常编程中常把数据成员称为“成员变量”，把成员函数称为“方法”。本书会识别这些
俗称，但需要准确讨论 C++ 规则时使用“数据成员”和“成员函数”。

## 数据成员

数据成员描述每个对象包含的数据：

```cpp
class Counter {
  public:
    int value;
};
```

每个 `Counter` 对象都有自己的 `value`：

```cpp
Counter first;
Counter second;

first.value = 3;
second.value = 5;
```

这里的 `value` 是**非静态数据成员**。它不是整个类共享的一格数据，而是每个
对象内部各有一个对应子对象。

## 成员函数

成员函数声明在类中，并通过某个对象调用：

```cpp
class Counter {
  public:
    int value;

    void reset() {
        value = 0;
    }

    void add(int delta) {
        value += delta;
    }
};
```

调用时使用点运算符：

```cpp
Counter counter;
counter.reset();
counter.add(5);
```

`counter.add(5)` 操作的是 `counter` 自己的 `value`。成员函数内部可以直接使用
该对象的非静态成员名称，不必把对象再作为普通参数传入。

## this 指针

调用非静态成员函数时，函数知道自己正在为哪一个对象执行。在函数体中，关键字
`this` 表示指向当前对象的指针：

```cpp
void add(int value) {
    this->value += value;
}
```

形参和数据成员都叫 `value` 时，未限定的 `value` 指形参；`this->value` 明确
访问当前对象的数据成员。

没有重名时可以省略 `this->`：

```cpp
void add(int delta) {
    value += delta;
}
```

`this` 不是程序员额外声明的普通形参，也不能在静态成员函数中使用。

## const 成员函数

只读取对象状态的成员函数可以在参数列表后写 `const`：

```cpp
int get() const {
    return value;
}
```

末尾的 `const` 表示该成员函数不会通过当前对象修改它的普通数据成员。这样的
函数可以对常量对象调用：

```cpp
const Counter counter{5};
cout << counter.get() << '\n';
```

若 `get` 没有末尾的 `const`，编译器不能确认它会保持常量对象不变，调用会失败。
这个 `const` 修饰的是成员函数观察当前对象的方式，不是返回类型。

## 静态数据成员

在数据成员前写 `static`，表示整个类共享一份成员，而不是每个对象各有一份：

```cpp
class Counter {
  public:
    static int total_additions;
};

int Counter::total_additions = 0;
```

类内声明成员，类外这一行提供定义并初始化存储。作用域解析运算符 `::` 表示这个
名字属于 `Counter`。

访问共享成员时优先使用类名：

```cpp
Counter::total_additions++;
```

C++ 也允许通过对象访问公开的静态成员，但写出类名能清楚表达“它不属于某一个
对象的独立状态”。

## 静态成员函数

静态成员函数属于类本身，调用时不需要某个对象：

```cpp
class Counter {
  public:
    static int total_additions;

    static int additions() {
        return total_additions;
    }
};
```

调用形式是：

```cpp
cout << Counter::additions() << '\n';
```

因为调用时没有当前对象，静态成员函数没有 `this` 指针，也不能直接访问
`value` 这样的非静态数据成员。它可以直接访问同一个类的静态成员。

## 常量成员

日常所说的“常量成员”通常是带 `const` 的数据成员：

```cpp
const int id;
```

它仍然属于数据成员，只是建立以后不能通过普通赋值改变。不要把它误分类为一种
既不是数据、也不是成员的特殊东西。非静态 `const` 数据成员通常需要由构造函数
的成员初始化列表建立初值，后续“构造函数”会解释这一过程。

整个类共享的整数常量也常写成静态成员：

```cpp
class Counter {
  public:
    static const int MAX_VALUE = 1000000000;
};
```

这与每个对象各有一份的非静态 `const int id` 是两种不同的归属关系。

## 完整代码

下面的两个计数器各自保存数值，但所有加法操作共同累计在静态成员中：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Counter {
  public:
    int value;
    static int total_additions;

    void reset() {
        value = 0;
    }

    void add(int delta) {
        value += delta;
        total_additions++;
    }

    int get() const {
        return value;
    }

    static int additions() {
        return total_additions;
    }
};

int Counter::total_additions = 0;

void solve() {
    Counter first;
    Counter second;
    first.reset();
    second.reset();

    first.add(3);
    first.add(4);
    second.add(10);

    cout << first.get() << ' ' << second.get() << '\n';
    cout << Counter::additions() << '\n';
}

int main() {
    solve();
    return 0;
}
```

输出：

```text
7 10
3
```

`first.value` 与 `second.value` 彼此独立；三次 `add` 都修改共享的
`Counter::total_additions`。

## 常见错误

### 把普通成员理解成全类共享

非静态数据成员属于每个对象。只有显式写出 `static` 的成员才由整个类共享。

### 从静态成员函数直接访问对象成员

静态成员函数没有当前对象和 `this` 指针。需要对象状态时，应接收对象参数，或
改为非静态成员函数。

### 忘记只读成员函数末尾的 const

读取函数若需要对常量对象调用，应写成 `int get() const`。这里的 `const` 位于
参数列表以后。

### 把成员函数想成每个对象各复制一份代码

对象各自保存非静态数据状态；成员函数依据当前对象进行操作。理解行为时不需要
想象每个对象内部都存了一份函数代码。

## 需要记住什么

1. 数据成员与成员函数分别描述什么？“成员变量”和“方法”是什么说法？
2. 非静态数据成员为什么在不同对象中彼此独立？
3. 非静态成员函数中的 `this` 指向谁？
4. 参数列表后的 `const` 有什么作用？
5. 静态成员与非静态成员的归属关系有什么不同？
6. 静态成员函数为什么不能直接访问普通数据成员？
7. 带 `const` 的数据成员是否仍然是数据成员？
