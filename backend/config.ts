import mysql from "serverless-mysql";

export const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "task_mate",
  },
});
