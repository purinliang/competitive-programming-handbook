# 访问权限与 friend

> 最近修订：2026-08-16 13:16 +10:00（未审阅）

类可以把状态和操作放在一起，但如果外部代码仍能任意修改所有字段，就无法保证
对象始终满足自己的规则。**访问控制**决定一个成员可以从哪些位置使用，使类能够
只公开稳定接口，并把内部实现保留在类中。

C++ 有 `public`、`private` 和 `protected` 三种成员访问权限。`friend` 可以把
访问权授予指定函数或类，但它不是第四种访问权限。

## public

`public` 成员可以从类外通过对象访问：

```cpp
class Counter {
public:
    int value;
};

Counter counter;
counter.value = 5;
```

公开成员构成调用者能够直接使用的接口。成员函数、类型别名和静态成员等都可以
放在 `public:` 区域，不只有数据成员。

## private

`private` 成员只能由这个类的成员和获得友元权限的代码直接访问：

```cpp
class Counter {
private:
    int value;

public:
    void set(int new_value) {
        value = new_value;
    }

    int get() const {
        return value;
    }
};
```

类外代码必须通过公开接口操作：

```cpp
Counter counter;
counter.set(5);
cout << counter.get() << '\n';
```

直接写 `counter.value = 5` 会因为 `value` 是私有成员而编译失败。私有不表示
“只有声明这个字段的那一个对象能访问”：`Counter` 的成员函数可以访问任意
`Counter` 对象的私有成员，因为访问权限属于类，而不是属于单个对象。

## protected

`protected` 与 `private` 一样，不能从普通类外代码直接访问；它还允许派生类的
成员在继承规则允许时访问：

```cpp
class Base {
protected:
    int value;
};
```

`protected` 的主要用途出现在继承体系中。它不等于 `public`，也不表示“同一个
文件中的代码都能访问”。本篇只记住它位于公开与完全私有之间的继承访问位置，
具体规则在“继承”中结合派生类说明。

## 默认权限

若没有显式标签，`class` 的成员默认是 `private`，`struct` 的成员默认是
`public`：

```cpp
class Hidden {
    int value;
};

struct Visible {
    int value;
};
```

显式写出访问标签以后，两种类类型都遵守相同规则。标签可以在类中出现多次，
每个标签影响其后成员，直到遇到下一个访问标签或类定义结束。

## 封装不等于加 private

把字段改成 `private` 只是限制直接访问。真正有意义的封装还要提供能维护对象规则
的操作。例如分数要求位于 $0$ 到 $100$，公开接口可以拒绝非法值：

```cpp
class Score {
private:
    int value;

public:
    bool set(int new_value) {
        if (new_value < 0 || new_value > 100) {
            return false;
        }
        value = new_value;
        return true;
    }

    int get() const {
        return value;
    }
};
```

如果 `set` 不做任何检查，只机械转发每次读写，私有字段本身并不会自动提高程序
正确性。是否隐藏状态应服务于清楚的不变量，而不是为了让代码看起来像面向对象。

## friend 函数

有时一个类外函数确实需要直接读取非公开成员。类可以显式授予它友元权限：

```cpp
class Score {
private:
    int value;

public:
    void set(int new_value) {
        value = new_value;
    }

    friend bool same_score(const Score& a, const Score& b);
};

bool same_score(const Score& a, const Score& b) {
    return a.value == b.value;
}
```

`same_score` 仍是普通的类外函数，不会因为 `friend` 变成成员函数；类只是允许它
访问自己的 `private` 和 `protected` 成员。

友元声明放在类定义的哪个访问区域都不改变授予权限的含义。它不是 `public`、
`private` 或 `protected` 的一种标签。

## friend 类

也可以把访问权授予另一个完整的类：

```cpp
class Inspector;

class Score {
private:
    int value;

    friend class Inspector;
};
```

这会让 `Inspector` 的成员访问 `Score` 的非公开部分。权限只按声明精确授予：

- 友元关系不会自动双向成立；
- 友元的友元不会自动成为友元；
- 友元关系不会自动被继承。

广泛使用友元会削弱类隐藏实现的边界。它适合两个概念确实紧密协作的场景，不是
绕过访问错误的通用办法。

## 完整代码

下面的 `Score` 通过公开函数维护范围，并允许一个类外比较函数读取私有值：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Score {
private:
    int value;

public:
    bool set(int new_value) {
        if (new_value < 0 || new_value > 100) {
            return false;
        }
        value = new_value;
        return true;
    }

    int get() const {
        return value;
    }

    friend bool same_score(const Score& a, const Score& b);
};

bool same_score(const Score& a, const Score& b) {
    return a.value == b.value;
}

void solve() {
    int x;
    int y;
    cin >> x >> y;

    Score first;
    Score second;
    if (!first.set(x) || !second.set(y)) {
        cout << "invalid\n";
        return;
    }

    cout << first.get() << ' ' << second.get() << '\n';
    cout << (same_score(first, second) ? "same" : "different") << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
95 95
```

输出：

```text
95 95
same
```

`solve` 不能直接读取 `value`；成员函数 `get` 和显式声明的友元函数可以。

## 常见错误

### 忘记 protected

C++ 有三种成员访问权限。`protected` 主要服务于继承，不能因为竞赛中较少使用就
把它从语言概念中删除。

### 把 friend 当成访问标签

`friend` 精确授予某个函数或类访问权，不会开启一个影响后续成员的权限区域。

### 认为友元自动互相或传递

每个友元关系都要由提供非公开成员的类显式声明，不会自动双向、传递或继承。

### 为每个字段机械编写读写函数

访问控制应保护实际规则。若数据本来就是简单公开记录，使用 `struct` 的公开字段
可能更直接。

## 需要记住什么

1. `public`、`private` 和 `protected` 分别允许哪些位置访问成员？
2. `class` 与 `struct` 的默认成员访问权限分别是什么？
3. 同一个类的成员函数能否访问另一个同类对象的私有成员？
4. 封装为什么不只是给字段加上 `private`？
5. 友元函数会不会变成成员函数？
6. `friend` 为什么不是第四种访问权限？
7. 友元关系是否自动双向、传递或继承？
