import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync('mediclembrete.db')

export function inicializarBanco(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `)

  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuario (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id   TEXT    NOT NULL UNIQUE,
      nome        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      foto_url    TEXT,
      criado_em   TEXT    NOT NULL
    );
  `)

  db.execSync(`
    CREATE TABLE IF NOT EXISTS remedio (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id       INTEGER NOT NULL,
      nome             TEXT    NOT NULL,
      dosagem          TEXT    NOT NULL,
      unidade          TEXT    NOT NULL,
      estoque_atual    INTEGER,
      estoque_alerta   INTEGER DEFAULT 5,
      ativo            INTEGER NOT NULL DEFAULT 1,
      criado_em        TEXT    NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    );
  `)

  db.execSync(`
    CREATE TABLE IF NOT EXISTS horario (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      remedio_id   INTEGER NOT NULL,
      hora         TEXT    NOT NULL,
      dias_semana  TEXT    NOT NULL,
      FOREIGN KEY (remedio_id) REFERENCES remedio(id)
    );
  `)

  db.execSync(`
    CREATE TABLE IF NOT EXISTS dose (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      remedio_id     INTEGER NOT NULL,
      horario_id     INTEGER NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'pendente',
      agendado_para  TEXT    NOT NULL,
      registrado_em  TEXT,
      FOREIGN KEY (remedio_id) REFERENCES remedio(id),
      FOREIGN KEY (horario_id) REFERENCES horario(id)
    );
  `)
}

export default db