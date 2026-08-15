# #include

> 最近修订：2026-08-16 12:24 +10:00（未审阅）

代码只能使用编译器在当前位置已经认识的名字。`scanf`、`vector` 和 `sort` 等库接口不是 C++ 核心语法中凭空存在的名字；标准库通过对应的**头文件**向程序提供它们的声明或定义。

`#include` 是一条预处理指令。它让指定头文件的内容在该位置参与后续编译，从而让编译器知道程序要使用的库接口。

## 预处理指令

一条 `#include` 以 `#` 开头，后面写头文件名：

```cpp
#include <cstdio>
```

它不是普通 C++ 语句，因此末尾不写分号。预处理发生在翻译源代码的早期阶段，可以将 `#include` 理解为“在这里展开头文件提供的内容”。

> C++ 标准不要求每个标准头一定是磁盘上可见的普通文件，而头文件内部也可能包含实现细节。“文本展开”是理解代码可见性的有用模型，不是对所有编译器内部实现的强制要求。

`#include` 通常放在源文件开头，使其提供的名字在后续代码中可见：

```cpp
#include <cstdio>

int main() {
    std::printf("Hello World!\n");
    return 0;
}
```

如果删除 `<cstdio>` 却继续使用 `std::printf`，程序不再拥有它所需的标准声明，应视为错误，而不能依赖某个编译环境恰好间接包含了它。

## 标准头文件

C++ 标准库将接口分在多个标准头文件中。常见对应关系包括：

| 接口 | 标准头文件 |
| --- | --- |
| `std::scanf`、`std::printf` | `<cstdio>` |
| `std::cin`、`std::cout` | `<iostream>` |
| `std::string` | `<string>` |
| `std::vector` | `<vector>` |
| `std::pair` | `<utility>` |
| `std::tuple` | `<tuple>` |
| `std::array` | `<array>` |
| `std::sort`、`std::lower_bound` | `<algorithm>` |
| `std::stack`、`std::queue`、`std::priority_queue` | `<stack>`、`<queue>` |
| `std::set`、`std::map` | `<set>`、`<map>` |
| `std::unordered_set`、`std::unordered_map` | `<unordered_set>`、`<unordered_map>` |

这张表用于查阅，不需要在学习容器之前背诵。每篇标准库文章会在真正使用接口时再说明它的标准头。

正式、可移植的 C++ 代码应当直接包含自己所使用接口规定的头文件。不要因为 `<vector>` 的某个实现内部恰好又包含了另一个头，就省略程序真正依赖的 `<algorithm>` 等头文件。这种间接包含不是接口保证，可能随标准库实现变化。

## C 头的 C++ 名称

C 标准库的传统头文件常带 `.h` 后缀：

```cpp
#include <stdio.h>
#include <string.h>
```

C++ 为对应接口提供了以 `c` 开头、去掉 `.h` 的标准头名：

```cpp
#include <cstdio>
#include <cstring>
```

在 C++ 代码中，本书使用 `<cstdio>`、`<cstring>` 这类 C++ 形式。这些头会在
`std` 命名空间中提供对应名字；后续
[命名空间与 std](namespace-and-std.md) 会解释 `std::`。

## 尖括号与双引号

`#include` 有两种常见形式：

```cpp
#include <cstdio>
#include "local-header.h"
```

`<...>` 让实现在它配置的系统或标准头搜索位置中查找。`"..."` 先按实现为用户头文件规定的方式搜索；如果这种搜索失败，再按 `<...>` 的方式处理。

“双引号总是先查找源文件所在目录”是很多编译器的常见行为，但具体搜索位置与顺序由实现和编译选项决定。标准库头使用尖括号，自己的项目头通常使用双引号。本仓库的竞赛模板是独立 `.cpp` 文件，不需要维护自定义头文件。

## bits/stdc++.h

GNU C++ 实现常提供一个聚合头：

```cpp
#include <bits/stdc++.h>
```

它一次包含 GNU 标准库实现中的大量常用头，可以减少竞赛中查找头文件的时间。它不是 C++17 标准的一部分；是否可用取决于评测环境的编译器和标准库实现。

本仓库面向使用 GNU C++17 的竞赛环境，所以教程的竞赛级完整代码与 `templates/` 默认写：

```cpp
#include <bits/stdc++.h>
using namespace std;
```

这是本仓库的编码约定，不是“任何 C++17 编译器都必须提供该头”的语言规则。如果目标平台不提供它，就改为显式包含代码实际需要的标准头。

## 完整代码

下面的程序只使用 `std::scanf` 和 `std::printf`，因此只需要包含它们所在的标准头 `<cstdio>`：

```cpp
#include <cstdio>

int main() {
    int a;
    int b;
    std::scanf("%d%d", &a, &b);
    std::printf("%d\n", a + b);
    return 0;
}
```

输入：

```text
3 5
```

输出：

```text
8
```

这份程序展示了标准头与库名字的精确对应。改写正式竞赛代码时，本仓库仍按上一节约定使用 `<bits/stdc++.h>`。

## 基础练习

1. 将完整代码中的 `<cstdio>` 删除，阅读编译器对 `std::scanf` 和 `std::printf` 的报错，然后恢复正确头文件。
2. 写一份使用 `std::vector<int>` 和 `std::sort` 的小程序，只包含 `<cstdio>`、`<vector>` 和 `<algorithm>`，不使用 `<bits/stdc++.h>`。
3. 将第二题改为本仓库的竞赛风写法，只保留 `<bits/stdc++.h>`，确认在 GNU C++17 环境中能够编译。

## 需要记住什么

1. `#include` 为什么以 `#` 开头且末尾不写分号？
2. 程序为什么应该直接包含自己使用接口规定的标准头，而不依赖间接包含？
3. `<cstdio>` 与 `<stdio.h>` 分别是哪种风格的头文件名？本书选择哪一种？
4. `<...>` 和 `"..."` 通常分别用于哪类头？为什么不应将某个编译器的具体搜索顺序当成语言规则？
5. `<bits/stdc++.h>` 是否属于 C++17 标准？本仓库为什么仍然使用它？

常见标准库接口与头文件的完整对应表不需要背诵，在学习和使用具体接口时查阅即可。本仓库的竞赛代码只需要熟悉 `<bits/stdc++.h>` 的使用边界。
