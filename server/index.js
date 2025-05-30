const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);
app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, "../client/build")));

// SQLite 데이터베이스 연결
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

// 데이터베이스 연결 테스트
sequelize
  .authenticate()
  .then(() => {
    console.log("SQLite 데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error("데이터베이스 연결 실패:", err);
  });

// 라우트 설정
const apiRouter = require("./routes/api");
app.use("/api", apiRouter);

// React 앱을 위한 라우트 핸들링
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 서버 시작
app.listen(port, "0.0.0.0", () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`http://localhost:${port} 에서 접속 가능합니다.`);
});
