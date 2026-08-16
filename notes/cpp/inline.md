# `inline`

> 最近修订：2026-08-16 14:33 +10:00（未审阅）

函数调用需要建立调用关系，而把短函数的代码直接放到调用位置有时能够减少开销，
还可能让编译器继续优化。`inline` 这个关键字的名字来自这种“内联展开”愿望，
但现代 C++ 中不能把它理解成强制优化命令。

`inline` 真正由语言保证的重要作用，是允许同一个函数或变量的相同定义出现在多个
翻译单元中，适合把短定义写进会被多个 `.cpp` 包含的头文件。竞赛的单文件程序
通常不需要主动使用它。

## 函数内联优化

可以在函数声明前写 `inline`：

```cpp
inline int square(int x) {
    return x * x;
}
```

编译器可能把：

```cpp
int answer = square(5);
```

优化成近似直接计算 `5 * 5`，不保留实际函数调用。但 C++ 不保证因为写了
`inline` 就一定展开。函数太大、递归、优化设置不同或编译器判断不合适时，都可以
保留普通调用。

反过来，没有写 `inline` 的短函数也可能被编译器自动内联。是否展开是优化决策，
不应成为算法正确性的前提。

## 多翻译单元中的定义

普通非模板函数若在头文件中完整定义，而这个头被多个 `.cpp` 包含，链接时可能
出现同一个函数的多重定义：

```cpp
// arithmetic.h
int square(int x) {
    return x * x;
}
```

把它声明为 `inline` 后，符合规则的相同定义可以出现在多个翻译单元中：

```cpp
// arithmetic.h
inline int square(int x) {
    return x * x;
}
```

这些定义必须满足单一定义规则对 inline 实体的要求，例如各处定义一致。`inline`
不是“允许不同 `.cpp` 各自写一个同名但行为不同的函数”。

本仓库模板都是独立 `.cpp` 文件，不会因为同一头文件定义被多处包含而遇到这个
问题，所以无需为普通辅助函数普遍添加 `inline`。

## 类内定义的成员函数

直接在类定义内部给出函数体的成员函数通常隐式具有 inline 属性：

```cpp
class Counter {
private:
    int value;

public:
    int get() const {
        return value;
    }
};
```

这里不需要重复写 `inline int get() const`。这仍然不保证编译器一定展开调用，只
解决语言层面的多处定义许可等问题。

## inline 变量

C++17 允许 inline 变量：

```cpp
inline const int MAX_SCORE = 100;
```

它可以在头文件中定义，并由多个翻译单元共同使用同一个实体。类的静态数据成员
也可以在类内写成 inline 变量：

```cpp
class Counter {
public:
    inline static int total = 0;
};
```

这可以省去旧式写法中的类外定义。单文件竞赛代码写普通全局 `const` 或按需要
提供一次静态成员定义已经足够，不必为了使用新语法强行改成 inline 变量。

## 与 define 宏的区别

带参数宏在预处理阶段替换文本：

```cpp
#define SQUARE(x) ((x) * (x))
```

inline 函数仍是真正的 C++ 函数，具有参数类型、作用域、一次实参求值和编译器
检查：

```cpp
inline int square(int x) {
    return x * x;
}
```

需要一个短操作时应优先使用普通函数；是否额外写 `inline` 由定义是否要放进头
文件等语言需求决定，不要用宏模拟函数展开。

## 完整代码

下面的 `square` 即使最终没有被编译器展开，程序结果也完全相同：

```cpp
#include <bits/stdc++.h>
using namespace std;

inline int square(int x) {
    return x * x;
}

void solve() {
    int x;
    cin >> x;
    cout << square(x) << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
12
```

输出：

```text
144
```

本篇示例为了观察语法写出 `inline`；普通竞赛辅助函数直接写 `int square(int x)`
更常见。

## 常见错误

### 把 inline 当成强制展开命令

编译器可以忽略展开建议，也可以内联没有该关键字的函数。

### 依赖内联保证复杂度

内联只可能改变调用常数，不会把 $O(n)$ 算法变成 $O(1)$，也不能成为正确性条件。

### 认为 inline 允许不同定义

多个翻译单元中的 inline 定义仍需满足单一定义规则，不能各自实现不同含义。

### 给每个类内成员重复写 inline

直接在类定义内给出函数体的成员函数通常已经隐式 inline，不需要为视觉强调重复
关键字。

## 需要记住什么

1. `inline` 是否强制编译器把函数体展开到调用位置？
2. 没有写 `inline` 的函数能否被编译器自动内联？
3. inline 函数为什么适合定义在会被多个翻译单元包含的头文件中？
4. 多处 inline 定义可以拥有不同函数体吗？
5. 类内定义的成员函数是否需要重复写 `inline`？
6. inline 函数与参数宏在类型、作用域和实参求值上有什么不同？
7. 单文件竞赛程序为什么通常不需要主动使用 `inline`？
