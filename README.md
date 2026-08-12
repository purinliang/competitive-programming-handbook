# Competitive Programming Handbook

这是一个中文算法竞赛一体化 handbook 仓库，用来长期整理 Codeforces、ICPC、CCPC、NOI、NOIP、CSP-J/S 相关的知识、模板、复盘、教学材料和个人记录。

核心目标：

- 系统整理算法竞赛知识，用于复习、讲解和向初高中生教学。
- 保存训练、复盘、回忆录和其他算法竞赛相关事务。
- 维护可复用 C++17 模板库，并配套验证和提交工作流。
- 支持“口述思路、AI 协助整理和实现”的工作方式，把重点放在 idea、复杂度可行性和可复用模板上。
- 优先服务已有 C++ 基础、准备初赛/复赛复习和提高的读者；不以从零入门教程为主要目标。

## 目录结构

```text
notes/                  知识库、训练计划、复盘、教学材料和个人记录
templates/              纯 C++17 模板代码库，以及配套的 OJ 验证入口
tools/diagrams/         结构化输入生成数据结构示意图的工具
workspace/              临时题目接口、实验代码和提交代码工作区
```

各目录只承担一种稳定职责，内容增长后继续在对应目录内部按模块拆分。

`notes/` 负责保存知识库、学习路线、训练计划、复盘、教学材料、错误经验和回忆录。知识正文按功能或领域存放；`CATALOG.md` 维护模块目录，`LEARNING-PATH.md` 维护教学顺序，两者指向同一份正文。Markdown 和后续 TeX 编译应引用同一套图片资产。

`templates/` 负责模板复用和 OJ 验证。模板代码中只保留必要中文注释，不在模板文件里讲原理。

`workspace/` 是本地工作区，用来放临时题目接口、实验代码、提交代码和其他不适合沉淀进 `templates/` 的过程文件。这里的内容默认不提交到 Git，只保留目录占位文件。提交代码优先由 agent 根据模板改写生成，不强制维护 bundler 或内联工具。

`tools/diagrams/` 负责图示工具。图示源文件、schema 和渲染器放这里；可长期引用的图片资产放在 `notes/` 内部，临时生成图片放在 ignored 输出目录。

## C++ 标准

- 语言标准：C++17。
- 默认编译参数：`-std=c++17 -O2 -Wall -Wextra`。
- 格式化工具：`clang-format`，配置见 `.clang-format`。这是初版格式，后续可以继续调整。
- 代码风格：竞赛风，默认使用 `#include <bits/stdc++.h>` 和 `using namespace std;`。
- 输入输出：默认使用 `scanf` / `printf` 风格，不使用 `ios::sync_with_stdio(false);` 和 `cin.tie(nullptr);`。
- 常用别名：默认保留 `typedef long long ll;`。其他别名只在确实常用时加入，不为了凑框架提前增加。
- 注释语言：中文。
- 函数、变量、类型命名：使用清晰的英文命名，避免拼音和无意义缩写。

## 基础工作流

根目录 `Makefile` 提供最小本地工作流：

```bash
make init A
make run A
make format A
make format templates/base.cpp
```

`make init A` 会用 `templates/base.cpp` 重新创建 `workspace/A.cpp`，并把 `workspace/A.in`、`workspace/A.out` 清空。`make run A` 会编译 `workspace/A.cpp`，把 `workspace/A.in` 重定向为标准输入，并把标准输出写入 `workspace/A.out`。临时二进制放在 `workspace/.build/`。

`A`、`B` 这种单字母参数是 `workspace/A.cpp`、`workspace/B.cpp` 的简写，不需要写 `.cpp` 后缀。`run` 和 `init` 只用于 `workspace/` 下的题目文件；`format` 同时支持题号简写和全路径，例如 `make format A`、`make format templates/base.cpp`。

`templates/base.cpp` 是当前基础代码框架。后续具体题目可以先复制到 `workspace/`，再按题意补输入输出和胶水代码。

## 笔记约定

Markdown 手稿以 Typora 友好为优先：普通 Markdown、代码块、LaTeX 公式块和简单表格。后续需要 TeX 版本时，再从 Markdown 手稿整理。

本仓库首先是 handbook，不是从零开始的 tutorial。笔记按功能或领域组织，每篇文章尽量自洽，允许收录暂时用不到但值得了解的知识。

教程和模板的默认下标、区间与容量规则见 [学习路线中的约定](notes/LEARNING-PATH.md#下标与区间约定)。

## 模板验证

`templates/` 下的竞赛模板统一使用 `.cpp`。每份模板都是可直接复制、编译和改造的完整竞赛代码，不维护 `.hpp` 形式的 header-only 竞赛库。模板与验证题可以是同一份 `.cpp`：保留简短的题目输入输出即可直接提交验证，换题时再修改 `main` 中的胶水代码。

模板代码继续统一使用 `#include <bits/stdc++.h>`、`using namespace std;` 和 `typedef long long ll;`。教程中为了解释步骤可以使用更长、更明确的命名；进入 `templates/` 的最终版本可以改用竞赛中稳定且常见的紧凑写法。

验证入口的通过标准就是对应 OJ AC。每个验证入口至少保存：

- 对应 OJ 题目链接
- 题目特有的输入输出
- 模板调用方式
- 相对模板的修改、特殊之处或解题注释

验证入口的代码画风应和 `templates/` 保持一致。如果模板中的命名、注释或写法更新，相关验证入口也应同步更新。

模板设计不追求为了覆盖所有变体而过度抽象。常见形态优先沉淀为简洁模板；题目特有维护信息、路径代价变体、特殊聚合方式等，可以先在验证入口或工作区中由 agent 辅助改写。只有当多个题目反复出现稳定共性时，再考虑把它抽回模板。

验证入口命名使用 Linux 友好的小写短横线形式，例如 `luogu-p1000.cpp`、`codeforces-1250a.cpp`。

未来如果需要验证速度或边界，可以再加入数据生成器、对拍脚本或接入成熟工具。

## 图示工具

`tools/diagrams/` 保存自研图示工具。`cp-diagram/v1` 使用 YAML 描述单行数组、箭头和范围标记；`cp-diagram/v2` 草案增加多行数组、普通图、普通树、二叉树和树状数组。渲染器由 Python、PyYAML 和 rough-py 稳定生成使用手写印刷体与精确几何线条的 SVG。YAML 只表达内容和结构，坐标、线宽、字体、具体色值和随机种子由统一主题控制。

可长期引用的 SVG 放在 `notes/assets/`，临时预览放在已忽略的 `tools/diagrams/out/`。当前已经用于前缀和、普通图、树、二叉树、线段树和树状数组等教程图示。

Agent 工作约定见 `AGENTS.md`。
