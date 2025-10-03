// src/data/my_roll.js
// ユーザーのロール情報を保存

let myRollData = {
  tags: ["#ヅク技法", "#白色系"], // 初期タグ
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ロール情報を取得
export const getMyRoll = () => {
  return { ...myRollData };
};

// タグを追加
export const addTag = (tag) => {
  if (!myRollData.tags.includes(tag)) {
    myRollData.tags.push(tag);
    myRollData.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

// タグを削除
export const removeTag = (tag) => {
  const index = myRollData.tags.indexOf(tag);
  if (index > -1) {
    myRollData.tags.splice(index, 1);
    myRollData.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

// すべてのタグを設定（上書き）
export const setTags = (tags) => {
  myRollData.tags = [...tags];
  myRollData.updatedAt = new Date().toISOString();
};

// タグをすべて取得
export const getTags = () => {
  return [...myRollData.tags];
};

// タグが存在するかチェック
export const hasTag = (tag) => {
  return myRollData.tags.includes(tag);
};

// ロール情報をリセット
export const resetMyRoll = () => {
  myRollData = {
    tags: ["#ヅク技法", "#白色系"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export default myRollData;