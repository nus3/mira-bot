const zeroPadding = (input: number): string => {
  return input.toString().padStart(2, "0");
};

const checkTime = (date: Date) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return hour === 9 && minute > 40 && minute <= 45;
};

const HOLIDAYS = [
  "12/27",
  "12/28",
  "12/29",
  "12/30",
  "12/31",
  "01/01",
  "01/02",
  "01/03",
  "01/04",
];

function sendMessage() {
  const currentDate = new Date();
  if (checkTime(currentDate) === false) return;
  if (currentDate.getDay() === 0 || currentDate.getDay() === 6) return;

  const month = zeroPadding(currentDate.getMonth() + 1);
  const date = zeroPadding(currentDate.getDate());
  const currentDateStr = `${month}/${date}`;
  if (HOLIDAYS.indexOf(currentDateStr) !== -1) return;

  const sheetName = "star-words";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;

  const dates = sheet.getRange(1, 1, sheet.getLastRow()).getValues().flat();
  const targetRow = dates.indexOf(currentDateStr) + 1;
  if (targetRow === -1) return;

  const starWordData = sheet.getRange(targetRow, 1, 1, 4).getValues().flat();
  if (starWordData.length !== 4) return;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: Secrets.GROUP_ID,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":star::star: オハヨー! 朝会の時間ダヨ!! :star::star:",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        // NOTE:(nus3) claspでデプロイするときに日本語はutf8?に変換されるので変数展開を使わない
        text: "今日の星言葉は *" + starWordData[1] + "*",
      },
    },
    {
      type: "header",
      text: {
        type: "plain_text",
        text: starWordData[3],
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "を意識してがんばろうネ",
      },
    },
  ];
  // NOTE:(nus3) clasp経由のpushではGASに環境変数をうまく渡せなかったのでsrc/secrets.ts配下に環境変数を設定している
  //             App Scriptのエディタでは環境変数の値は見えてもいいが、gitに環境変数を残したくなかった
  const webhook = Secrets.SLACK_WEBHOOK_URL;

  const payload = JSON.stringify({ blocks });

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: payload,
  };
  UrlFetchApp.fetch(webhook, options);
}
