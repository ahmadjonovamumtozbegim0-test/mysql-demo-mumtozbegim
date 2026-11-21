
import mysql from "mysql2/promise";

export default async (req) => {
  let db;

  try {
    db = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: Number(process.env.TIDB_PORT || 4000),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { minVersion: "TLSv1.2" }
    });

    if (req.method === "POST") {
      const { name } = await req.json();
      const clean = String(name ?? "").trim().slice(0, 100);

      if (clean) {
        await db.execute(
          "INSERT INTO notes (name) VALUES (?)",
          [clean]
        );
      }
    }

    const [rows] = await db.execute(
      "SELECT name, created_at FROM notes ORDER BY id DESC LIMIT 50"
    );

    return Response.json(rows);

  } catch (err) {
    console.error("TiDB error:", err);
    return Response.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  } finally {
    if (db) await db.end();
  }
};
