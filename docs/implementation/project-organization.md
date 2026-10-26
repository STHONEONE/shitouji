# 项目整理与公开仓库发布

日期：2026-10-26。用户已批准盘点清单，并授权Codex自行决定清理项、公开整个项目及归档内容。

## 备份和整理

整理前完整复制到`D:/AIcoding/red-dream-backups/snapshot-20261026-121354/red-dream`，400个文件逐项SHA256校验通过；备份清单位于同级`backup-manifest.json`。该备份在项目外，未递归复制进仓库。

391个原项目文件全部保留：334项移动/改名，26项只移入`_archive/20261026/`，31项保持路径。原始ZIP不改内部字节；两个派生导出包按新路径重打包。无永久删除。

归档包含原清单20项，以及6个明确依赖旧入口/旧布局或断言禁止NPC的旧浏览器脚本。原始交付、母图、尚未完成的庭院稿、独立导出包、历史证据均保留并分类。身份不明的原图使用参考编号和原UUID片段，未擅自认定人物身份。

活跃文件按assets/art-source/exports/tools/reports/docs分类。项目根目录及现有中文HTML入口保留，以兼容Codex目录与浏览器本地存档。归档按原相对路径留存，允许旧名。

构建使用`src/data/asset-files.json`维护资源相对路径；场景和NPC配置、源文件、工具、文档链接、导出包manifest同步更新。Python工具搬迁后改按仓库根目录定位；当前浏览器脚本使用公共runtime发现Chrome/Playwright，支持从独立克隆目录验收。

实施映射：`docs/project-audit/execution-map.json`。审批前盘点文档保留为历史快照，不因整理覆盖原证据。

## 当前已通过检查

- `reports/qa/organization-integrity.json`：391个原文件均存在；60个内嵌图片键及源图片字节不变；24份游戏脚本正文不变；3份发布配置与源文件一致；活跃文档相对链接无断链。
- 两个导出ZIP分别含79个、13个文件，与整理后的散文件逐项一致，人物manifest路径存在。
- `reports/qa/organization-runtime.json`：桌面Chrome实测三住所庭院/内室共6场景键盘行走，60个图片键全部加载，页面和控制台无运行错误、无失败资源请求。
- 在整理前备份HTML中制作的存档，能在整理后回读日期、时辰、笔记、原著小事与10位NPC状态。
- 通过真实E键/菜单触发抚琴；AudioContext running、48000Hz、有28个合成声部，收曲后活动完成。
- NPC功能、移动、缺席补读、20段小事、刷新存档及内室坐躺/房门/通路/三住所切换回归通过；见npc-qa.json、npc-movement-qa.json及本次命令输出。

自动化用程序准备测试站位，再发真实键盘或按钮操作，并非人工长时间游玩。只验收电脑浏览器。

## GitHub

公开仓库：<https://github.com/STHONEONE/shitouji>。创建“石头记”时GitHub自动归一化成“-”，已立即将该新仓库改为用户指定的备用名`shitouji`。

当前单文件HTML超过100MiB，使用Git LFS；原始素材、源码、归档、导出包、报告均纳入Git。下载后应取得LFS实体而非三行指针，使用说明见根目录README。

## 远端验收完成

整理提交`9e1fb63bb655245029a56e69c2d04dd12cd5f1b6`已推送到main。通过未登录网页和GitHub元数据确认仓库为Public。

重新从GitHub克隆到独立`.validation/repository`，427个已提交文件全部存在，Git索引逐项一致。LFS下载得到116,623,864字节的真实HTML，SHA256为`8e61fd9bda65625b25ac7a420e379d56273fcbf43750a1c96c917f6a60bad998`，与本地已验收版本一致。

Chrome直接打开克隆版本，题页/新游戏启动正常，60个图片键加载，人物数据含10人，站位合法，控制台无错误。证据见`reports/qa/repository-clone.json`、`reports/qa/repository-startup.json`。

根据用户最新决定，不再对克隆版本重复整套六场景测试；画面、遮挡和操作手感留待用户人工验收。当前仅公开开发中的源码/素材/归档仓库，没有发布试玩Release或下载包。此前的本地六场景、琴音、存档与NPC回归结果仍有效，且克隆HTML字节与该版本完全一致。

后续提交仅同步上述验收记录、开发中状态和工具说明，不改变游戏源码或HTML内容。
