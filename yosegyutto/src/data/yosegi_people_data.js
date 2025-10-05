// src/data/yosegi_people_data.js
//寄木職人のデータ保存用
import yosegiDummy from "../images/yosegi_dummy.jpeg";
import honnma from "../images/honnma.png";
import kanasasi from "../images/kanasasi.png";
import tuyuki from "../images/tuyuki.png";

const yosegiPeopleData = [
  {
    id: 1,
    work_name: "貼り8寸角盆",           // 代表作品名（任意で複数でも可）
    name: "本間 博丈",               // 職人名
    image: honnma,          // 職人の代表画像
    profile: "京都在住の寄木職人。伝統技法を守りつつ現代的デザインも手がける。",
    free_words:"とても有名な職人",
    representativeWorks: [1, 3], // 作品ID配列
    tags: ["#白色系", "#日用品", "#小物"]
  },
  {
    id: 2,
    work_name: "りんご型の小物入れ",
    name: "金指 勝悦",
    image: kanasasi,
    profile: "木材の特性を活かした小物作りが得意。",
    representativeWorks: [2, 4],
    tags: ["#茶系", "#美術"]
  },
  {
    id: 3,
    work_name: "ぐい呑み（ななめ縞寄木）",
    name: "露木 清勝",
    image: tuyuki,
    profile: "大型の家具寄木作品も手がける職人。",
    representativeWorks: [5],
    tags: ["#小物", "#日用品"]
  },
  {
    id: 4,
    work_name: "作品D",
    name: "作者D",
    image: yosegiDummy,
    profile: "大型の家具寄木作品も手がける職人。",
    representativeWorks: [5],
    tags: ["#大型", "#家具"]
  },
  {
    id: 5,
    work_name: "作品E",
    name: "作者E",
    image: yosegiDummy,
    profile: "大型の家具寄木作品も手がける職人。",
    representativeWorks: [5],
    tags: ["#大型", "#家具"]
  }
];

export default yosegiPeopleData;
