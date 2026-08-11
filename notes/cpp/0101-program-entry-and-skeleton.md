# 入门实践：Hello World 与整数加法

> 状态：草稿
> 直接前置：—

这一章先不拆开学习所有语法。我们会运行一份完整程序，再亲手修改其中最重要的一小块，看看程序如何发生变化。

## 第一个程序

先复制并运行下面的代码：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    cout << "Hello, world!\n";
}

int main() {
    solve();
    return 0;
}
```

程序会输出：

```text
Hello, world!
```

现在只需要对这份代码建立一个整体印象。

最上面的两行先作为竞赛程序的固定写法：

```cpp
#include <bits/stdc++.h>
using namespace std;
```

它们让我们可以直接使用 C++ 标准库提供的工具。具体原理以后需要时再解释。

程序从 `main` 开始运行：

```cpp
int main() {
    solve();
    return 0;
}
```

`main` 调用一次 `solve`，等 `solve` 完成后，再用 `return 0;` 表示程序正常结束。

真正解决题目的代码放在 `solve` 里面：

```cpp
void solve() {
    cout << "Hello, world!\n";
}
```

这里的 `cout` 负责把右侧的内容输出到屏幕上，所以我们看见了 `Hello, world!`。字符串末尾的 `\n` 表示换到下一行；每次输出完整的一行后都主动换行，从第一份程序开始养成这个习惯。

## 第一次修改 solve

接下来不动程序外壳，只把 `solve` 改成这样：

```cpp
void solve() {
    int a = 3;
    int b = 5;
    cout << a + b << '\n';
}
```

这三行依次做了三件事：

- `int a = 3;` 准备一个用来保存整数的位置，把它命名为 `a`，并在其中放入 `3`。
- `int b = 5;` 再准备一个保存整数的位置，把它命名为 `b`，并在其中放入 `5`。
- `cout << a + b << '\n';` 计算 `a + b`，输出结果后再换行。

这一次程序会输出：

```text
8
```

这里先认识效果就够了。`int` 为什么能保存整数、变量如何声明、`+` 如何运算、`cout` 如何输出，后面的教程都会分别讲清楚。

## 修改后的完整程序

把新的 `solve` 放回原来的外壳，完整程序如下：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a = 3;
    int b = 5;
    cout << a + b << '\n';
}

int main() {
    solve();
    return 0;
}
```

你可以修改 `3` 和 `5`，重新运行程序并观察输出。现在最重要的不是记住每个符号，而是知道：程序从 `main` 开始，`main` 进入 `solve`，我们通常在 `solve` 中编写随题目变化的内容。

接下来回到 [分阶段学习路线](../LEARNING-PATH.md)，逐项理解刚才已经用过的整数、变量、运算和其他 C++ 语法。
