# 继承

> 最近修订：2026-08-16 13:59 +10:00（未审阅）

两个类型可能共享一组稳定接口，其中一个类型还要增加自己的状态与操作。例如
“参赛者”具有“人”的姓名，同时额外拥有比赛分数。**继承**允许派生类包含一个
基类部分，并在此基础上扩展类型。

继承适合表达“派生类型可以当作基类型使用”的关系。只是想把一个对象作为成员
保存时，组合通常比继承更直接。竞赛算法很少需要复杂类层次，本篇目标是准确读懂
语法、访问关系与对象转换。

## 基类与派生类

先声明基类：

```cpp
class Person {
public:
    string name;
};
```

在派生类名称后写冒号和基类：

```cpp
class Contestant : public Person {
public:
    int score;
};
```

`Person` 是基类，`Contestant` 是派生类。一个 `Contestant` 对象包含自己的
`score`，也包含一个 `Person` 基类子对象，所以公开的 `name` 同样可以访问：

```cpp
Contestant contestant;
contestant.name = "Purin";
contestant.score = 95;
```

`public` 在这里描述继承方式，不是成员访问标签。它决定基类接口以什么权限进入
派生类接口。

## 继承访问方式

基类的 `public` 与 `protected` 成员经过不同继承方式后，权限会这样变化：

| 继承方式 | 基类 public 成员 | 基类 protected 成员 |
| --- | --- | --- |
| `public` | 在派生类中保持 `public` | 保持 `protected` |
| `protected` | 在派生类中变为 `protected` | 保持 `protected` |
| `private` | 在派生类中变为 `private` | 在派生类中变为 `private` |

基类的 `private` 成员无论采用哪种继承方式，都不能由派生类成员直接访问。它们仍
存在于基类子对象中，应通过基类提供的 `public` 或 `protected` 接口操作。

公开继承最适合表达“`Contestant` 是一种 `Person`”。保护继承和私有继承更多把
基类当成实现工具，普通竞赛代码很少需要。

## 默认继承方式

与默认成员权限相似，声明派生类时：

- `struct Derived : Base` 默认是 `public` 继承；
- `class Derived : Base` 默认是 `private` 继承。

本书显式写出继承方式，不依赖这项默认值：

```cpp
class Contestant : public Person {
};
```

## 构造基类部分

派生对象建立时，先构造基类子对象，再构造派生类自己的成员，最后执行派生类构造
函数体。需要向基类构造函数传参时，在派生类的成员初始化列表中指定：

```cpp
class Person {
private:
    string name;

public:
    explicit Person(string name)
        : name(name) {
    }
};

class Contestant : public Person {
private:
    int score;

public:
    Contestant(string name, int score)
        : Person(name), score(score) {
    }
};
```

若初始化列表不写基类，编译器会尝试调用基类的默认构造函数。基类没有可用默认
构造函数时，这样写会编译失败。

销毁顺序相反：先执行派生类的析构过程，再销毁基类子对象。这保证扩展部分清理时
基类部分仍然存在。

## 基类接口与 private 成员

派生类不能直接访问基类私有字段，但可以调用基类公开或保护的成员函数：

```cpp
class Person {
private:
    string name;

public:
    explicit Person(string name)
        : name(name) {
    }

    const string& get_name() const {
        return name;
    }
};
```

派生类使用 `get_name()`，而不是把 `name` 改成公开只为绕过访问控制。若确实要
允许派生类而不允许普通外部代码直接访问，可以使用 `protected`，但这也会扩大
派生类对基类内部表示的依赖。

## 派生对象转换为基类

公开继承下，派生对象可以绑定到基类引用，或把地址转换为基类指针：

```cpp
Contestant contestant{"Purin", 95};

Person& person = contestant;
Person* pointer = &contestant;
```

这种从派生类到基类的转换常称为**向上转换**。引用和指针仍然指向原派生对象中的
基类部分，没有复制对象。

此时通过 `Person&` 或 `Person*` 只能直接使用基类接口。若基类函数是虚函数，
调用可以根据实际派生对象选择实现；那是下一篇“多态”的主题。

## 对象切片

把派生对象按值复制到独立基类对象时，只复制基类部分：

```cpp
Person person = contestant;
```

新对象的静态类型和实际类型都是 `Person`，`Contestant` 的 `score` 部分没有进入
这个副本。这称为**对象切片**。

需要保留派生对象完整身份并使用运行时多态时，应传递基类指针或引用，而不是按值
接收基类对象：

```cpp
void print_name(const Person& person) {
    cout << person.get_name() << '\n';
}
```

## 多继承

一个派生类可以列出多个基类：

```cpp
class Contestant : public Person, public Scorable {
};
```

这称为多继承。派生对象含有各个基类子对象。如果不同基类提供同名成员，直接使用
可能产生歧义，需要写 `Person::name` 一类限定或重新设计接口。

当多个继承路径通向同一个更上层基类时，还会出现菱形继承和重复基类子对象问题；
C++ 提供虚继承处理共享基类，但复杂度远超竞赛主线。本篇只要求认出多继承语法，
不要求用它设计程序。

## 完整代码

`Contestant` 公开继承 `Person`，通过基类接口保存并读取姓名：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Person {
private:
    string name;

public:
    explicit Person(string name)
        : name(name) {
    }

    const string& get_name() const {
        return name;
    }
};

class Contestant : public Person {
private:
    int score;

public:
    Contestant(string name, int score)
        : Person(name), score(score) {
    }

    int get_score() const {
        return score;
    }
};

void print_name(const Person& person) {
    cout << person.get_name() << '\n';
}

void solve() {
    string name;
    int score;
    cin >> name >> score;

    Contestant contestant{name, score};
    print_name(contestant);
    cout << contestant.get_score() << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
Purin 95
```

输出：

```text
Purin
95
```

`print_name` 接收 `const Person&`，但公开继承允许 `Contestant` 对象直接绑定到
这个基类引用，而且没有发生对象切片。

## 常见错误

### 把 public 标签与 public 继承混为一谈

类体中的 `public:` 控制成员访问；基类名前的 `public` 控制继承后的接口权限。

### 认为 private 继承能访问基类 private 成员

继承方式不会打开基类私有实现。派生类仍需使用基类提供的接口。

### 忘记初始化基类

基类没有默认构造函数时，派生类构造函数必须在初始化列表中调用合适的基类构造
函数。

### 按值传递基类对象展示多态

按值复制会切掉派生部分。运行时多态需要保留原对象，并通过基类指针或引用访问。

### 用继承表达单纯拥有关系

“题目拥有一个名称”通常应把名称作为成员；只有确实满足可替换的“是一种”关系
时，公开继承才自然。

## 需要记住什么

1. 基类、派生类和基类子对象分别是什么？
2. `public`、`protected`、`private` 继承怎样改变基类公开与保护成员的权限？
3. 派生类能否直接访问基类私有成员？
4. `struct` 与 `class` 的默认继承方式分别是什么？
5. 派生对象的构造和销毁顺序怎样？
6. 向上转换到基类引用或指针是否复制对象？
7. 什么是对象切片，为什么它不能展示运行时多态？
8. 多继承可能带来哪些名称和基类子对象问题？
