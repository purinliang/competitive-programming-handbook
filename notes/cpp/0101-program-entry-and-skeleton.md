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
    cout << "Hello, world!" << '\n';
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

现在只需要对这份代码建立一个整体印象。以后随题目变化的内容通常写在 `solve` 里面：

```cpp
void solve() {
    cout << "Hello, world!" << '\n';
}
```

`cout` 把内容输出到屏幕上，`'\n'` 表示换到下一行。每次输出完整的一行后都主动换行，从第一份程序开始养成这个习惯。

其余内容，包括 `#include`、`using namespace std;`、`void`、`main` 和 `return 0;`，现在都先当成程序的固定格式。后面的教程会在真正需要时分别解释。

## 第一次修改 solve

接下来不动程序外壳，只把 `solve` 改成这样：

```cpp
void solve() {
    int a;
    int b;
    cin >> a >> b;
    cout << a + b << '\n';
}
```

这里只需要大概知道这几行的意思：

- `int a;` 声明一个整数 `a`。
- `int b;` 声明一个整数 `b`。
- `cin >> a >> b;` 从输入中依次读入两个整数，分别放进 `a` 和 `b`。
- `cout << a + b << '\n';` 输出 `a + b` 的结果，然后换行。

例如，输入：

```text
3 5
```

程序会输出：

```text
8
```

这里先认识效果就够了，不展开整数、变量、加法和输出的具体规则。

## 修改后的完整程序

把新的 `solve` 放回原来的外壳，完整程序如下：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int a;
    int b;
    cin >> a >> b;
    cout << a + b << '\n';
}

int main() {
    solve();
    return 0;
}
```

你可以换成其他两个整数，重新运行程序并观察输出。现在最重要的不是记住每个符号，而是知道我们通常在 `solve` 中编写随题目变化的内容。

接下来回到 [分阶段学习路线](../LEARNING-PATH.md)，逐项理解刚才已经用过的整数、变量、运算和其他 C++ 语法。
