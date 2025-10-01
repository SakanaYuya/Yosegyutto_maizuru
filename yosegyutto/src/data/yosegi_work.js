// src/data/yosegi_work.js
import yosegiDummy from "../images/yosegi_dummy.jpeg";

const yosegiWorkData = [
  {
    id: 1,
    name: "作品A",
    authorId: 1, // 職人A
    image: yosegiDummy,
    description: "伝統的な白色系の寄木作品。小物入れとして使用可能。",
    use_tec:["づく技法"],
    free_words:"この点に注意しろ",
    tags: ["#白色系", "#日用品", "#小物"]
  },
  {
    id: 2,
    name: "作品B",
    authorId: 2,
    image: yosegiDummy,
    description: "茶系の美術作品。インテリアとして展示可能。",
    use_tec:["づく技法"],
    free_words:"この点に注意しろ",
    tags: ["#茶系", "#美術"]
  },
  {
    id: 3,
    name: "作品C",
    authorId: 1,
    image: yosegiDummy,
    description: "小物向けの寄木作品。丸みのあるデザイン。",
    use_tec:["づく技法"],
    free_words:"この点に注意しろ",
    tags: ["#白色系", "#小物"]
  },
  {
    id: 4,
    name: "作品D",
    authorId: 2,
    image: yosegiDummy,
    description: "日用品向けの寄木作品。実用性重視。",
    use_tec:["づく技法"],
    free_words:"この点に注意しろ",
    tags: ["#日用品", "#実用"]
  },
  {
    id: 5,
    name: "作品E",
    authorId: 3,
    image: yosegiDummy,
    description: "大型寄木作品。家具として使用可能。",
    use_tec:["づく技法"],
    free_words:"この点に注意しろ",
    tags: ["#大型", "#家具"]
  }
];

export default yosegiWorkData;
