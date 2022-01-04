# Mira Bot

今日の星言葉を教えてくれる Bot です

## 構成

TypeScript で実装したものを[Clasp](https://github.com/google/clasp)を使って Google の Apps Script へ push しています

Spread sheet から該当の日付の星言葉を取得して、webhook 経由で該当の channel にメッセージを post します

スケジューラーには Apps Script のトリガーを使っています

- `src/addWords.ts`: `constants.ts`で定義された星言葉を Spread sheet に転記する
- `src/sendMessage.ts`: 今日の日付から該当の星言葉を Spread sheet から取得し、Slack へメッセージを送る

## 環境構築

1. `.example.clasp.json`をコピーして`.clasp.json`を作成する
2. `"scriptId"`に該当の Spread sheet と連携した Apps Script の id を記載する
3. `yarn clasp login`
4. `yarn clasp push`で src 配下の TypeScript が Apps Script として push される
5. Spread sheet の 1 行目に`date, name, sign, word`を追記 <!-- HACK:(nus3) -->
6. Apps Script のエディタ上で`addWords`を実行すると該当の Spread sheet に星言葉が追加される
7. `src/secrets.ts`を作成し、`SLACK_WEBHOOK_URL`と`GROUP_ID`を定義
8. Apps Script のエディタ上で`sendMessage`を実行(9 時 40 分~45 分の間でなければ送信しないようになってるので、よしなにコードをいじって試してください)

```typescript: src/secrets.ts
namespace Secrets {
  export const SLACK_WEBHOOK_URL = "";
  export const GROUP_ID = "<!subteam^Group-id>";
}
```

## その他

- [無料枠では Google Apps Script のトリガーの実行は 1 日 90 分。](https://developers.google.com/apps-script/guides/services/quotas)
  - トリガーは毎日何時何分の繰り返し指定ができそうになかった
  - ので、現環境では 5 分おきに実行するようにしている
  - 該当の時間(9 時 40 分~45 分)でなければ実行時間の平均は 0.3 秒
  - 1 日 288 回(`1440 / 5`)実行するとしても 87 秒程度なので大丈夫かなって思ってる
- Clasp では import, export 構文が使えそうになかったので namespace を使ったワークアラウンドな対応をしてる
