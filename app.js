import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import ex from "exceljs";
import express from "express";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(port, " listening...");
});

app.get("/download", async (req, res) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 스크린 크기 설정
  await page.setViewport({ width: 1920, height: 1080 });

  const workbook = new ex.Workbook();
  const worksheet = workbook.addWorksheet("new_album");

  worksheet.columns = [
    { header: "앨범 제목", key: "album_title", width: 30 },
    { header: "앨범 아티스트", key: "album_artist", width: 30 },
    { header: "앨범 이미지 링크", key: "album_image", width: 45 },
  ];

  try {
    await page.goto("https://vibe.naver.com/new-release-album/manual", {
      waitUntil: "networkidle2",
    });

    // 로드 실패 방지, 5초간 대기
    await page.waitForNetworkIdle({ idleTime: 5000 });

    let lastHeight = await page.evaluate("document.body.scrollHeight");
    // y 좌표 값 설정
    let yCoord = 700;
    while (true) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      const $data = cheerio.load(
        await page.content(
          "body > div#__nuxt > div#home > div#container > main#content > div.subend_section > div.sub_list > div.btn_more_list"
        )
      );
      const moreBtn = $data("a.link > span.text").html();

      if (moreBtn) {
        await page.click(
          "body > div#__nuxt > div#home > div#container > main#content > div.subend_section > div.sub_list > div.btn_more_list > a.link"
        );
      }

      // 더보기 태그를 클릭 했을 시에, 다음 데이터 3초간 로드 대기
      await delay(3000);
      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === lastHeight) {
        while (lastHeight >= yCoord) {
          // 마지막으로 앨범 이미지 최종 로드
          await page.evaluate(`window.scrollTo(0, ${yCoord})`);
          await delay(2000);
          yCoord += 700;
        }
        break;
      } else {
        lastHeight = newHeight;
      }
    }

    await page.screenshot({ path: "./screen.png" });

    const data = await page.content();

    // 가져온 html, cheerio 라이브러리로 파싱
    const $ = cheerio.load(data);

    const result = [];
    $(
      "body > div#__nuxt > div#home > div#container > main#content > div.subend_section > div.sub_list > ul > li.list_item > div"
    ).each((idx, data) => {
      const $data = cheerio.load(data);

      const object = {
        album_title: $data("div.info > a.title > span.text_wrap > span")
          .text()
          .trim(),
        album_artist:
          $data(
            "div.info > div.artist > span.artist_sub_inner > span > a.link_artist > span"
          )
            .text()
            .trim() ||
          $data(
            "div.info > div.artist > span.artist_sub_inner > span > span.link_artist"
          )
            .text()
            .trim(),
        album_image: $data("div.thumb_area > a.link > img").attr("src").trim(),
      };

      result.push(object);
    });

    worksheet.insertRows(1, result);
    const currentDate = new Date();
    const currentDayFormat =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate();

    res.header("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "new_album" + "_" + `${currentDayFormat}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("에러 발생: ", err);
    return res.status(500).json({ message: err.message });
  } finally {
    console.log("Done.");
    await page.close();
    await browser.close();
  }
});

// 딜레이 함수
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// async function isContent(session, content) {
//   const $data = cheerio.load(content);

//   if ($data) {

//   }
// }
