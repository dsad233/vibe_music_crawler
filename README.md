### Require

- [Node](https://nodejs.org)
- Package Manager
  - npm or [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)

<br/>

### Packages

- express
- puppeteer
- cheerio
- exceljs

<br/>

### Install

- npm or yarn

  ```
  npm install or yarn install
  ```

<br/>

### Run

```
// server start
node app.js



/**
* 신규 앨범
* @query {string} filter
*/

-- 종합 앨범 수집 --
http://localhost:3000/vibe/albums/new/excel
http://localhost:3000/vibe/albums/new/excel?filter=manual

-- 국내 앨범 수집 --
http://localhost:3000/vibe/albums/new/excel?filter=domestic

-- 해외 앨범 수집 --
http://localhost:3000/vibe/albums/new/excel?filter=oversea



/**
* 노래 급상승
* @query {string} filter
*/

-- 국내 급상승 --
http://localhost:3000/vibe/songs/hot/excel
http://localhost:3000/vibe/songs/hot/excel?filter=domestic

-- 해외 급상승 --
http://localhost:3000/vibe/songs/hot/excel?filter=oversea


/**
* 주목할 최신곡
*/

http://localhost:3000/vibe/songs/new/excel

```
