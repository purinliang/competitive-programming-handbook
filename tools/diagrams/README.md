# 数据结构图示工具

这个工具把严格校验的 YAML 渲染成 handbook 使用的 SVG。`cp-diagram/v1` 支持单行数组、格子强调、上下箭头和范围标记；`cp-diagram/v2` 草案增加对齐的多行数组、普通图、普通树、二叉树和树状数组布局。

## 技术路线

```text
YAML
  -> PyYAML 安全解析
  -> 严格 schema 校验
  -> 按图形类型选择确定性布局
  -> rough-py 绘制精确 SVG 几何线条
  -> 手写印刷体 SVG 文字
  -> SVG
```

选择 rough-py 而不是 Matplotlib 的原因：

- rough-py 直接生成 SVG 几何图元，并由统一主题把几何扰动固定为 `0`。
- 可以固定随机种子，使相同输入得到稳定输出。
- 线条的 `strokeWidth`、`roughness` 和颜色可以由一个主题集中控制。
- 文字可以保留为正常 SVG 文本，使用手写印刷体，但不跟随几何线条抖动。
- 数组格、箭头落点、图节点、树层级和边标签仍由我们自己的布局器精确计算。

Matplotlib 更适合坐标轴和统计图；`plt.xkcd()` 会修改一组全局绘图参数，并依赖额外字体获得完整效果，不适合作为这套离散结构图的核心布局层。

## 安装

需要 Python 3.10 或更高版本：

```bash
python -m pip install -r tools/diagrams/requirements.txt
```

当前依赖：

- `PyYAML`：读取 YAML。
- `rough==1.6`：生成 SVG 几何图元。

## 使用

在 `tools/diagrams/` 目录运行：

```bash
python -m cp_diagrams validate examples/prefix-sum-range.yaml
python -m cp_diagrams render examples/prefix-sum-range.yaml \
    --output out/prefix-sum-range.svg
```

默认不覆盖已有文件，需要时显式添加 `--force`：

```bash
python -m cp_diagrams render examples/prefix-sum-range.yaml \
    --output out/prefix-sum-range.svg \
    --force
```

完整 YAML 约定见 [SCHEMA-v1.md](SCHEMA-v1.md) 和 [SCHEMA-v2.md](SCHEMA-v2.md)。

## v1 示例

- `examples/prefix-sum-range.yaml`：原数组上的闭区间范围标记。
- `examples/prefix-sum-boundaries.yaml`：`prefix[r]` 与 `prefix[l - 1]` 的上方箭头。
- `examples/array-two-arrows.yaml`：两个不同长度的上方箭头均分同一个格子。
- `examples/array-range-labels.yaml`：同图比较长、短范围 label 的两种布局。

## v2 示例

- `examples/prefix-sum-rows.yaml`：原数组与前缀和数组上下对齐。
- `examples/prefix-sum-projection.yaml`：长度 11 的前缀和数组向下投影到虚线原数组，只在原数组显示下标。
- `examples/graph-undirected-weighted.yaml`：同时显示点编号、点权和边权的无向图。
- `examples/graph-directed.yaml`：边权位于斜边上侧的有向图。
- `examples/graph-self-loop-annotations.yaml`：自环、红色回路和蓝色路径 annotation。
- `examples/tree-rooted.yaml`：按子树宽度分配空间的普通有根树。
- `examples/segment-tree.yaml`：长度 11 的区间宽度线段树，节点宽度等于覆盖跨度，并把叶节点投影到虚线原数组。
- `examples/fenwick-tree.yaml`：长度 11 的区间宽度树状数组，只在虚线原数组显示一套下标。

## 代码结构

```text
tools/diagrams/
  cp_diagrams/
    common/               主题、几何、字体测量和 SVG Canvas
    models/               与 YAML、SVG 无关的语义模型
    schema/               公共校验及 v1、v2 解析器
    layouts/              只计算坐标和尺寸的布局算法
    renderers/            按数组、图、树、区间树划分的渲染器
    __main__.py
    cli.py
    render.py             稳定的类型分发与文件输出门面
  examples/
  tests/
  out/                  本地生成，Git 忽略
  requirements.txt
```

`schema` 只负责把作者输入变成经过校验的语义模型；布局模块只计算几何关系；各类渲染器通过公共 Canvas 和主题生成 SVG。`render.py` 保留为稳定门面，不承载具体图形实现。YAML 不直接描述坐标、字体、线宽和具体颜色值。数组格与节点保持透明，整张 SVG 可以通过顶层 `background` 选择透明或白色背景。

文字优先使用本机的 `Comic Neue`，中文回退到 `AR PL KaitiM GB`，再回退到通用中文字体。几何线条的 `roughness`、`bowing` 和随机偏移全部为 `0`，因此圆形节点是精确正圆，矩形和直线也没有风格差异。

## 全局视觉主题

字体、字号、线宽、虚线节奏和具体色值都只在 `common/theme.py` 定义，YAML 不能逐图覆盖：

- 字体栈：`Comic Neue` → `AR PL KaitiM GB` → `Noto Sans CJK SC` → `Microsoft YaHei` → `sans-serif`。
- 主要 value：`20px`；index、数组名和节点辅助文字：`12px`；annotation label 与节点 field：`16px`。
- 基础几何笔画：`2px`；annotation 强调笔画：`2.5px`，即基础笔画的 `1.25` 倍。
- 虚线节奏：`7px 5px`，仍复用基础笔画宽度与颜色。
- 对齐投影格间距：格宽的 `0.25`；实线派生格和虚线原数组格共享同一列距。
- 派生层到原数组的垂直净空：`54px`，与树的标准层间净空一致。
- 全局 palette：背景白、基础黑、强调红、辅助蓝和辅助绿。YAML 只选择语义色名，不保存 CSS 色值。

未来的节点背景只提供白色和深灰色两种状态，并分别固定使用深灰色和白色文字；不会开放任意节点背景色。现有 palette 中的红、蓝、绿只用于兼容旧 schema 的线条和算法强调。

数组格和区间宽度树的单点格以全局 value 字号、内边距和最小格宽共同确定。区间宽度节点从首格左边界延伸到末格右边界，覆盖内部的 `0.25` 格宽间距；这条规则是该布局特有的几何语义，其颜色、笔画和文字层级仍复用全局主题。图宽随元素数量自然增长，不为了固定版面压缩字号、格宽或间距。

## 测试

```bash
cd tools/diagrams
python -m unittest discover -s tests -v
```

测试至少检查：

- 合法和非法 YAML。
- 未知字段与自定义颜色被拒绝。
- 下标模式和标记端点解析正确。
- 相同输入连续渲染得到完全相同的 SVG。
- 全部示例与提交的 golden SVG 逐字节保持一致。
- CLI、旧公开导入路径和覆盖保护行为保持兼容。
- SVG 保留数组值和 label 文本。
- 多行数组共享列坐标和固定行距。
- 图布局固定、节点不相撞、斜边 value 贴近上侧，外部编号避开边端口。
- 二叉树左右对称且分叉避开区间，Fenwick 节点按 lowbit 分层，并用避开下标的虚线投影对齐原数组。
- 圆形与正方形共享数组字号和尺寸规则，自环与 path annotation 正确叠放。

## 后续范围

v2 先审核节点编号与值的文字层级、普通图自动布局、树层级、边权位置、自环和 path annotation。稳定后再增加多行数组 annotation、多重边和多帧步骤图。图示工具保持 SVG-only，不规划 PNG 输出。
