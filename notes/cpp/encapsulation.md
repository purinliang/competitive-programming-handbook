# 封装

> 最近修订：2026-08-16 20:45 +10:00（未审阅）

[类](class.md) 可以把数据成员与成员函数放进同一种类型，但“放在一起”还没有解决
一个更重要的问题：外部代码若能随意修改所有数据，对象很容易进入本来不允许的
状态。

**封装**是把一组相关状态及其操作组织在一起，并通过稳定接口控制状态怎样变化。
它是一种设计思想，不是某一个 C++ 关键字。

## 从非法状态开始

假设用两个整数表示闭区间：

```cpp
struct Interval {
    int left;
    int right;
};
```

闭区间应满足 `left <= right`。然而字段全部公开时，任何位置都能写出：

```cpp
Interval interval;
interval.left = 10;
interval.right = 3;
```

对象现在表示一个不符合约定的区间。随后计算 `right - left + 1` 会得到负数，但错误
真正产生在更早的任意赋值处。程序规模扩大以后，很难检查每个修改位置是否都维护了
同一条规则。

## 不变量

一个对象在公开操作完成以后始终应该满足的规则称为**不变量**。闭区间的
`left <= right` 就是一条不变量；其他例子包括：

- 树状数组内部存储长度与逻辑长度一致；
- 栈的大小不能为负数；
- 分数的分母不能为零；
- 维护有序序列的容器在修改后仍然有序。

不变量不是“程序运行过程中每一条机器指令之间都绝不暂时变化”。成员函数可以在
内部完成若干更新，但它对外返回时必须恢复全部规则。

## 接口与实现

类的使用者真正需要的是“设置一个合法区间”“计算长度”和“判断是否包含某个点”，
而不是随意改动两个字段。

因此可以把状态隐藏起来，只公开表达实际操作的成员函数：

```cpp
class Interval {
  private:
    int left;
    int right;

  public:
    bool set(int new_left, int new_right) {
        if (new_left > new_right) {
            return false;
        }
        left = new_left;
        right = new_right;
        return true;
    }

    int length() const {
        return right - left + 1;
    }
};
```

类外能够调用的 `set` 和 `length` 构成**公开接口**。`left`、`right` 以及检查与计算
的具体写法属于**实现细节**。

调用者不再分别修改两个端点，而是一次提交完整的新状态：

```cpp
Interval interval;
if (!interval.set(3, 7)) {
    cout << "invalid" << '\n';
}
```

只要类外代码不能绕过接口修改端点，一次成功的 `set` 就能保证不变量成立。

## 封装不等于 private

`private` 是限制类外直接访问的语言工具，却不是封装的完整含义。下面的接口虽然把
字段藏起来，仍然没有维护任何规则：

```cpp
void set_left(int value) {
    left = value;
}

void set_right(int value) {
    right = value;
}
```

调用者仍然可以先把 `left` 改到 `right` 右侧，使对象非法。机械地为每个字段分别
编写读取和写入函数，只是改变了语法，没有设计出保护状态的操作。

反过来，一个 `struct` 也能把状态和操作组织在一起。竞赛中的树状数组、线段树和
并查集常用 `struct` 封装成员与操作，只是为了默认公开和书写简洁。判断有没有封装，
应观察状态、操作和不变量是否形成清楚边界，而不是只看关键字写成 `class` 还是
`struct`。

## 最小公开接口

公开接口应让正常操作容易表达，同时避免暴露调用者不需要依赖的细节。例如区间类
可以直接提供包含判断：

```cpp
bool contains(int x) const {
    return left <= x && x <= right;
}
```

调用处只写：

```cpp
if (interval.contains(x)) {
    cout << "inside" << '\n';
}
```

以后即使内部表示发生变化，只要 `contains` 的含义保持不变，调用处通常不需要修改。
这就是稳定接口的价值。

“最小”不表示函数越少越好。它表示接口围绕类型真正支持的操作建立，不要求调用者
先拆开内部状态、在类外重复维护规则，再把结果塞回对象。

## 构造后的有效状态

本篇还没有学习构造函数，因此示例要求：创建 `Interval` 后先成功调用一次 `set`，
再使用 `length` 或 `contains`。如果第一次设置失败，程序不能读取尚未建立的端点。

[构造函数](constructors.md) 会进一步把“建立对象”和“建立有效初始状态”合成一步，
减少忘记初始化的可能。封装提出对象应维护什么规则，构造函数只是帮助建立这些规则
的一种机制。

## 完整代码

程序读取闭区间端点 `left`、`right` 和查询位置 `x`。若端点不能组成合法闭区间，
输出 `invalid`；否则输出区间长度，并判断 `x` 是否位于区间中。

```cpp
#include <bits/stdc++.h>
using namespace std;

class Interval {
  private:
    int left;
    int right;

  public:
    bool set(int new_left, int new_right) {
        if (new_left > new_right) {
            return false;
        }
        left = new_left;
        right = new_right;
        return true;
    }

    int length() const {
        return right - left + 1;
    }

    bool contains(int x) const {
        return left <= x && x <= right;
    }
};

void solve() {
    int left;
    int right;
    int x;
    cin >> left >> right >> x;

    Interval interval;
    if (!interval.set(left, right)) {
        cout << "invalid" << '\n';
        return;
    }

    cout << interval.length() << '\n';
    cout << (interval.contains(x) ? "inside" : "outside") << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3 7 5
```

输出：

```text
5
inside
```

这份程序的计算仍然都是 $O(1)$。封装本身不是用来降低渐进复杂度的算法；它让维护
同一状态的规则集中在一个边界内，降低修改和复用代码时破坏不变量的风险。

## 常见错误

### 把封装理解成给字段加 private

隐藏字段只是限制访问。公开操作若仍然允许随意制造非法状态，就没有维护真正的
不变量。

### 为每个字段机械提供写接口

逐字段写入常常把本应一起检查的状态重新拆开。优先公开“设置合法区间”“加入一个
元素”等有完整语义的操作。

### 把所有实现都隐藏起来

简单记录本来就可能适合公开字段。封装服务于稳定接口和状态规则，不要求每个短小
`struct` 都写成复杂的私有成员体系。

### 在初始化成功前读取状态

本篇没有使用构造函数，必须先确认 `set` 成功。后续可以用构造函数或默认成员初值
让对象从建立时就处于有效状态。

## 需要记住什么

1. 什么是不变量？闭区间需要维护哪条不变量？
2. 公开接口与实现细节分别面向谁？
3. 为什么把字段改成 `private` 不自动等于完成封装？
4. 为什么分别提供 `set_left` 和 `set_right` 仍可能破坏区间规则？
5. `struct` 能不能用于封装竞赛数据结构？
6. 封装是否会自动降低算法的时间复杂度？
7. 本篇示例为什么必须先确认 `set` 成功，再调用其他成员函数？
