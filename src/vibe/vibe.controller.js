import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import ex from "exceljs";
import { delay, dateFormatting } from "../common/utils.js";

export class VibeController {
  newAlbums = async (req, res) => {
    const { filter } = req.query;

    const trim = ["domestic", "oversea", "manual"].includes(filter)
      ? filter.trim()
      : "manual";
    let gotoUrl = "";

    if (trim === "domestic") {
      gotoUrl = "https://vibe.naver.com/new-release-album/domestic";
    } else if (trim === "oversea") {
      gotoUrl = "https://vibe.naver.com/new-release-album/oversea";
    } else if (trim === "manual") {
      gotoUrl = "https://vibe.naver.com/new-release-album/manual";
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // 스크린 크기 설정
    await page.setViewport({ width: 1920, height: 1080 });

    const workbook = new ex.Workbook();
    const worksheet = workbook.addWorksheet(`vibe_new_albums_${trim}`);

    worksheet.columns = [
      { header: "앨범 제목", key: "album_title", width: 30 },
      { header: "앨범 아티스트", key: "album_artist", width: 30 },
      { header: "앨범 이미지 링크", key: "album_image", width: 45 },
    ];

    await page.goto(gotoUrl, {
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
          // 마지막으로 앨범 이미지 로드
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

      delay(1000);
      const object = {
        album_title:
          $data("div.info > a.title > span.text_wrap > span").text().trim() ||
          "",
        album_artist:
          $data("div.info > div.artist > span.artist_sub_inner > span")
            .text()
            .trim() ||
          $data(
            "div.info > div.artist > span.artist_sub_inner > span > span.link_artist"
          )
            .text()
            .trim() ||
          "",
        album_image:
          $data("div.thumb_area > a.link > img").attr("src").trim() || "",
      };

      result.push(object);
    });

    worksheet.insertRows(1, result);
    await delay(2000);

    res.header("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" +
        `vibe_new_albums_${trim}` +
        "_" +
        `${dateFormatting()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

    await page.close();
    await browser.close();

    console.log("Done.");
  };

  hotSongs = async (req, res) => {
    const { filter } = req.query;
    const trim = ["domestic", "oversea"].includes(filter)
      ? filter.trim()
      : "domestic";

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // 스크린 크기 설정
    await page.setViewport({ width: 1920, height: 1080 });

    if (trim === "domestic") {
      const workbook = new ex.Workbook();
      const worksheet = workbook.addWorksheet(`vibe_hot_songs_${trim}100`);

      worksheet.columns = [
        { header: "노래 제목", key: "song_title", width: 30 },
        { header: "노래 아티스트", key: "song_artist", width: 30 },
        { header: "노래 이미지 링크", key: "song_image", width: 45 },
      ];

      await page.goto("https://vibe.naver.com/chart/domestic", {
        waitUntil: "networkidle2",
      });

      // 로드 실패 방지, 5초간 대기
      await page.waitForNetworkIdle({ idleTime: 5000 });

      const data = await page.content();

      await page.screenshot({ path: "./screen.png" });

      const $ = cheerio.load(data);

      const result = [];
      $(
        "body > div#__nuxt > div#home > div#container > main#content > div.track_section > div > div.tracklist > table > tbody > tr"
      ).each((idx, data) => {
        const $data = cheerio.load(data);

        delay(1000);
        const object = {
          song_title:
            $data(
              "td.song > div.title_badge_wrap > span.inner_cell > a.link_text"
            )
              .attr("title")
              .trim() || "",
          song_artist:
            $data("td.song > div.artist_sub").attr("title").trim() || "",
          song_image:
            $data("td.thumb > div.inner > img.img_thumb").attr("src").trim() ||
            "",
        };

        result.push(object);
      });

      worksheet.insertRows(1, result);
      await delay(2000);

      res.header("Access-Control-Expose-Headers", "Content-Disposition");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" +
          `vibe_hot_songs_${trim}100` +
          "_" +
          `${dateFormatting()}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

      await page.close();
      await browser.close();

      console.log("Done.");
    } else if (trim === "oversea") {
      const workbook = new ex.Workbook();
      const worksheet = workbook.addWorksheet(`vibe_hot_songs_${trim}100`);

      worksheet.columns = [
        { header: "노래 제목", key: "song_title", width: 30 },
        { header: "노래 아티스트", key: "song_artist", width: 30 },
        { header: "노래 이미지 링크", key: "song_image", width: 45 },
      ];

      await page.goto("https://vibe.naver.com/chart/oversea", {
        waitUntil: "networkidle2",
      });

      // 로드 실패 방지, 5초간 대기
      await page.waitForNetworkIdle({ idleTime: 5000 });

      const data = await page.content();

      await page.screenshot({ path: "./screen.png" });

      const $ = cheerio.load(data);

      const result = [];
      $(
        "div#__nuxt > div#home > div#container > main#content > div.track_section > div > div.tracklist > table > tbody > tr"
      ).each((idx, data) => {
        const $data = cheerio.load(data);

        delay(1000);
        const object = {
          song_title:
            $data(
              "td.song > div.title_badge_wrap > span.inner_cell > a.link_text"
            )
              .attr("title")
              .trim() || "",
          song_artist: $data("td.artist").attr("title").trim() || "",
          song_image:
            $data("td.thumb > div.inner > img.img_thumb").attr("src").trim() ||
            "",
        };

        result.push(object);
      });

      worksheet.insertRows(1, result);
      await delay(2000);

      res.header("Access-Control-Expose-Headers", "Content-Disposition");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" +
          `vibe_hot_songs_${trim}100` +
          "_" +
          `${dateFormatting()}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

      await page.close();
      await browser.close();

      console.log("Done.");
    }
  };

  toDaySongs = async (req, res) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // 스크린 크기 설정
    await page.setViewport({ width: 1920, height: 1080 });

    const workbook = new ex.Workbook();
    const worksheet = workbook.addWorksheet("vibe_today_new_songs");

    worksheet.columns = [
      { header: "노래 제목", key: "song_title", width: 30 },
      { header: "노래 아티스트", key: "song_artist", width: 30 },
      { header: "노래 이미지 링크", key: "song_image", width: 45 },
    ];

    await page.goto("https://vibe.naver.com/today-new-songs", {
      waitUntil: "networkidle2",
    });

    // 로드 실패 방지, 5초간 대기
    await page.waitForNetworkIdle({ idleTime: 5000 });

    const data = await page.content();

    await page.screenshot({ path: "./screen.png" });

    const $ = cheerio.load(data);

    const result = [];
    $(
      "body > div#__nuxt > div#home > div#container > main#content > div.subend_section.home_end > div.track_wrap > div.track_section > div > div.tracklist > table > tbody > tr"
    ).each((idx, data) => {
      const $data = cheerio.load(data);

      delay(1000);
      const object = {
        song_title:
          $data(
            "td.song > div.title_badge_wrap > span.inner_cell > a.link_text"
          )
            .attr("title")
            .trim() || "",
        song_artist:
          $data("td.song > div.artist_sub").attr("title").trim() || "",
        song_image:
          $data("td.thumb > div.inner > img.img_thumb").attr("src").trim() ||
          "",
      };

      result.push(object);
    });

    worksheet.insertRows(1, result);
    await delay(2000);

    res.header("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" +
        "vibe_today_new_songs" +
        "_" +
        `${dateFormatting()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

    await page.close();
    await browser.close();

    console.log("Done.");
  };
}
