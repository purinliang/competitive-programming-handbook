# 表达式求值

> 最近修订：2026-08-16 11:07 +10:00（未审阅）

人通常把二元运算符写在两个操作数中间，例如 `2 + 3`。表达式变长以后，还要依靠优先级、结合方向与括号确定先算哪一部分：

```text
12 + 3 * (4 + 5) - 6 / 2
```

程序若只从左到右立即计算，会把尚未看见的高优先级运算漏掉。栈可以暂存“已经读到、但还不能执行”的运算符，也可以保存“已经读完、但还在等待组合”的数值。

本篇先用表达式树统一解释前缀、中缀、后缀三种写法，再推导后缀表达式求值和中缀转后缀。最终程序会输出中缀表达式对应的后缀形式与计算结果。

## 基础语法范围

为了聚焦栈与表达式结构，完整代码只处理：

- 非负多位整数；
- 二元运算符 `+`、`-`、`*`、`/`；
- 圆括号；
- 任意数量的空格、制表符和行末空白。

四种运算都使用 64 位整数。除法采用 C++ 整数除法，也就是向零截断；输入保证除数不为零，并且所有整数字面量和中间结果都能用 64 位整数保存。

一元正号与负号不在本篇语法中。`-3`、`2*-3` 和 `-(1+2)` 都需要先区分一元、二元运算符，不能直接交给当前代码。输入保证括号匹配、操作数和运算符位置合法。

先把语法边界写清楚，后面每个字符才能只有一种解释。

## 表达式树

表达式：

```text
(2 + 3) * (4 - 1)
```

可以画成一棵二叉树：

```text
          *
        /   \
       +     -
      / \   / \
     2   3 4   1
```

- 叶节点是数值；
- 每个内部节点是一个二元运算符；
- 左右子树分别是运算符的左操作数和右操作数。

表达式树明确保存了运算结构。根节点的乘法必须等左右子表达式都得到结果后才能执行；减法的左右次序也由两棵子树固定，不会因为书写方式改变。

这里的表达式树只是一张帮助观察运算顺序的结构图，不要求读者提前掌握树的存储或遍历算法。

## 中缀表达式

中缀表达式（infix expression）把运算符写在两个操作数中间。对表达式树递归执行：

```text
左子表达式 运算符 右子表达式
```

得到：

```text
(2 + 3) * (4 - 1)
```

括号、优先级和结合方向共同恢复树形结构。没有括号时，`*`、`/` 的优先级高于 `+`、`-`；同一优先级的这四种二元运算符都从左向右结合。

例如：

```text
8 - 3 - 2
```

表示 `(8 - 3) - 2`，结果是 `3`，不是 `8 - (3 - 2)`。

## 前缀表达式

前缀表达式（prefix expression）把每个运算符写在两个操作数以前。对同一棵表达式树按照：

```text
运算符 左子表达式 右子表达式
```

递归书写，得到：

```text
* + 2 3 - 4 1
```

从完全加括号的中缀形式也能建立直觉：

```text
((2 + 3) * (4 - 1))
```

把每对括号中的运算符拉到对应两个表达式前面，再去掉括号，就得到前缀表达式。

每个二元运算符后面恰好跟着两棵完整子表达式，因此不再需要优先级或括号来表示结构。

## 后缀表达式

后缀表达式（postfix expression，也称 Reverse Polish notation，RPN）把每个运算符写在两个操作数以后。按照：

```text
左子表达式 右子表达式 运算符
```

递归书写，得到：

```text
2 3 + 4 1 - *
```

也可以从完全加括号的中缀形式出发，把每对括号中的运算符拉到对应两个表达式后面，再去掉括号。

三个形式对应表达式树的三种遍历：

| 表示 | 访问顺序 | 示例 |
| --- | --- | --- |
| 前缀 | 根、左、右 | `* + 2 3 - 4 1` |
| 中缀 | 左、根、右 | `(2 + 3) * (4 - 1)` |
| 后缀 | 左、右、根 | `2 3 + 4 1 - *` |

表达式树不是第四种互不相关的写法，而是三种线性表示共同描述的结构。

## 为什么后缀容易求值

扫描后缀表达式：

```text
2 3 + 4 1 - *
```

读到一个数时，还不知道它会与哪个运算符组合，先压入数值栈。读到一个二元运算符时，它所需的两个完整子表达式已经扫描完毕，结果正好位于栈顶的两个位置。

处理 `2 3 +`：

```text
push 2
push 3
pop 3, pop 2, calculate 2 + 3
push 5
```

子表达式 `2 3 +` 被它的结果 `5` 替代。继续扫描时，外层运算不需要知道这个 `5` 原来由多少个记号组成。

## 操作数顺序

读到一个二元运算符时，先弹出的是右操作数，后弹出的是左操作数：

```cpp
ll right = values.top();
values.pop();

ll left = values.top();
values.pop();
```

然后计算：

```cpp
values.push(calculate(left, right, operation));
```

加法和乘法交换左右看不出问题，减法与除法会立刻出错。例如后缀 `8 2 /` 应计算 `8 / 2`，不能按照弹出顺序写成 `2 / 8`。

四种运算集中在一个函数中：

```cpp
ll calculate(ll left, ll right, char operation) {
    if (operation == '+') {
        return left + right;
    }
    if (operation == '-') {
        return left - right;
    }
    if (operation == '*') {
        return left * right;
    }
    return left / right;
}
```

最后一个分支对应 `/`，因为输入语法保证不会出现其他运算符。

## 前缀求值

前缀表达式中，运算符出现在两个子表达式以前。可以从右向左扫描：

- 数值压栈；
- 遇到运算符时，第一次弹出的是左操作数，第二次弹出的是右操作数；
- 计算后把结果压回栈。

例如反向扫描：

```text
* + 2 3 - 4 1
```

会先得到 `4 - 1 == 3`，再得到 `2 + 3 == 5`，最后计算 `5 * 3 == 15`。

前缀与后缀求值本质相同：扫描方向要保证运算符出现时，两棵子表达式已经成为栈顶结果。完整程序选择更适合从左到右输出和计算的后缀形式，不再复制一份几乎相同的前缀代码。

## 不能按字符处理多位数

表达式 `12 + 3` 中，字符 `'1'` 和 `'2'` 共同组成一个整数 `12`，不能当成两个操作数。正式转换以前，需要先把字符序列拆成记号（token）：

- 一个完整整数是一个数值记号；
- 每个运算符或括号是一个符号记号；
- 空白不产生记号。

定义：

```cpp
struct Token {
    bool is_number;
    ll value;
    char symbol;
};
```

数值记号使用 `value`，符号记号使用 `symbol`。`is_number` 明确区分二者，避免用某个可能与合法数值冲突的哨兵。

## 读取一个完整整数

`string` 使用原生 0-based 下标。扫描到数字时，不断把连续数字加入当前值：

```cpp
ll value = 0;

while (i < n && expression[i] >= '0' && expression[i] <= '9') {
    value = value * 10 + (expression[i] - '0');
    i++;
}
```

每读一位，原值十进制左移一位，再加入新数字。循环结束时，`i` 已经指向第一个非数字字符，不要在外层额外增加一次。

记号序列使用本书自定义的 1-based 约定，在位置 `0` 放一个不参与处理的空记号：

```cpp
vector<Token> tokens(1);
tokens.push_back({true, value, 0});
```

## 分词函数

空格、制表符和换行只用于排版，直接跳过：

```cpp
bool is_space(char c) {
    return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}
```

完整分词函数是：

```cpp
vector<Token> tokenize(const string& expression) {
    vector<Token> tokens(1);
    int n = expression.size();

    for (int i = 0; i < n;) {
        if (is_space(expression[i])) {
            i++;
            continue;
        }

        if (expression[i] >= '0' && expression[i] <= '9') {
            ll value = 0;
            while (i < n && expression[i] >= '0' && expression[i] <= '9') {
                value = value * 10 + (expression[i] - '0');
                i++;
            }
            tokens.push_back({true, value, 0});
            continue;
        }

        tokens.push_back({false, 0, expression[i]});
        i++;
    }

    return tokens;
}
```

分词只负责识别边界，不决定运算顺序。`12` 在这一层成为一个整体，`+`、`*`、`(`、`)` 仍保留原符号。

## 中缀转后缀

中缀表达式中的数值出现顺序与后缀表达式相同，真正需要重新安排的是运算符。

扫描中缀记号时维护：

- `postfix`：已经确定顺序的后缀输出；
- `operators`：已经读到、但执行位置尚未确定的运算符与左括号。

数值能够直接进入输出。运算符则要等到它的左操作数完整输出，并确认不会被括号或更高优先级运算改变顺序以后，才能从栈中弹到输出。

## 数值直接输出

数值在三种表达式中的相对顺序不会改变，直接追加：

```cpp
if (current.is_number) {
    postfix.push_back(current);
    continue;
}
```

## 左括号建立边界

左括号表示一个新的子表达式开始。先压入运算符栈：

```cpp
if (current.symbol == '(') {
    operators.push('(');
    continue;
}
```

它不是需要计算的运算符，只是一道边界。括号内部的运算符不能越过它与括号外部比较。

## 右括号完成子表达式

读到右括号时，括号内部已经全部扫描完成。把运算符依次弹到后缀输出，直到遇到配对的左括号：

```cpp
if (current.symbol == ')') {
    while (operators.top() != '(') {
        postfix.push_back({false, 0, operators.top()});
        operators.pop();
    }
    operators.pop();
    continue;
}
```

最后一次 `pop()` 只删除左括号，不把括号输出到后缀表达式。输入保证括号合法，因此寻找过程中运算符栈一定非空。

## 运算符优先级

建立优先级函数：

```cpp
int precedence(char operation) {
    if (operation == '+' || operation == '-') {
        return 1;
    }
    return 2;
}
```

乘除返回 `2`，加减返回 `1`。括号不会传入这个函数。

读到当前运算符 `current_operation` 时，只要栈顶：

- 不是左括号；
- 优先级高于当前运算符，或者与当前运算符相等；

栈顶运算就应当先完成，弹到后缀输出：

```cpp
while (!operators.empty() && operators.top() != '(' &&
       precedence(operators.top()) >= precedence(current_operation)) {
    postfix.push_back({false, 0, operators.top()});
    operators.pop();
}

operators.push(current_operation);
```

相等时也弹出，是因为当前四种二元运算符都从左向右结合。处理 `8 - 3 - 2` 中的第二个减号时，第一个减号必须先输出，得到：

```text
8 3 - 2 -
```

若只弹出严格更高优先级运算符，就会错误形成右结合。

## 扫描结束

全部中缀记号处理完后，运算符栈中剩下的运算符已经没有后续操作数或右括号影响顺序，依次弹到输出：

```cpp
while (!operators.empty()) {
    postfix.push_back({false, 0, operators.top()});
    operators.pop();
}
```

合法输入的左括号都已经被右括号删除，因此这里不会输出括号。

## 完整转换函数

```cpp
vector<Token> infix_to_postfix(const vector<Token>& infix) {
    vector<Token> postfix(1);
    stack<char> operators;
    int n = infix.size() - 1;

    for (int i = 1; i <= n; i++) {
        Token current = infix[i];

        if (current.is_number) {
            postfix.push_back(current);
            continue;
        }

        if (current.symbol == '(') {
            operators.push('(');
            continue;
        }

        if (current.symbol == ')') {
            while (operators.top() != '(') {
                postfix.push_back({false, 0, operators.top()});
                operators.pop();
            }
            operators.pop();
            continue;
        }

        char current_operation = current.symbol;
        while (!operators.empty() && operators.top() != '(' &&
               precedence(operators.top()) >= precedence(current_operation)) {
            postfix.push_back({false, 0, operators.top()});
            operators.pop();
        }
        operators.push(current_operation);
    }

    while (!operators.empty()) {
        postfix.push_back({false, 0, operators.top()});
        operators.pop();
    }

    return postfix;
}
```

## 手动转换

转换：

```text
12 + 3 * (4 + 5) - 6 / 2
```

栈内容按照从底到顶书写：

| 当前记号 | 后缀输出 | 运算符栈 |
| --- | --- | --- |
| `12` | `12` | 空 |
| `+` | `12` | `+` |
| `3` | `12 3` | `+` |
| `*` | `12 3` | `+ *` |
| `(` | `12 3` | `+ * (` |
| `4` | `12 3 4` | `+ * (` |
| `+` | `12 3 4` | `+ * ( +` |
| `5` | `12 3 4 5` | `+ * ( +` |
| `)` | `12 3 4 5 +` | `+ *` |
| `-` | `12 3 4 5 + * +` | `-` |
| `6` | `12 3 4 5 + * + 6` | `-` |
| `/` | `12 3 4 5 + * + 6` | `- /` |
| `2` | `12 3 4 5 + * + 6 2` | `- /` |
| 结束 | `12 3 4 5 + * + 6 2 / -` | 空 |

读到 `-` 时，栈顶的 `*` 优先级更高，下面的 `+` 与当前减号同级且应先结合，所以二者都先进入输出。

## 完整后缀求值函数

```cpp
ll evaluate_postfix(const vector<Token>& postfix) {
    stack<ll> values;
    int n = postfix.size() - 1;

    for (int i = 1; i <= n; i++) {
        Token current = postfix[i];

        if (current.is_number) {
            values.push(current.value);
            continue;
        }

        ll right = values.top();
        values.pop();

        ll left = values.top();
        values.pop();

        values.push(calculate(left, right, current.symbol));
    }

    return values.top();
}
```

对刚才得到的后缀表达式：

| 读入记号 | 操作后的数值栈（底到顶） |
| --- | --- |
| `12` | `12` |
| `3` | `12 3` |
| `4` | `12 3 4` |
| `5` | `12 3 4 5` |
| `+` | `12 3 9` |
| `*` | `12 27` |
| `+` | `39` |
| `6` | `39 6` |
| `2` | `39 6 2` |
| `/` | `39 3` |
| `-` | `36` |

合法后缀表达式处理完后恰好剩下一个值，它就是整棵表达式树根节点的结果。

## 正确性

中缀转后缀时，`postfix` 始终保存顺序已经确定的完整部分，`operators` 保存已经读到但还在等待右操作数、低优先级边界或右括号的运算符。

- 数值可以立即输出，因为它相对其他数值的顺序不变；
- 左括号阻止外部运算符进入内部子表达式；
- 右括号说明内部输入已经完整，因此内部运算符都可以输出；
- 新运算符出现时，栈顶更高优先级运算必须先完成；相同优先级按照左结合也必须先完成；
- 扫描结束后，剩余运算符不再受到后续记号影响，可以依次输出。

因此产生的后缀顺序与中缀表达式的优先级、结合方向和括号结构相同。

后缀求值时，进入每个记号以前，数值栈从底到顶保存已经完整扫描、但尚未被外层运算符组合的子表达式结果。数值建立一个新的结果；运算符取走最近完成的右、左子表达式，计算父节点并把它作为一个新结果压回。扫描完根表达式以后只剩根节点结果，所以求值正确。

## 时间与空间复杂度

分词只扫描输入字符一次。中缀转后缀时，每个数值记号输出一次，每个运算符最多压栈一次、弹栈一次；后缀求值又只处理每个记号一次。

设输入字符数为 $L$，记号数不超过 $L$，总时间复杂度是 $O(L)$。

中缀与后缀记号数组需要 $O(L)$ 空间。最坏情况下运算符栈和值栈也可能保存 $O(L)$ 个元素，因此总空间复杂度是 $O(L)$。

代码中的 `while` 嵌套在记号循环中，但同一个运算符只会从栈中弹出一次，不会导致平方复杂度。

## 完整代码

程序使用 `fgets` 读取一整行，使表达式中可以包含空格。输入长度不超过 $2\times10^5$ 个字符。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const int MAXL = 2e5 + 5;

char input[MAXL];

struct Token {
    bool is_number;
    ll value;
    char symbol;
};

bool is_space(char c) {
    return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}

vector<Token> tokenize(const string& expression) {
    vector<Token> tokens(1);
    int n = expression.size();

    for (int i = 0; i < n;) {
        if (is_space(expression[i])) {
            i++;
            continue;
        }

        if (expression[i] >= '0' && expression[i] <= '9') {
            ll value = 0;
            while (i < n && expression[i] >= '0' && expression[i] <= '9') {
                value = value * 10 + (expression[i] - '0');
                i++;
            }
            tokens.push_back({true, value, 0});
            continue;
        }

        tokens.push_back({false, 0, expression[i]});
        i++;
    }

    return tokens;
}

int precedence(char operation) {
    if (operation == '+' || operation == '-') {
        return 1;
    }
    return 2;
}

vector<Token> infix_to_postfix(const vector<Token>& infix) {
    vector<Token> postfix(1);
    stack<char> operators;
    int n = infix.size() - 1;

    for (int i = 1; i <= n; i++) {
        Token current = infix[i];

        if (current.is_number) {
            postfix.push_back(current);
            continue;
        }

        if (current.symbol == '(') {
            operators.push('(');
            continue;
        }

        if (current.symbol == ')') {
            while (operators.top() != '(') {
                postfix.push_back({false, 0, operators.top()});
                operators.pop();
            }
            operators.pop();
            continue;
        }

        char current_operation = current.symbol;
        while (!operators.empty() && operators.top() != '(' &&
               precedence(operators.top()) >= precedence(current_operation)) {
            postfix.push_back({false, 0, operators.top()});
            operators.pop();
        }
        operators.push(current_operation);
    }

    while (!operators.empty()) {
        postfix.push_back({false, 0, operators.top()});
        operators.pop();
    }

    return postfix;
}

ll calculate(ll left, ll right, char operation) {
    if (operation == '+') {
        return left + right;
    }
    if (operation == '-') {
        return left - right;
    }
    if (operation == '*') {
        return left * right;
    }
    return left / right;
}

ll evaluate_postfix(const vector<Token>& postfix) {
    stack<ll> values;
    int n = postfix.size() - 1;

    for (int i = 1; i <= n; i++) {
        Token current = postfix[i];

        if (current.is_number) {
            values.push(current.value);
            continue;
        }

        ll right = values.top();
        values.pop();

        ll left = values.top();
        values.pop();

        values.push(calculate(left, right, current.symbol));
    }

    return values.top();
}

void print_postfix(const vector<Token>& postfix) {
    int n = postfix.size() - 1;

    for (int i = 1; i <= n; i++) {
        if (i > 1) {
            printf(" ");
        }

        if (postfix[i].is_number) {
            printf("%lld", postfix[i].value);
        } else {
            printf("%c", postfix[i].symbol);
        }
    }
    printf("\n");
}

void solve() {
    fgets(input, MAXL, stdin);

    string expression = input;
    vector<Token> infix = tokenize(expression);
    vector<Token> postfix = infix_to_postfix(infix);

    print_postfix(postfix);
    printf("%lld\n", evaluate_postfix(postfix));
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
12 + 3 * (4 + 5) - 6 / 2
```

输出：

```text
12 3 4 5 + * + 6 2 / -
36
```

## 常见错误

### 把多位整数拆成单个数字

字符是输入单位，不一定是表达式记号。分词时必须把连续数字合成一个整数，后缀输出也用空格分隔记号，避免 `12` 与 `1 2` 混淆。

### 没有写清一元负号

当前 `-` 只表示二元减法。直接输入 `-3` 会让求值栈缺少左操作数。扩展语法时必须在分词或语法分析阶段根据上下文识别一元运算符，并为它规定独立优先级和参数数量。

### 右括号输出到后缀

括号只编码中缀结构，不是实际运算符。右括号触发弹出内部运算符，左括号随后被删除，二者都不进入后缀输出。

### 同级运算符没有先弹出

加减乘除都是左结合。读到新运算符时应弹出栈中优先级大于或等于它的运算符，不能只处理严格大于。

### 运算符越过左括号

比较优先级前必须先确认栈顶不是 `(`。括号内部运算不能与外部运算符混在同一优先级链中。

### 颠倒左右操作数

后缀求值第一次弹出右操作数，第二次才是左操作数。使用明确的 `left`、`right` 名称，不要直接对两次 `top()` 写一个长表达式。

### 忽略除零与溢出

栈与转换过程不会自动保证算术安全。是否除以零、字面量解析和中间结果是否超出 64 位整数，都必须由题目范围或额外检查保证。

### 只检查最终数值

若只比较加法样例，左右操作数颠倒、结合方向错误都可能被交换律掩盖。至少使用减法、除法、同级连续运算、优先级和嵌套括号分别测试。

## 基础练习

1. 为 `(7 - 2) * (3 + 4)` 画表达式树，并写出前缀、中缀、后缀形式。
2. 手动用数值栈计算 `8 3 - 2 -` 与 `8 3 2 - -`，比较左结合和右结合结果。
3. 转换 `1 + 2 * 3`、`(1 + 2) * 3`、`20 / 5 / 2` 和 `20 / (5 / 2)`。
4. 测试多位整数、深层括号、冗余括号、空白和最终结果为负数的表达式。
5. 实现从右向左扫描的前缀求值函数，与后缀结果比较。
6. 从后缀记号建立表达式树：数值建立叶节点，运算符弹出右、左子树并建立父节点。
7. 随机生成小表达式树，分别递归求值和输出中缀表达式，再与完整程序对拍。
8. 在明确语法以后增加取模运算符 `%`，说明它的优先级、结合方向、除数限制和代码修改位置。

## 需要记住什么

1. 表达式树的叶节点、内部节点和左右子树分别表示什么？
2. 前缀、中缀、后缀分别对应表达式树的什么访问顺序？
3. 怎样从完全加括号的中缀表达式理解前缀和后缀形式？
4. 为什么后缀表达式从左向右扫描时适合使用数值栈？
5. 后缀求值时左右操作数分别是第几次弹出的值？
6. 为什么多位整数要求先分词，不能逐字符直接求值？
7. 中缀转后缀时，后缀输出和运算符栈分别保存什么？
8. 数值、左括号、右括号和普通运算符分别怎样处理？
9. 为什么当前运算符到来时，要弹出优先级大于或等于它的栈顶运算符？
10. 为什么转换与求值都是线性时间，即使代码中包含嵌套 `while`？
11. 当前完整代码明确不支持哪些语法？整数除法与数值范围遵循什么约定？

函数调用、数组下标、变量、浮点数、幂运算、右结合运算符、一元正负号和完整语法错误诊断都会增加新的记号类型或语法规则。它们应当在题目真正需要时逐项加入，不能假装基础四则运算代码已经自动支持。
