function addWords() {
  const sheetName = "star-words";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) return;

  // 初期化処理
  const lastRow = sheet.getLastRow();
  if (lastRow !== 1) {
    sheet.deleteRows(2, lastRow);
  }

  for (const starWord of Constants.STAR_DATA) {
    sheet.appendRow([
      starWord.date,
      starWord.name,
      starWord.sign,
      starWord.word,
    ]);
  }
}
