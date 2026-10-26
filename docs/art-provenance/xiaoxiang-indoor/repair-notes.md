> 状态更新：已按scene.json接入原游戏并完成内室浏览器验证。下文为初修时的历史记录，入口墙现通过裁切框与等比尺寸完成对位；详情以README.md和scene.json为准。

# 本轮直接修图记录

使用内置 image_gen 编辑，不再要求用户转交这些细节修补。唯一参考是项目已确认的潇湘馆内室母图。

- floor-v2.png：清除家具与地毯、补足木地板、保留暖色窗影，修正第一稿顶部凸出。原始地面参考仍保留。
- wall-north-v1.png：去除床、柜、家具及地板，补回素墙，恢复中央窗带。
- wall-west-v1.png、wall-east-v1.png：去掉原交付稿的大幅转角立面，改为参考中的狭长侧墙。
- wall-south-left-v2.png：入口左墙第二稿，修正第一稿被放大问题。
- wall-south-right-v1-draft.png：入口右墙初稿。

8张版本图片均检查了Alpha，有真实透明像素。生成器没有完全遵守像素坐标：入口墙仍需要进一步对位，侧墙基线和墙角拼接也尚未通过联合验收。因此这些是项目内的修补素材，不代表已经完成游戏替换，不能直接整张原位叠加就宣称完成。

后续由Codex继续处理入口墙与联合对位；原版蓝白床复用332×279透明素材。修补提示词、工具方式保存在repair-session.json，尺寸和透明检查在alpha-check.json。

![修补地面第二稿](<../../../assets/scenes/xiaoxiang/indoor/textures/floor.png>)

![北墙修补稿](<../../../assets/scenes/xiaoxiang/indoor/textures/wall-north.png>)
