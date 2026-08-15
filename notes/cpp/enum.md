# 复合类型：enum

> 最近修订：2026-08-13 02:43 +10:00（未审阅）

有些变量只允许有限的几种状态，例如一场比赛的结果只能是负、平、胜，一个方向只能是上、右、下、左。直接用整数 `0`、`1`、`2` 表示它们虽然能运行，却要求读者到处记忆每个数字的含义。

`enum` 声明**枚举类型**，为有限的一组整数取值建立名称。代码因此可以写 `WIN`，而不是意义不明的 `2`。

> [C++17 标准草案的类型分类](https://timsong-cpp.github.io/cppwp/n4659/basic.compound) 明确把枚举列为 compound type，也就是本书所说的“复合类型”。这里的“复合”是 C++ 标准中的分类名称，不表示一个枚举对象像 `struct` 一样同时包含多个成员；枚举变量仍然只保存一个枚举值。

## 声明枚举类型

声明比赛结果：

```cpp
enum Result { LOSS, DRAW, WIN };
```

- `enum` 表示声明枚举类型；
- `Result` 是新类型的名字；
- `LOSS`、`DRAW`、`WIN` 称为**枚举项**；
- 右花括号后的分号不能省略。

随后可以声明 `Result` 类型的变量：

```cpp
Result result = DRAW;
```

变量名称 `result` 表示当前结果，值 `DRAW` 直接说明是哪一种状态。

## 枚举项的整数值

若没有明确指定，第一个枚举项的值是 $0$，后面的值依次增加 $1$。所以上面的声明中：

| 枚举项 | 整数值 |
| --- | ---: |
| `LOSS` | 0 |
| `DRAW` | 1 |
| `WIN` | 2 |

也可以自己指定值：

```cpp
enum Result { LOSS = -1, DRAW = 0, WIN = 1 };
```

没有写值的后续枚举项，会在前一个值的基础上增加 $1$：

```cpp
enum Code { FIRST = 10, SECOND, THIRD };
```

这里 `SECOND` 是 $11$，`THIRD` 是 $12$。

如果程序逻辑只关心不同状态，不要依赖默认数字。枚举项名称才是主要接口；只有题目输入、协议或公式明确规定编码时，才需要指定整数值。

## 赋值与比较

枚举变量应当保存同一枚举类型的枚举项：

```cpp
Result result = LOSS;
result = WIN;
```

可以直接比较：

```cpp
if (result == WIN) {
    printf("win\n");
}
```

普通 `enum` 的枚举项可以转换成整数：

```cpp
int code = WIN;
```

但整数不能在没有转换的情况下直接赋给枚举变量：

```cpp
Result result = 1;
```

这段代码不能通过标准 C++17 编译。即使整数恰好等于某个枚举项，也不能把任意题面数字未经检查地当作枚举状态。

需要从输入编码建立枚举值时，优先使用分支明确映射：

```cpp
int code;
scanf("%d", &code);

Result result;
if (code == -1) {
    result = LOSS;
} else if (code == 0) {
    result = DRAW;
} else {
    result = WIN;
}
```

这种写法同时检查了合法输入与每个编码的含义。

## 与 switch 配合

枚举表示有限状态，`switch` 正好按离散取值选择分支：

```cpp
switch (result) {
case LOSS:
    printf("loss\n");
    break;
case DRAW:
    printf("draw\n");
    break;
case WIN:
    printf("win\n");
    break;
}
```

每个 `case` 直接使用枚举项，不需要重复解释 `-1`、`0`、`1`。编译器开启警告时，还可能提醒某个枚举项没有被处理。

若所有枚举项都已经列出，通常不写吞掉未知情况的 `default`，这样以后增加新枚举项时更容易得到遗漏警告。题目输入仍应在转换为枚举状态之前完成合法性检查。

## 名称作用域

普通 `enum` 的枚举项名称会进入声明所在的作用域：

```cpp
enum Direction { UP, RIGHT, DOWN, LEFT };

Direction direction = UP;
```

这种写法简洁，竞赛代码中很常见。但两个普通枚举若都想声明 `UNKNOWN`，名称就会冲突。

C++ 还提供 `enum class`，枚举项保留在枚举类型自己的作用域中：

```cpp
enum class Direction { UP, RIGHT, DOWN, LEFT };

Direction direction = Direction::UP;
```

访问枚举项必须写 `Direction::UP`，而且它不会自动转换成整数。`enum class` 能减少名称冲突与意外混用，代价是书写更长。

本书的短小竞赛代码默认使用普通 `enum`；大型程序或多个枚举容易重名时，可以使用 `enum class`。两者的核心作用相同：把有限状态变成有名称的独立类型。

## 枚举不是多个开关

枚举变量一次保存一个取值，适合“负、平、胜三选一”。如果一个对象能够同时拥有多项独立性质，例如同时“可见”和“可移动”，它们不是互斥状态，不应该勉强塞进一个普通枚举。

同时存在的真假属性可以分别使用 `bool`，数量很多时可以使用 [位运算符](bitwise-operators.md) 管理位掩码。先分清“只能选一种状态”还是“多个开关可以同时开启”。

## 与 union 配合

[联合体](union.md) 只能保存一个当前成员，却不会自动记录它是谁。枚举可以充当标签：

```cpp
enum NumberType { INTEGER, DECIMAL };

NumberType type;
Number number;
```

当 `type == INTEGER` 时读取 `number.integer`，当 `type == DECIMAL` 时读取 `number.decimal`。写入联合体新成员时必须同步更新标签。

这只是展示两个知识点怎样组合。普通竞赛题很少需要手写通用的“枚举加联合体”容器。

## 完整代码

输入选手得分 `a` 与对手得分 `b`，用枚举保存比赛结果，再输出 `loss`、`draw` 或 `win`。

```cpp
#include <bits/stdc++.h>
using namespace std;

enum Result { LOSS, DRAW, WIN };

int main() {
    int a;
    int b;
    scanf("%d%d", &a, &b);

    Result result;
    if (a < b) {
        result = LOSS;
    } else if (a == b) {
        result = DRAW;
    } else {
        result = WIN;
    }

    switch (result) {
    case LOSS:
        printf("loss\n");
        break;
    case DRAW:
        printf("draw\n");
        break;
    case WIN:
        printf("win\n");
        break;
    }
    return 0;
}
```

输入：

```text
7 5
```

输出：

```text
win
```

分支先把普通数值关系翻译成准确的枚举状态，后面的输出只处理 `Result`，不再重复比较两个分数。

## 常见错误

### 使用意义不明的整数代替状态

如果变量只允许有限状态，枚举项能让赋值、比较与分支直接表达含义。不要在多处散落需要人工记忆的魔法数字。

### 假设普通整数可以直接赋给枚举

先检查输入编码，再通过分支映射到合法枚举项。不要只因为数值相同就跳过类型边界。

### 把枚举当成多个同时存在的标记

枚举表示一个离散取值。多个独立属性使用多个 `bool` 或位掩码。

### 忘记普通枚举项会占用外层名称

普通 `enum` 的枚举项可能与其他名称冲突。需要独立作用域时使用 `enum class`，并通过 `Type::VALUE` 访问。

### switch 漏掉状态

有限状态增加后，应同步处理每个 `case`。保持编译警告开启，并避免用无意义的 `default` 掩盖遗漏。

## 需要记住什么

1. `enum` 解决的是哪一类“有限状态”问题？
2. 没有指定数值时，枚举项的整数值怎样产生？
3. 为什么代码应优先依赖枚举项名称，而不是默认整数值？
4. 普通整数能否直接赋给枚举变量？输入编码应怎样映射？
5. `switch` 为什么适合处理枚举状态？
6. 普通 `enum` 与 `enum class` 的名称作用域和整数转换有什么区别？
7. 枚举与多个独立布尔开关有什么区别？
8. 枚举怎样为 `union` 提供当前成员标签？

枚举底层整数类型的选择、显式指定底层类型和复杂模板中的类型规则不属于基础竞赛用法，不要求理解或记忆。
