# 构造函数

> 最近修订：2026-08-16 13:27 +10:00（未审阅）

普通局部对象建立以后，如果其中的基本类型成员没有初值，读取它们会产生未定义
行为。更重要的是，有些类型从诞生起就必须满足规则，例如分母不能为零、区间左端
不能大于右端。让调用者先建立一个无效对象，再记得调用 `reset`，很容易遗漏。

**构造函数**在对象建立时负责初始化。它让类型能够规定“一个对象最初怎样成为
有效状态”。

## 构造函数的形式

构造函数与类同名，没有返回类型：

```cpp
class Contestant {
  private:
    int id;
    int score;

  public:
    Contestant() {
        id = 0;
        score = 0;
    }
};
```

建立对象时会自动调用它：

```cpp
Contestant contestant;
```

不能给构造函数写 `void`。`void Contestant()` 是错误声明：与类同名的这种成员
用于构造函数，而构造函数不允许写返回类型；它不能借此变成普通成员函数。

## 默认构造函数

能够不接收实参调用的构造函数称为**默认构造函数**：

```cpp
Contestant() {
    id = 0;
    score = 0;
}
```

如果类没有声明任何构造函数，编译器通常会隐式声明一个默认构造函数；它会依次
默认初始化成员，但不会自动把普通 `int` 成员清零。

一旦程序声明了接收参数的构造函数，编译器不会再因为需要 `Contestant contestant;`
而自动补上一个无参数版本：

```cpp
class Contestant {
  public:
    Contestant(int id, int score) {}
};
```

此时若仍需要无参数建立对象，就要显式提供 `Contestant()`，或根据真实设计给参数
默认值。

## 带参数的构造函数

构造函数可以接收建立对象所需的数据：

```cpp
class Contestant {
  private:
    int id;
    int score;

  public:
    Contestant(int id, int score) {
        this->id = id;
        this->score = score;
    }
};
```

对象可以直接带初值建立：

```cpp
Contestant contestant{7, 95};
```

同一个类可以拥有参数列表不同的多个构造函数。编译器根据提供的实参选择匹配
版本；这属于函数重载，后续文章会统一解释。

## 成员初始化列表

更直接的写法是在构造函数体以前初始化成员：

```cpp
Contestant(int id, int score) : id(id), score(score) {}
```

冒号后的部分称为**成员初始化列表**。左边的 `id`、`score` 是数据成员，括号中
的 `id`、`score` 是构造函数形参。

这不是“先默认建立成员，再在函数体内赋值”，而是在成员自身开始存在时就使用
指定初值。`const` 数据成员和引用数据成员不能先空着再赋值，必须在初始化列表中
初始化：

```cpp
class Entry {
  private:
    const int id;
    int& value;

  public:
    Entry(int id, int& value) : id(id), value(value) {}
};
```

成员还可能是没有默认构造函数的类对象，这时同样需要在初始化列表中提供它所需
的构造参数。

## 初始化顺序

成员实际按照它们在类中**声明的顺序**初始化，不按照初始化列表书写顺序：

```cpp
class Example {
  private:
    int first;
    int second;

  public:
    Example(int value) : second(value), first(second) {}
};
```

这里仍然先初始化 `first`。它尝试读取尚未初始化的 `second`，代码是错误的。
初始化列表最好也按成员声明顺序书写，避免视觉顺序制造错误理解。

## 默认成员初始值

也可以在数据成员声明处给出默认初值：

```cpp
class Contestant {
  private:
    int id = 0;
    int score = 0;
};
```

某个构造函数没有在自己的初始化列表中指定该成员时，就会使用这个默认成员初始
值。若构造函数显式指定了成员初值，则该构造函数的初始化优先。

这适合所有构造方式都共享的自然默认值，但不能替代需要参数验证的构造逻辑。

## explicit

只有一个参数的构造函数可能被编译器用于隐式转换：

```cpp
class Score {
  public:
    Score(int value) {}
};

Score score = 95;
```

若不希望普通整数在未写明意图时自动变成 `Score`，在构造函数前写 `explicit`：

```cpp
explicit Score(int value) {}
```

此后仍可明确写 `Score score{95};`。竞赛结构中的单参数构造函数若只是容量、模数
等初始化入口，显式构造通常更容易阅读。

## 完整代码

下面的 `Score` 只能通过构造函数建立，并把输入限制在 `0..100`：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Score {
  private:
    int value;

  public:
    explicit Score(int value) : value(value) {
        if (this->value < 0) {
            this->value = 0;
        }
        if (this->value > 100) {
            this->value = 100;
        }
    }

    int get() const {
        return value;
    }
};

void solve() {
    int value;
    cin >> value;

    Score score{value};
    cout << score.get() << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
125
```

输出：

```text
100
```

对象一旦完成构造，内部 `value` 就已经位于允许范围内。

## 常见错误

### 给构造函数写返回类型

构造函数与类同名且没有返回类型，连 `void` 也不写。

### 声明带参数构造函数后仍期待自动无参构造

类自己声明构造函数后，需要的无参数版本也要明确提供。

### 用函数体赋值代替所有初始化

`const`、引用和某些类类型成员必须直接初始化。通常优先使用成员初始化列表。

### 依赖初始化列表的书写顺序

真实顺序由成员声明顺序决定。列表也按声明顺序写，依赖更早的成员时尤其重要。

### 把空括号写成对象声明

```cpp
Contestant contestant();
```

这会被解析成函数声明，而不是建立默认对象。写成 `Contestant contestant;` 或
`Contestant contestant{};`。

## 需要记住什么

1. 构造函数什么时候执行，主要解决什么问题？
2. 构造函数有没有返回类型？
3. 声明带参数构造函数后，编译器是否仍会自动补无参数版本？
4. 成员初始化列表与在函数体中赋值有什么区别？
5. `const` 与引用数据成员为什么需要初始化列表？
6. 成员按照声明顺序还是初始化列表顺序初始化？
7. `explicit` 可以阻止哪一种自动行为？
8. 为什么 `Contestant contestant();` 不是默认对象声明？
