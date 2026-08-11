# 入门：Hello World!

> 状态：定稿

这一章先不拆开学习所有语法。我们会运行一份完整程序，再亲手修改其中最重要的一小块，看看程序如何发生变化。

## 完整代码

先复制并运行下面的代码：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    cout << "Hello World!" << '\n';
}

int main() {
    solve();
    return 0;
}
```

### 运行结果

程序会输出：

```text
Hello World!
```

### 基本说明

现在只需要对这份代码建立一个整体印象。以后随题目变化的内容通常写在 `solve` 里面：

```cpp
void solve() {
    cout << "Hello World!" << '\n';
}
```

`cout` 把内容输出到屏幕上，`'\n'` 表示换到下一行。每次输出完整的一行后都主动换行，从第一份程序开始养成这个习惯。

其余内容，包括 `#include`、`using namespace std;`、`void`、`main` 和 `return 0;`，现在都先当成程序的固定格式。后面的教程会在真正需要时分别解释。

你可以把双引号中的文字换成自己的名字，再运行一次。

## 需要记住什么

1. 应该把随题目变化的主要代码写在哪里？
2. 怎样输出一行 `Hello World!` 并在末尾换行？

其余固定格式目前只需会复制和运行，不需要背诵含义。

## 下一篇

[入门：A+B Problem](a-plus-b-problem.md) 会第一次加入整数和输入，并把完成的程序提交给在线评测系统。
