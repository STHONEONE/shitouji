# 第二批检查：地板、墙体和原床

已解压，7张PNG全部具有真实Alpha。尚未覆盖正式游戏。

床为332×279，与上一份原床文件逐字节相同，可复用，不必重画。

## 需要修正的不是透明通道，而是拼接位置与视角

- floor.png虽然画布为1672×941，实际房间轮廓有顶部凸出、底部入口等变化，与批准母图的墙脚、入口和台阶位置不重合。请按母图原位补全地面，不重新设计房间轮廓。
- wall-north.png增加了中央大块留白和两侧成组窗，窗柱布局与原图不同。请回到原图墙窗位置。
- wall-west.png/wall-east.png是带横向长墙的转角立面，不是原图窄侧墙的微倾俯视形状；不能等比缩放后无缝接回原房间。
- 两块南墙是单独放大的立面，需按母图入口左右边界绘制；保留整墙精灵，不拆屋顶和墙身。

请直接使用以下母图，整张1672×941画布按原位交墙体透明图（不裁切也可以），这样不用猜placement。每张仅保留对应墙体，其他位置透明；干净地板也按同一画布原位交付。不要独立生成不同视角的新墙。

![批准母图](<../../../../assets/scenes/xiaoxiang/references/xiaoxiang-indoor-wide.png>)

待修参考：ground/floor.png

![ground/floor.png](<ground/floor.png>)

待修参考：occluders/wall-north.png

![occluders/wall-north.png](<occluders/wall-north.png>)

待修参考：occluders/wall-west.png

![occluders/wall-west.png](<occluders/wall-west.png>)

待修参考：occluders/wall-south-left.png

![occluders/wall-south-left.png](<occluders/wall-south-left.png>)
