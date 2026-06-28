/*
📅 万年历 Panel（Surge版）
*/

(async () => {

  const http = $httpClient;

  // ---------- 工具 ----------
  const fmt = (y,m,d)=>`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const diff = (a,b)=>{
    const d1 = new Date(a), d2 = new Date(b);
    return Math.round((d2-d1)/86400000);
  };

  // ---------- 当前日期 ----------
  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth()+1;
  const D = now.getDate();
  const today = fmt(Y,M,D);

  const weekday = "日一二三四五六"[now.getDay()];

  // ---------- 简化农历 API ----------
  let yi = "加载中...";
  let ji = "加载中...";

  try {
    const url = `https://raw.githubusercontent.com/zqzess/openApiData/main/calendar_new/${Y}/${Y}${String(M).padStart(2,"0")}.json`;

    const data = await new Promise((resolve,reject)=>{
      http.get(url,(err,res,body)=>{
        if(err) reject(err);
        else resolve(JSON.parse(body));
      });
    });

    // 找今天数据
    const keys = Object.keys(data || {});
    for (let k of keys) {
      const v = data[k];
      if (JSON.stringify(v).includes(`${M}`) && JSON.stringify(v).includes(`${D}`)) {
        yi = v.yi || v.Yi || v.suit || "诸事不宜";
        ji = v.ji || v.Ji || v.avoid || "诸事大吉";
        break;
      }
    }
  } catch(e) {}

  // ---------- 干支（简化版） ----------
  const GAN = "甲乙丙丁戊己庚辛壬癸";
  const ZHI = "子丑寅卯辰巳午未申酉戌亥";

  const base = new Date(1900,0,1);
  const days = Math.floor((now - base)/86400000);
  const gzDay = GAN[(days%10+10)%10] + ZHI[(days%12+12)%12];

  const hour = now.getHours();
  const zhiIdx = Math.floor((hour+1)%24/2);
  const gzHour = ZHI[zhiIdx];

  // ---------- 简单倒计时 ----------
  const events = [
    ["元旦", `${Y}-01-01`],
    ["春节", `${Y}-02-10`],
    ["劳动节", `${Y}-05-01`],
    ["国庆", `${Y}-10-01`]
  ];

  const countdown = events
    .map(e => `${e[0]}：${diff(today, e[1])}天`)
    .join("\n");

  // ---------- 输出 ----------
  const title = `${Y}年${M}月${D}日 周${weekday}`;

  const content =
`干支：${gzDay}（日） ${gzHour}时

宜：${yi}
忌：${ji}

倒计时：
${countdown}`;

  $done({
    title,
    content
  });

})();
