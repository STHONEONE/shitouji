# NPC素材与运行数据

source/中八张无损透明WebP从用户角色包解出；宝玉、宝钗walk PNG由内置image_gen以现有人物动作图补帧，提示词见provenance.json。母图和格式检查见docs/implementation/npc-art-review.md。

art.json保存源文件、原生帧矩形和游戏内人物高度。运行时只等比提取独立人物，不绘制整张角色卡、背景或大幅立绘。朝向为四向，移动为八方向分轴碰撞。宝玉左向暂使用两种有效步态循环；没有把朝右帧误标成朝左帧。

内容位于src/data/npc-content.json，回目出处列在docs/implementation/npc-implementation-and-sources.md。台词摘句与情境转述不同，不能把转述包装成曹雪芹原句；游戏作息是循环春日编排。

系统位于src/features/21-resident-npcs.js，NPC/角色/家具统一按脚底基座排序。人物进度、相处时间、在场位置、话题和补读记录保存在journey.extensions.npcs中，与原存档共存。

不开放新院落，不加入人物操纵切换。测试结果见reports/qa/npc-qa.json、reports/qa/npc-movement-qa.json。
