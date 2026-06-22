# Asset Pipeline

## 当前落地资产

- `public/assets/title/fog-remembers-key-art.png`
- `public/assets/title/fog-remembers-grain.png`
- `public/assets/ui/recall-sigil.png`

这些资产已接入标题页 CSS，可以直接随 Next.js 静态托管。

## AI 生图安全规则

不要把 API key 写进仓库。需要调用外部生图服务时，在本机 PowerShell 设置环境变量：

```powershell
$env:FOG_IMAGE_API_KEY = "..."
$env:FOG_IMAGE_BASE_URL = "https://example.com"
$env:FOG_IMAGE_MODEL = "gpt-image-2"
```

如果使用另一个兼容服务，改成对应的 `BASE_URL` 和 `MODEL`。密钥只应存在于当前 shell 环境或系统安全凭据中。

## 主视觉提示词

```text
Use case: stylized-concept
Asset type: game title screen key art
Primary request: original psychological horror game key art for "The Fog Remembers / 雾会记得"
Scene/backdrop: a deserted folded harbor town street at night, old clinic silhouettes, leaning street lamps, dense remembered fog
Subject: one exhausted adult survivor seen from behind, holding a weak flashlight cone into the fog
Style/medium: painterly raster key art, cinematic 2D game title background, not photorealistic
Composition/framing: wide 16:9, central figure low-middle, enough negative space above for title text
Lighting/mood: weak warm flashlight, cold green-gray fog, small rust-red traces, oppressive but quiet
Color palette: charcoal black, fog gray, oxidized green, muted amber, restrained rust red
Text: no text in image
Constraints: original IP, no recognizable external franchise references, no logos, no watermark
Avoid: copyrighted horror characters, nurses, pyramid helmets, exact franchise locations, readable text
```

## Logo / 印记提示词

```text
Use case: logo-brand
Asset type: transparent UI sigil for horror game
Primary request: a simple occult recall mark for "The Fog Remembers"
Style/medium: vector-friendly painted emblem, circular sigil, worn ink and rust
Composition/framing: centered square icon, strong silhouette, readable at 64px
Color palette: aged bone, tarnished amber, dried rust
Text: no text
Constraints: original mark, no religious trademark symbols, no watermark
```

## 接入规范

- 标题主视觉放在 `public/assets/title`。
- UI 小图标放在 `public/assets/ui`。
- 怪物概念图放在 `public/assets/monsters`。
- 文件名使用小写短横线。
- 新资产接入后必须运行 `npm run build`，并用浏览器检查桌面和移动端布局。
