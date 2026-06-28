(async () => {

  const http = $httpClient;

  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth() + 1;
  const D = now.getDate();
  const H = now.getHours();
  const W = "日一二三四五六"[now.getDay()];

  const pad = n => String(n).padStart(2,"0");
  const today = `${Y}-${pad(M)}-${pad(D)}`;

  // =========================
  // 🧠 安全宜忌获取（强容错）
  // =========================
  let yi = "";
  let ji = "";
  let lunar = "";

  try {
    const url =
      `https://raw.githubusercontent.com/zqzess/openApiData/main/calendar_new/${Y}/${pad(M)}.json`;

    const data = await new Promise((resolve) => {
      http.get(url, (err, res, body) => {
        try { resolve(JSON.parse(body)); }
        catch { resolve({}); }
      });
    });

    for (let k in data) {
      const v = data[k];
      const str = JSON.stringify(v);

      if (str.includes(`"${D}"`) || str.includes(`-${M}-${D}`)) {

        yi =
          v.yi || v.Yi || v.suit ||
          "（暂无宜项）";

        ji =
          v.ji || v.Ji || v.avoid ||
          "（暂无忌项）";

        lunar =
          v.lunar ||
          v.lunarDate ||
          v.cn ||
          (v.monthCn && v.dayCn ? `${v.monthCn}${v.dayCn}` : "") ||
          "农历信息未知";

        break;
      }
    }
  } catch (e) {}

  // =========================
  // 🧭 干支（稳定算法）
  // =========================
  const GAN = "甲乙丙丁戊己庚辛壬癸";
  const ZHI = "子丑寅卯辰巳午未申酉戌亥";

  const base = new Date(1900,0,1);
  const days = Math.floor((now - base)/86400000);

  const dayGZ = GAN[(days % 10 + 10) % 10] + ZHI[(days % 12 + 12) % 12];
  const hourZ = ZHI[Math.floor((H + 1) % 24 / 2)];

  // =========================
  // ⏳ 终极倒计时（不会负数）
  // =========================
  const events = [
    ["元旦","01-01"],
    ["春节","02-10"],
    ["劳动节","05-01"],
    ["国庆","10-01"],
    ["圣诞","12-25"]
  ];

  const getNextDate = (md) => {
    const thisYear = `${Y}-${md}`;
    const nextYear = `${Y+1}-${md}`;

    const d1 = new Date(thisYear);
    const d2 = new Date(nextYear);

    return d1 >= now ? thisYear : nextYear;
  };

  const countdown = events
    .map(e => {
      const target = getNextDate(e[1]);
      const d = Math.ceil((new Date(target) - now) / 86400000);
      return `${e[0]} ${d}天`;
    })
    .join("\n");

  // =========================
  // 🧠 今日状态系统（新增）
  // =========================
  const hash = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) % 100;
    }
    return h;
  };

  const score = hash(dayGZ + yi + ji);

  let status = "";
  let advice = "";

  if (score > 75) {
    status = "🔥 大吉日";
    advice = "适合决策 / 推进重要事项";
  } else if (score > 55) {
    status = "✨ 偏吉日";
    advice = "适合执行计划";
  } else if (score > 35) {
    status = "⚖️ 平稳日";
    advice = "保持节奏即可";
  } else {
    status = "🌧️ 谨慎日";
    advice = "避免重大决策";
  }

  // =========================
  // 📦 输出（Surge最稳格式）
  // =========================
  const title = `${Y}.${M}.${D} 周${W}`;

  const content =
`📅 ${lunar}

🧭 ${dayGZ}   ⏰ ${hourZ}时

${status}
💡 ${advice}

🟢 宜：${yi}
🔴 忌：${ji}

⏳ 倒计时
${countdown}`;

  $done({ title, content });

})();
