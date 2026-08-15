# 多态

> 最近修订：2026-08-16 14:10 +10:00（未审阅）

[继承](inheritance.md) 让派生对象可以通过公开继承当作基类使用。但如果所有调用
都只执行基类版本，统一接口仍然无法表现不同派生类型的行为。**运行时多态**让
基类指针或引用调用虚函数时，根据实际对象类型选择派生类实现。

C++ 中“多态”有时也泛指函数重载和模板等多种形式。本篇专门讨论面向对象语境的
运行时多态：继承、虚函数、覆盖以及基类指针或引用共同形成的行为。

## 静态类型与实际类型

先建立一个基类和派生类：

```cpp
class Animal {
public:
    string sound() const {
        return "unknown";
    }
};

class Dog : public Animal {
public:
    string sound() const {
        return "woof";
    }
};
```

基类指针可以指向公开派生对象：

```cpp
Dog dog;
Animal* animal = &dog;
```

表达式 `animal` 的静态类型是 `Animal*`，它实际指向的完整对象类型是 `Dog`。
没有虚函数时，`animal->sound()` 根据静态类型调用 `Animal::sound`。

这两个同名函数并未自动形成运行时多态。派生类声明隐藏了基类同名函数，但基类
接口仍按基类版本执行。

## virtual

在基类成员函数前写 `virtual`，表示通过基类接口调用时需要保留运行时选择：

```cpp
class Animal {
public:
    virtual string sound() const {
        return "unknown";
    }
};
```

派生类使用相同签名重新实现：

```cpp
class Dog : public Animal {
public:
    string sound() const override {
        return "woof";
    }
};
```

现在：

```cpp
Animal* animal = &dog;
cout << animal->sound() << '\n';
```

输出 `woof`。编译器从 `Animal*` 知道允许调用 `sound`，运行时再根据实际 `Dog`
对象选择覆盖后的实现。

## override

派生类函数末尾的 `override` 要求它确实覆盖某个基类虚函数：

```cpp
string sound() const override;
```

如果误删 `const`、写错参数类型或函数名，编译器会直接报错。没有 `override` 时，
这些细小差异可能悄悄声明出另一个函数，使基类调用继续执行旧实现。

基类中的 `virtual` 性质会沿继承链保留；派生类即使不重复写 `virtual` 也仍然是
虚函数。本书在派生类中写 `override`，直接表达覆盖意图并获得检查。

## 指针与引用

运行时多态需要保留原派生对象，通过基类指针或引用访问：

```cpp
void print_sound(const Animal& animal) {
    cout << animal.sound() << '\n';
}
```

`Dog`、`Cat` 等对象都能绑定到 `const Animal&`，而虚函数会执行各自实现。

若函数按值接收：

```cpp
void print_sound(Animal animal) {
    cout << animal.sound() << '\n';
}
```

传入派生对象会发生对象切片，只复制 `Animal` 部分。新对象已经不是完整派生对象，
因此不能用它展示运行时多态。

“把派生对象赋给基类对象”可以通过切片构造一个独立基类值；“让基类接口引用派生
对象”则使用指针或引用。两者不是同一种行为。

## 纯虚函数与抽象类

如果基类只规定接口，不存在合理的通用实现，可以把虚函数写成纯虚函数：

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
```

包含未实现纯虚函数的类是**抽象类**，不能直接建立 `Shape` 对象。派生类需要覆盖
`area`，完成接口后才能建立对象：

```cpp
class Square : public Shape {
private:
    double side;

public:
    explicit Square(double side)
        : side(side) {
    }

    double area() const override {
        return side * side;
    }
};
```

`= 0` 不表示函数返回零，而是纯虚函数声明语法。

## 虚析构函数

多态基类若允许通过基类指针删除派生对象，应拥有虚析构函数：

```cpp
class Animal {
public:
    virtual ~Animal() = default;
};
```

否则下面的删除通过非虚基类析构函数进行，行为未定义：

```cpp
Animal* animal = new Dog;
delete animal;
```

虚析构使运行时先执行 `Dog` 的析构过程，再执行 `Animal` 的析构过程。若代码从不
通过基类指针拥有和删除对象，并不因此要求每个普通类都添加虚析构函数。

竞赛代码仍优先使用局部对象和标准资源管理类型，避免直接配对 `new`、`delete`；
这里的例子用于说明语言规则。

## 虚函数表只是常见实现

主流 C++ 实现通常为含虚函数的类型建立**虚函数表**（vtable），并让对象保存某种
指向对应表的隐藏信息，常称虚表指针（vptr）。调用虚函数时，通过这份信息找到
实际类型的函数。

这个模型可以解释两种常见现象：

- 含虚函数的对象往往比只含相同数据成员的对象更大；
- 虚调用通常需要一次运行时间接跳转。

但是 C++ 标准规定的是可观察行为，不强制编译器必须使用某种虚表名称、数量或对象
布局。`sizeof` 的具体结果还受到平台、编译器、对齐和继承结构影响，不能把一张
虚表布局图当成所有实现都必须遵守的标准。

## 重载与覆盖

[函数重载与运算符重载](overloading.md) 根据参数列表在编译时从同名候选中选择。
覆盖则发生在继承体系中：派生类为基类虚函数提供相同接口的新实现。

```text
重载：同一作用域，同名但参数不同，编译时选择
覆盖：基类与派生类，虚函数接口对应，运行时可选择
```

只是让两个类各自出现同名函数，并不自动得到覆盖；基类函数需要是虚函数，派生类
签名也需要匹配。

## 完整代码

下面使用一个基类指针数组统一访问两个不同派生对象，不需要动态分配：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Animal {
public:
    virtual string sound() const {
        return "unknown";
    }

    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    string sound() const override {
        return "woof";
    }
};

class Cat : public Animal {
public:
    string sound() const override {
        return "meow";
    }
};

void solve() {
    Dog dog;
    Cat cat;
    Animal* animals[2] = {&dog, &cat};

    for (Animal* animal : animals) {
        cout << animal->sound() << '\n';
    }
}

int main() {
    solve();
    return 0;
}
```

输出：

```text
woof
meow
```

循环变量始终是 `Animal*`，但两个指针实际指向不同派生对象，所以虚调用选择不同
实现。

## 常见错误

### 只写同名函数，不写 virtual

非虚函数通过基类指针调用时仍按静态类型选择。运行时多态需要基类虚函数。

### 派生函数签名没有真正匹配

遗漏参数、引用限定或末尾 `const` 都可能让函数不再覆盖。使用 `override` 让编译器
验证意图。

### 按值传递基类

按值复制会切掉派生部分。需要保留实际类型时使用基类指针或引用。

### 通过没有虚析构的基类指针删除

若实际对象是派生类型，这种删除行为未定义。多态拥有关系需要虚析构函数。

### 把虚表布局当成语言标准

虚表和虚表指针是主流实现模型，不是标准规定的唯一内存布局。

## 需要记住什么

1. 静态类型与实际对象类型有什么区别？
2. 基类函数没有 `virtual` 时，通过基类指针调用哪个版本？
3. `virtual` 与 `override` 分别写在哪里、解决什么问题？
4. 为什么运行时多态要通过基类指针或引用保留原对象？
5. 什么是纯虚函数和抽象类？`= 0` 是否表示返回零？
6. 通过基类指针删除派生对象时为什么需要虚析构？
7. 虚函数表和虚表指针是标准强制布局吗？
8. 函数重载与虚函数覆盖分别在什么时候选择实现？
