const axios = require("axios");
const cheerio = require("cheerio");
const { PythonShell } = require("python-shell");
// const json = require("json");

async function leaderboard_scraper() {
  const response = await axios("https://www.espn.com/golf/leaderboard");
  const html = await response.data;
  const $ = cheerio.load(html);

  const allRows = $("table > tbody > tr");

  allRows.each((index, element) => {
    const tds = $(element).find("td");

    const name = $(tds[2]).text();
    const position = $(tds[1]).text();
    const score = $(tds[3]).text();
    const R1 = $(tds[4]).text();
    const R2 = $(tds[5]).text();
    const R3 = $(tds[6]).text();
    const R4 = $(tds[7]).text();
    const Total = $(tds[8]).text();
    const Earnings = $(tds[9]).text();
    const FedexPoints = $(tds[10]).text();

    player_data[name] = {
      Position: position,
      Score: score,
      R1: R1,
      R2: R2,
      R3: R3,
      R4: R4,
      Total: Total,
      Earnings: Earnings,
      "Fedex Points": FedexPoints,
      "Fantasy Points": 0,
    };
  });
}

async function date_scraper() {
  const response = await axios("https://www.espn.com/golf/schedule");
  const html = await response.data;
  const $ = cheerio.load(html);

  const td = $("table").first().find("tr > td").first();

  td.each((i, div) => {
    date = $(div).text();
  });
}

function point_handler(player_data) {
  const order = Object.keys(player_data);
  for (let i = 0; i < 26; i++) {
    if (26 - i > 1) {
      player_data[order[i]]["Fantasy Points"] = 26 - i;
    }
  }
  player_data[order[0]]["Fantasy Points"] += 4;
  let positions = [];
  order.forEach((player) => {
    positions.push(player_data[player]["Position"]);
  });
  ties = [];
  positions.forEach((position) => {
    if (positions.filter((x) => x == position).length > 1) {
      ties.push(position);
    }
  });
  ties = new Set(ties);
  ties.forEach((position) => {
    point_total = 0;
    tie_count = 0;
    order.forEach((player) => {
      if (player_data[player]["Position"] === position) {
        point_total += player_data[player]["Fantasy Points"];
        tie_count += 1;
      }
    });
    average = (point_total / tie_count).toFixed(2);
    order.forEach((player) => {
      if (player_data[player]["Position"] === position) {
        player_data[player]["Fantasy Points"] = average;
      }
    });
  });
}

async function main() {
  player_data = {};
  leaderboard_scraper();
  date = "";
  date_scraper();

  await new Promise((r) => setTimeout(r, 2000));

  point_handler(player_data);

  let options = {
    scriptPath: "./",
    args: [JSON.stringify(player_data), date],
  };
  PythonShell.run("main.py", options, (err, res) => {
    if (err) console.log(err);
    if (res) console.log(res);
  });
}

main();
