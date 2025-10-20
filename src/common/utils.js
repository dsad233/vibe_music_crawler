// 딜레이 함수
export function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
