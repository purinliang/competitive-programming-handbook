# 结构体指针与箭头运算符

> 最近修订：2026-08-16 11:57 +10:00（未审阅）

[结构体](struct.md) 使用点运算符访问结构体对象的成员，[指针](pointers.md)
则通过解引用访问目标对象。指针指向结构体时，可以把两步组合起来，也可以使用
C++ 提供的箭头运算符简写。

## 指向结构体的指针

先声明一个结构体类型和对象：

```cpp
struct Contestant {
    int id;
    int score;
};

Contestant contestant{7, 95};
```

对象地址的类型是指向这种结构体的指针：

```cpp
Contestant* p = &contestant;
```

现在 `p` 保存 `contestant` 的地址。解引用 `*p` 得到原结构体对象：

```cpp
Contestant copy = *p;
```

这条语句把目标对象整体复制给 `copy`。若要直接访问目标对象中的一个成员，还要
继续使用点运算符。

## 解引用后访问成员

先解引用，再用点访问 `score`：

```cpp
cout << (*p).score << '\n';
```

括号不能省略。点运算符的结合优先于一元 `*`，直接写 `*p.score` 会先尝试
访问 `p.score`；但 `p` 是指针，不是结构体对象，没有这种点成员访问。

`(*p).score` 表示：

1. `*p` 找到 `p` 指向的 `Contestant` 对象；
2. `.score` 选择这个对象的 `score` 成员。

因此它不只是可以读取，也能修改原对象：

```cpp
(*p).score = 100;
```

执行后 `contestant.score` 变成 `100`。

## 箭头运算符

C++ 为“解引用结构体指针，再访问成员”提供箭头运算符 `->`：

```cpp
cout << p->score << '\n';
p->score = 100;
```

对普通结构体指针而言，两种表达式等价：

```text
p->score  等价于  (*p).score
```

代码拥有对象时用点：

```cpp
contestant.score
```

代码拥有指向对象的指针时用箭头：

```cpp
p->score
```

箭头不是另一种成员，也不会复制对象；它只是把解引用与点访问组合成一个更清楚
的运算符。

## 结构体数组中的指针

指针也可以指向结构体数组中的某个元素：

```cpp
Contestant contestants[4];
Contestant* p = &contestants[2];

p->id = 205;
p->score = 96;
```

这里 `p->score` 与 `contestants[2].score` 访问同一个整数成员。若执行 `p++`，
指针会移动到下一个 `Contestant` 元素，而不是移动到当前对象的下一个成员。

数组元素仍然按整个结构体对象连续排列。一次指针步进的字节距离是
`sizeof(Contestant)`，其中可能包含满足对齐要求的填充字节。

## 空指针与有效目标

箭头运算内部需要解引用，因此空指针不能使用 `->`：

```cpp
Contestant* p = nullptr;
p->score = 100;
```

这属于未定义行为。使用前必须确定 `p` 指向一个仍然存在的 `Contestant`
对象：

```cpp
if (p != nullptr) {
    cout << p->score << '\n';
}
```

检查非空只排除了 `nullptr`，不能挽救已经指向销毁对象的悬空指针。目标仍然
有效是所有解引用操作的共同前提。

## 完整代码

输入一个参赛者的编号和分数。程序让指针指向这个对象，通过箭头把分数增加
五分，再分别通过对象和指针输出同一组数据：

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Contestant {
    int id;
    int score;
};

void solve() {
    Contestant contestant;
    cin >> contestant.id >> contestant.score;

    Contestant* p = &contestant;
    p->score += 5;

    cout << contestant.id << ' ' << contestant.score << '\n';
    cout << p->id << ' ' << p->score << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
205 91
```

输出：

```text
205 96
205 96
```

两行相同，因为 `contestant` 和 `*p` 最终表示同一个结构体对象。

## 常见错误

### 对指针使用点运算符

点的左边需要结构体对象。左边是指针时，使用 `p->member`，或明确写成
`(*p).member`。

### 省略解引用括号

`*p.member` 不等价于 `(*p).member`。使用箭头可以直接避开这层优先级错误。

### 对空指针使用箭头

箭头包含解引用。指针为空或目标已经销毁时，不能访问成员。

### 以为 p++ 移动到下一个成员

指针算术以所指类型为单位。`Contestant*` 加一会移动到结构体数组的下一个完整
对象，与成员声明顺序无关。

## 需要记住什么

1. `Contestant* p = &contestant` 中，`p` 保存什么？
2. `(*p).score` 为什么需要括号？
3. `p->score` 与哪个表达式等价？
4. 什么时候使用点运算符，什么时候使用箭头运算符？
5. 修改 `p->score` 为什么会修改原结构体对象？
6. `Contestant*` 在结构体数组中加一会移动到哪里？
7. 为什么空指针不能使用箭头访问成员？
