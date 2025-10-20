// 딜레이 함수
export function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// Date 함수
export function dateFormatting() {
  const currentDate = new Date();
  const currentDayFormat =
    currentDate.getFullYear() +
    "-" +
    (currentDate.getMonth() + 1) +
    "-" +
    currentDate.getDate();

  return currentDayFormat;
}
