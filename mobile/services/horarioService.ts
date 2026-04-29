import db from './database'

export interface Horario {
  id: number
  remedio_id: number
  hora: string
  dias_semana: string
}

export interface NovoHorario {
  remedio_id: number
  hora: string
  dias_semana: string
}

export function inserirHorario(dados: NovoHorario): number {
  const resultado = db.runSync(
    `INSERT INTO horario (remedio_id, hora, dias_semana) VALUES (?, ?, ?)`,
    [dados.remedio_id, dados.hora, dados.dias_semana]
  )
  return resultado.lastInsertRowId
}

export function listarHorariosPorRemedio(remedio_id: number): Horario[] {
  return db.getAllSync(
    `SELECT * FROM horario WHERE remedio_id = ? ORDER BY hora ASC`,
    [remedio_id]
  ) as Horario[]
}

export function deletarHorario(id: number): void {
  db.runSync(`DELETE FROM horario WHERE id = ?`, [id])
}

export function deletarHorariosPorRemedio(remedio_id: number): void {
  db.runSync(`DELETE FROM horario WHERE remedio_id = ?`, [remedio_id])
}