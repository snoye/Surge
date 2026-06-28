(async () => {

  const http = $httpClient;

  const fmt = (y,m,d)=>`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth()+1;
  const D = now.getDate();
  const H = now.getHours();
  const W = "日一二三四五六"[now.getDay()];
  const today = fmt(Y,M,D);

  // ---------- 基础数据 ----------
  let yi = "诸事不宜";
  let ji = "诸事大吉";
  let lunar = "";

  try {
    const url = `https://raw.githubusercontent.com/zqzess/openApiData/main/calendar_new/${Y}/${String(M).padStart(2,"0")}.json`;

    const data = await new Promise((resolve)=>{
      http.get(url,(err,res,body)=>{
        try { resolve(JSON.parse(body)); } catch(e){ resolve({}); }
      });
    });

    for (let k in data) {
      const v = data[k];
      const str = JSON.stringify(v);
      if (str.includes(`"${D}"`) || str.includes(`-${M}-${D}`)) {
        yi = v.yi || v.Yi || v.suit || yi;
        ji = v.ji || v.Ji || v.avoid || ji;
        lunar = v.lunar || v.cn || v.ln || "";
        break;
      }
    }
  } catch(e){}

  // ---------- 干支 ----------
  const GAN = "甲乙丙丁戊己庚辛壬癸";
  const ZHI = "子丑寅卯辰巳午未申酉戌亥";
  const base = new Date(1900,0,1);
  const days = Math.floor((now-base)/86400000);

  const dayGZ = GAN[(days%10+10)%10] + ZHI[(days%12+12)%12];
  const hourZ = ZHI[Math.floor((H+1)%24/2)];

  // ---------- AI情绪评分（核心升级点） ----------
  const hash = (s)=>{
    let h = 0;
    for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) % 100;
    return h;
  };

  const moodScore = (hash(dayGZ + yi + ji) % 100);

  let mood = "";
  let advice = "";

  if (moodScore > 80) {
    mood = "🔥 今日大吉（能量爆发）";
    advice = "适合推进重要事情 / 谈合作 / 做决策";
  } else if (moodScore > 60) {
    mood = "✨ 偏吉（状态不错）";
    advice = "适合执行计划 / 学习 / 轻度社交";
  } else if (moodScore > 40) {
    mood = "⚖️ 平稳（日常节奏）";
    advice = "保持节奏 / 不宜冒进";
  } else if (moodScore > 20) {
    mood = "🌧️ 偏低（注意状态）";
    advice = "减少冲突 / 避免重大决策";
  } else {
    mood = "⚠️ 低能量（谨慎）";
    advice = "适合休息 / 整理 / 延后重要事项";
  }

  // ---------- 倒计时 ----------
  const events = [
    ["元旦", `${Y}-01-01`],
    ["春节", `${Y}-02-10`],
    ["劳动节", `${Y}-05-01`],
    ["国庆", `${Y}-10-01`],
    ["圣诞", `${Y}-12-25`]
  ];

  const diff = (a,b)=>Math.ceil((new Date(b)-new Date(a))/86400000);

  const countdown = events
    .map(e=>[e[0], diff(today,e[1])])
    .sort((a,b)=>a[1]-b[1])
    .slice(0,3)
    .map(e=>{
      return e[1]===0 ? `${e[0]} 🔥今天` : `${e[0]} ${e[1]}天`;
    }).join("\n");

  // ---------- 输出 ----------
  const title = `${Y}.${M}.${D} 周${W}`;

  const content =
`📅 农历：${lunar}

🧭 干支：${dayGZ}
⏰ 时辰：${hourZ}时

${mood}

💡 建议：
${advice}

🟢 宜：${yi}
🔴 忌：${ji}

⏳ 重要倒计时：
${countdown}`;

  $done({
    title,
    content
  });

})();
