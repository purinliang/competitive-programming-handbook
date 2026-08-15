# 函数的返回值

> 最近修订：2026-08-16 08:48 +10:00（未审阅）

有些函数不只是执行输出等操作，还要计算一个结果供调用处继续使用。例如，读取两个整数并求和后，调用处可能要把这个和保存、比较或参与下一步计算。

函数可以通过返回类型和 `return` 把一个值送回调用处。

## 返回类型

下面的函数读取两个整数并返回它们的和：

```cpp
int read_sum() {
    int a;
    int b;
    cin >> a >> b;
    return a + b;
}
```

定义开头的 `int` 是**返回类型**，表示一次成功调用会产生一个整数结果。

调用这种函数本身就是一个表达式：

```cpp
int result = read_sum();
```

程序进入函数体，读取并计算；`return a + b;` 把结果送回调用位置。整个 `read_sum()` 因而产生这个整数，用来初始化 `result`。

返回值不会自动输出。下面的调用虽然完成计算，却没有显示结果：

```cpp
read_sum();
```

若题目需要输出，调用处必须明确使用返回值：

```cpp
cout << read_sum() << '\n';
```

## return 结束调用

执行 `return` 时会立即结束当前这次函数调用。后面的语句不会继续执行：

```cpp
int read_sign() {
    int x;
    cin >> x;

    if (x > 0) {
        return 1;
    }
    if (x < 0) {
        return -1;
    }
    return 0;
}
```

若 `x > 0`，第一个 `return` 已经送回 `1`，后面的条件和 `return 0;` 都不会执行。只有前面条件不成立时，程序才继续向下。

这种写法可以让已经确定答案的分支尽早返回，减少不必要的嵌套。

## 每条路径都要返回

返回类型不是 `void` 的普通函数，每一条可能走到函数体末尾的执行路径都应提供一个返回值。

下面的函数遗漏了 `x <= 0` 时的结果：

```cpp
int positive_value() {
    int x;
    cin >> x;

    if (x > 0) {
        return x;
    }
}
```

编译器通常会警告“并非所有路径都有返回值”。正确代码要明确补全剩余情况：

```cpp
int positive_value() {
    int x;
    cin >> x;

    if (x > 0) {
        return x;
    }
    return 0;
}
```

检查返回值函数时，不能只确认某一个 `if` 中写了 `return`；应沿着所有可能路径检查是否都能得到符合返回类型的结果。

## 返回值的类型转换

`return` 后的表达式会转换成函数声明的返回类型：

```cpp
int read_integer_part() {
    double x;
    cin >> x;
    return x;
}
```

这里返回类型是 `int`，所以 `3.9` 会向 $0$ 截去小数部分并返回 `3`。这仍然遵循 [类型转换](type-conversions.md) 的规则，不会自动四舍五入。

返回类型应当准确表达函数真正提供的结果。若函数需要保留小数，就应该返回 `double`：

```cpp
double read_value() {
    double x;
    cin >> x;
    return x;
}
```

## void 与空 return

返回类型为 `void` 的函数不产生供调用处使用的数值：

```cpp
void print_line() {
    cout << "---" << '\n';
}
```

它可以直接执行到函数体末尾，也可以使用不带表达式的 `return;` 提前结束：

```cpp
void print_non_negative() {
    int x;
    cin >> x;

    if (x < 0) {
        return;
    }
    cout << x << '\n';
}
```

`void` 函数不能写 `return 5;`，有返回值的 `int` 函数也不能只写空的 `return;`。返回语句必须与返回类型一致。

## main 的返回值

`main` 的返回类型是 `int`：

```cpp
int main() {
    solve();
    return 0;
}
```

这里的 `0` 返回给程序的运行环境，表示正常结束，不是输出给题目答案。`main` 有一条特殊规则：执行到函数体末尾等价于 `return 0;`；本书仍然明确写出它，让程序入口的结束状态一目了然。

## 完整代码

下面的函数读取两个整数并返回较大值，`solve` 再输出调用结果：

```cpp
#include <bits/stdc++.h>
using namespace std;

int read_maximum() {
    int a;
    int b;
    cin >> a >> b;

    if (a > b) {
        return a;
    }
    return b;
}

void solve() {
    int answer = read_maximum();
    cout << answer << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
3 5
```

输出：

```text
5
```

## 常见错误

### 把返回值当成输出

`return answer;` 把值送回调用处，不会把它显示在标准输出中。题目要求输出时仍需使用 `cout` 或其他输出接口。

### 漏掉一条执行路径

返回值函数中的某个分支有 `return`，不代表所有情况都已覆盖。应检查条件不成立时程序会走到哪里。

### 在 return 后继续安排必要操作

`return` 会立即结束当前调用。必须执行的更新或输出不能放在已经执行的 `return` 后面。

### 返回类型不符合结果

返回 `int` 会丢掉浮点值的小数部分。根据题目需要选择返回类型，不要依赖隐式转换修补错误设计。

## 需要记住什么

1. 函数定义开头的返回类型说明什么？
2. 调用一个有返回值的函数为什么可以出现在初始化或表达式中？
3. `return expression;` 会送回什么，并怎样影响当前函数的后续语句？
4. 为什么返回值函数需要检查每一条可能的执行路径？
5. 返回表达式与返回类型不同时会发生什么？
6. `void` 函数怎样提前结束？它能否返回一个数值？
7. `main` 的 `return 0;` 是题目输出吗？
