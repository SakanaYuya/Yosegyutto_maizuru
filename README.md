# Yosegyutto_maizuru
## 舞鶴よせぎゅっとチームのリポジトリへようこそ！

本リポジトリは舞鶴高専よせぎゅっとチームのリポジトリです。

## 利用の仕方

リポジトリは，開発終了後基本的に Public にしてください．  

## 環境構築の手法

Git cloneした環境で以下のコマンドを順に実行してください
コマンド1(階層移動)
```
cd yosegyutto>
```
コマンド2(インストール)
```
npm install
```
コマンド3(インストール内容の確認)
上のほうが重要なコマンドです。
```
npm list react
npm list react-dom
```
コマンド3実行後に**React18.....**
という風に出てきたらokです。React19...と出てきたら失敗です



> [!NOTE]
> 詳細なリポジトリ管理はSakanaYuyaが行います

##ブランチ
main : mainです。
devブランチ : 〇〇devと名前を付けるか、開発ないように即した名前にしてください

## コミットメッセージの書き方

コミットメッセージの初めには必ず prefix をつける様にしましょう．  
[参考：僕が考える最強のコミットメッセージの書き方(Qiita)](https://qiita.com/konatsu_p/items/dfe199ebe3a7d2010b3e)

(良い例)

```shell
feat: 機能Aを追加
```

(悪い例)

```shell
プログラム動かなくて死ぬ
```

| Prefix   | 意味                                                    |
| -------- | ------------------------------------------------------- |
| add      | ちょっとしたファイルやコードの追加(画像など)            |
| change   | ちょっとしたファイルやコードの変更(画像差し替え)        |
| feat     | ユーザが利用する機能の追加(add/change を内包しても良い) |
| style    | 機能部分を変更しない、コードの見た目の変化(CSS)         |
| refactor | リファクタリング                                        |
| fix      | バグ修正                                                |
| remove   | ファイルなどの削除                                      |
| test     | テスト関連                                              |
| chore    | ビルド、補助ツール、ライブラリ関連                      |


ssh -vvv sshuser@sakanaPc.local
OpenSSH_9.2p1 Debian-2+deb12u7, OpenSSL 3.0.17 1 Jul 2025
debug1: Reading configuration data /etc/ssh/ssh_config
debug1: /etc/ssh/ssh_config line 19: include /etc/ssh/ssh_config.d/*.conf matched no files
debug1: /etc/ssh/ssh_config line 21: Applying options for *
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts' -> '/home/yosegi/.ssh/known_hosts'
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts2' -> '/home/yosegi/.ssh/known_hosts2'
debug2: resolving "sakanapc.local" port 22
debug3: resolve_host: lookup sakanapc.local:22
debug3: ssh_connect_direct: entering
debug1: Connecting to sakanapc.local [192.168.53.211] port 22.
debug3: set_sock_tos: set socket 3 IP_TOS 0x10


## test

import paramiko
import json

#送信する最小データ
data = {"test": 1}

#JSON文字列化
json_str = json.dumps(data)

#SSH接続情報
hostname = "sakanapc.local"
username = "sshuser"
password = "ここにsshuserのパスワード"
remote_path = r"C:\Users\sshuser\real_time.json"

#SSH & SFTPで送信
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, username=username, password=password)
ssh.open_sftp().file(remote_path, "w").write(json_str)
ssh.close()

print("送信完了")

C:\Users\ysaka\programs\yosegi\Yosegyutto_maizuru\yosegyutto\public\json_data





マージを実行　10/10
unity.js確認
