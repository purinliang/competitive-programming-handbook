# 泛洪算法（Flood Fill）

> 最近修订：2026-08-17 01:00 +10:00（未审阅）

一张网格中，若相邻的可通行格子属于同一区域，我们常要从某个起点找出整片区域：计算面积、重新着色、判断能否到达边界，或者统计有多少块陆地。

这种“从一个格子向所有相邻同类格子扩散”的问题模型称为**泛洪算法**（Flood Fill）。它不是与 DFS、BFS 并列的第三种遍历方式；它是把网格看成图，再使用 DFS 或 BFS 处理一个连通区域。

## 网格是一张隐式图

对一个 `n` 行 `m` 列的网格：

- 每个可处理格子 `(row, column)` 是一个点；
- 两个格子满足题目规定的相邻关系时，它们之间有边；
- 墙、障碍或不同颜色决定哪些点不能继续扩展。

我们不必显式建立 `n * m` 个邻接表。一个格子的邻居可以直接由坐标计算，因此这是用规则隐式表示的图。

例如四方向相邻只包含上、右、下、左：

```cpp
int dr[5] = {0, -1, 0, 1, 0};
int dc[5] = {0, 0, 1, 0, -1};
```

从 `(row, column)` 出发，第 `direction` 个邻格是：

```cpp
int next_row = row + dr[direction];
int next_column = column + dc[direction];
```

方向数组的第 `0` 格留空，真实方向使用 `1..4`。

## 四方向与八方向

四方向只允许共享一条边的格子相邻：

```text
  ↑
← □ →
  ↓
```

八方向还允许四个对角格：

```text
↖ ↑ ↗
← □ →
↙ ↓ ↘
```

二者会得到不同连通区域。例如：

```text
.#
#.
```

两个 `.` 在四方向下不连通，在八方向下通过对角线连通。

题目必须明确相邻规则。本书不会把“网格连通”默认成八方向；没有额外说明时，竞赛题更常使用四方向，但仍应以题意为准。

## 能否进入一个格子

从当前格子扩展到 `(next_row, next_column)` 以前，至少检查三件事。

### 没有越界

```cpp
if (next_row < 1 || next_row > n ||
    next_column < 1 || next_column > m) {
    continue;
}
```

边界检查必须发生在读取 `grid[next_row][next_column]` 以前，否则已经访问了非法位置。

### 满足区域条件

假设 `.` 是可通行格子、`#` 是墙：

```cpp
if (grid[next_row][next_column] == '#') {
    continue;
}
```

图片填色问题则可能要求邻格颜色等于起点原颜色。区域条件来自题意，不是 Flood Fill 固定只能处理 `.`。

### 尚未访问

```cpp
if (visited[next_row][next_column]) {
    continue;
}
```

网格中的相邻关系通常是双向的，也会形成大量环。不记录访问状态会让搜索在相邻格子间反复来回。

## 使用 BFS 扩散

从起点 `(start_row, start_column)` 开始，先标记并入队：

```cpp
queue<pair<int, int>> q;

visited[start_row][start_column] = 1;
q.push({start_row, start_column});
```

每次取出一个格子，并检查四个方向：

```cpp
while (!q.empty()) {
    auto [row, column] = q.front();
    q.pop();

    for (int direction = 1; direction <= 4; direction++) {
        int next_row = row + dr[direction];
        int next_column = column + dc[direction];

        // 检查边界、区域条件与访问状态
    }
}
```

一个邻格通过全部检查后，要在入队时立即标记：

```cpp
visited[next_row][next_column] = 1;
q.push({next_row, next_column});
```

这与一般图 BFS 相同。若等到出队才标记，同一个格子可能被多个邻格重复放入队列。

## 使用 DFS 扩散

同一个相邻规则也可以写成 DFS：

```cpp
void dfs(int row, int column) {
    visited[row][column] = 1;

    for (int direction = 1; direction <= 4; direction++) {
        int next_row = row + dr[direction];
        int next_column = column + dc[direction];

        if (!can_enter(next_row, next_column)) {
            continue;
        }
        dfs(next_row, next_column);
    }
}
```

递归 DFS 代码较短，但一个狭长区域可能让递归深度达到 $O(nm)$，超出调用栈容量。网格规模较大时，BFS 或显式栈 DFS 更安全。

DFS 与 BFS 都会找出同一个连通区域。若只求区域大小、着色或可达性，选择哪一种通常不影响答案；若要求最少移动步数，应使用 BFS 的分层距离性质。

## 标记、计数与重新着色

每个格子第一次进入搜索时，可以同时完成题目所需操作。

计算区域面积：

```cpp
area++;
```

给区域编号：

```cpp
component_id[row][column] = id;
```

重新着色：

```cpp
grid[row][column] = new_color;
```

如果新颜色与旧颜色不同，直接改色本身就可以充当访问标记：以后只继续进入旧颜色格子。但若新旧颜色可能相同，仍需要独立的 `visited`，否则无法区分是否访问过。

## 从一个区域到全部区域

一次 Flood Fill 只处理起点所在区域。若要统计整个网格的连通区域数量，就按行列检查全部格子：

```cpp
for (int row = 1; row <= n; row++) {
    for (int column = 1; column <= m; column++) {
        if (grid[row][column] == '.' &&
            !visited[row][column]) {
            component_count++;
            flood_fill(row, column);
        }
    }
}
```

这与一般无向图统计[连通分量](connected-components.md)完全相同：每次遇到尚未分类的可通行格，就从它扩散并标记整个新区域。

## 复杂度

每个格子至多第一次访问时入队或进入 DFS 一次，每次只检查固定数量的方向。因此：

- 处理一个区域的时间与该区域格子数成正比；
- 扫描并处理整个网格的时间是 $O(nm)$；
- `visited` 与队列最坏使用 $O(nm)$ 空间。

四方向与八方向只改变常数，不改变渐进复杂度。

## 完整代码

下面的程序读入一个由 `.` 和 `#` 组成的网格，以及一个起点，输出从起点通过四方向能够到达的 `.` 格子数量。

每行读入后在开头补一个空格，让有效列自然使用 `1..m`：

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<string> grid;
vector<vector<int>> visited;

int dr[5] = {0, -1, 0, 1, 0};
int dc[5] = {0, 0, 1, 0, -1};

bool inside(int row, int column) {
    return 1 <= row && row <= n &&
           1 <= column && column <= m;
}

int flood_fill(int start_row, int start_column) {
    if (!inside(start_row, start_column) ||
        grid[start_row][start_column] == '#') {
        return 0;
    }

    queue<pair<int, int>> q;
    int area = 1;

    visited[start_row][start_column] = 1;
    q.push({start_row, start_column});

    while (!q.empty()) {
        auto [row, column] = q.front();
        q.pop();

        for (int direction = 1; direction <= 4; direction++) {
            int next_row = row + dr[direction];
            int next_column = column + dc[direction];

            if (!inside(next_row, next_column)) {
                continue;
            }
            if (grid[next_row][next_column] == '#') {
                continue;
            }
            if (visited[next_row][next_column]) {
                continue;
            }

            visited[next_row][next_column] = 1;
            area++;
            q.push({next_row, next_column});
        }
    }

    return area;
}

void solve() {
    cin >> n >> m;

    grid.assign(n + 5, "");
    visited.assign(n + 5, vector<int>(m + 5, 0));

    for (int row = 1; row <= n; row++) {
        string line;
        cin >> line;
        grid[row] = " " + line;
    }

    int start_row;
    int start_column;
    cin >> start_row >> start_column;

    cout << flood_fill(start_row, start_column) << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
4 5
..#..
.#...
...##
##...
1 1
```

输出：

```text
14
```

## 需要记住什么

1. 网格怎样隐式表示成一张图？
2. 四方向与八方向会怎样改变连通关系？
3. 读取邻格以前为什么必须先检查边界？
4. 为什么 BFS 要在入队时标记格子？
5. Flood Fill 为什么不是独立于 DFS、BFS 的第三种遍历算法？
6. 递归 DFS 处理巨大狭长网格可能遇到什么问题？
7. 怎样从处理一个区域扩展到统计全部区域？
