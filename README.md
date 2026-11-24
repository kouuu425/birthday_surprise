# birthday_surprise

誕生日の謎解きページ。React + Vite + TypeScript で作り、GitHub Pages で公開する。

| ページ | URL | 内容 |
|---|---|---|
| クロスワード | `/birthday_surprise/` | ディナーのあとに解く。答えはプレゼントの場所 |
| 暗号（ルリイロ） | `/birthday_surprise/ruriiro/` | ランチのあとに解く。答えは夜のお店の名前 |

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー（保存するとすぐ画面に反映される） |
| `npm run dev -- --host` | 同じ Wi-Fi のスマホから確認したいとき |
| `npm run check` | パズルと暗号の整合性チェック（中身を変えたら必ず実行） |
| `npm run build` | 本番用ファイルを `dist/` に出力 |
| `npm run preview` | ビルド結果をローカルで確認 |

## ファイル構成

```
src/
  lib/puzzle.ts        ← パズルの中身（カギの文言・答え・名前）。主にここを編集
  lib/crossword.ts     ← 単語の定義から盤面・カギ番号を組み立てる
  lib/kana.ts          ← 入力のゆれを吸収（ひらがな→カタカナ、ッ→ツ など）
  components/
    Grid.tsx           ← マス目
    AnswerPanel.tsx    ← 画面下の入力欄
    ClearOverlay.tsx   ← クリア演出
    StartScreen.tsx    ← 封筒のスタート画面
    FinalPanel.tsx     ← 最終問題の入力欄
  App.tsx              ← 全体の組み立てと状態（どのカギが解けたか）
  index.css            ← デザイン（色は :root の変数で管理）
  ruriiro/
    cipher.ts          ← 暗号ページの問題・選択肢・暗号文。主にここを編集
    App.tsx            ← 暗号ページの画面
    ruriiro.css        ← 暗号ページのデザイン（瑠璃色テーマ）
ruriiro/index.html     ← 暗号ページの入口
scripts/check-puzzle.ts
scripts/check-cipher.ts
.github/workflows/deploy.yml ← main に push すると自動でデプロイ
```

## 公開の仕組み

1. `main` に push する
2. GitHub Actions が `npm ci` → `npm run check` → `npm run build` を実行する
3. できあがった `dist/` が GitHub Pages に配置される
4. https://kouuu425.github.io/birthday_surprise/ で見られる

`vite.config.ts` の `base` はリポジトリ名に合わせてある（Pages は `/<リポジトリ名>/` 配下で配信されるため）。

## 注意

- public リポジトリなので、ここにあるものはすべて誰でも読める
- 進捗はブラウザの localStorage に保存される。ページ最下部の「最初からやり直す」でリセットできる
