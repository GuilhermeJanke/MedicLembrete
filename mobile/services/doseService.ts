import db from './database'
import { decrementarEstoque, verificarEstoqueBaixo } from './remedioService'

export type StatusDose = 'pendente' | 'tomada' | 'adiada' | 'ignorada'

export interface Dose {
  id: number
  remedio_id: number
  horario_id: number
  status: StatusDose
  agendado_para: string
  registrado_em: string | null
}

export interface DoseComRemedio extends Dose {
  remedio_nome: string
  remedio_dosagem: string
  remedio_unidade: string
}

export interface NovaDose {
  remedio_id: number
  horario_id: number
  agendado_para: string
}

export function inserirDose(dados: NovaDose): number {
  const resultado = db.runSync(
    `INSERT INTO dose (remedio_id, horario_id, status, agendado_para, registrado_em)
     VALUES (?, ?, 'pendente', ?, NULL)`,
    [dados.remedio_id, dados.horario_id, dados.agendado_para]
  )
  return resultado.lastInsertRowId
}

export function buscarDosesDodia(usuario_id: number, data: string): DoseComRemedio[] {
  return db.getAllSync(
    `SELECT d.*, r.nome as remedio_nome, r.dosagem as remedio_dosagem, r.unidade as remedio_unidade
     FROM dose d
     JOIN remedio r ON d.remedio_id = r.id
     WHERE r.usuario_id = ?
     AND date(d.agendado_para) = date(?)
     ORDER BY d.agendado_para ASC`,
    [usuario_id, data]
  ) as DoseComRemedio[]
}

export function confirmarDose(id: number): { estoqueBaixo: boolean } {
  const dose = db.getFirstSync(
    `SELECT * FROM dose WHERE id = ?`, [id]
  ) as Dose | null

  if (!dose) return { estoqueBaixo: false }

  const agendado = new Date(dose.agendado_para)
  const agora = new Date()
  const diffHoras = (agora.getTime() - agendado.getTime()) / (1000 * 60 * 60)

  if (diffHoras > 2) {
    db.runSync(
      `UPDATE dose SET status = 'ignorada', registrado_em = ? WHERE id = ?`,
      [agora.toISOString(), id]
    )
    return { estoqueBaixo: false }
  }

  db.runSync(
    `UPDATE dose SET status = 'tomada', registrado_em = ? WHERE id = ?`,
    [agora.toISOString(), id]
  )

  decrementarEstoque(dose.remedio_id)
  const estoqueBaixo = verificarEstoqueBaixo(dose.remedio_id)

  return { estoqueBaixo }
}

export function adiarDose(id: number, minutos: 15 | 30): void {
  const dose = db.getFirstSync(
    `SELECT * FROM dose WHERE id = ?`, [id]
  ) as Dose | null

  if (!dose) return

  // Conta quantas vezes foi adiada
  const adiamentos = db.getFirstSync(
    `SELECT COUNT(*) as total FROM dose 
     WHERE horario_id = ? AND status = 'adiada' AND date(agendado_para) = date(?)`,
    [dose.horario_id, dose.agendado_para]
  ) as { total: number }

  // Regra de negócio: máximo 3 adiamentos
  if (adiamentos.total >= 3) {
    db.runSync(
      `UPDATE dose SET status = 'ignorada', registrado_em = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    )
    return
  }

  const novoHorario = new Date(Date.now() + minutos * 60 * 1000)

  db.runSync(
    `UPDATE dose SET status = 'adiada', registrado_em = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  )

  // Cria nova dose com o horário adiado
  db.runSync(
    `INSERT INTO dose (remedio_id, horario_id, status, agendado_para, registrado_em)
     VALUES (?, ?, 'pendente', ?, NULL)`,
    [dose.remedio_id, dose.horario_id, novoHorario.toISOString()]
  )
}

export function ignorarDosesAtrasadas(usuario_id: number): void {
  const agora = new Date()
  const limite = new Date(agora.getTime() - 2 * 60 * 60 * 1000)

  db.runSync(
    `UPDATE dose SET status = 'ignorada', registrado_em = ?
     WHERE status = 'pendente'
     AND agendado_para < ?
     AND remedio_id IN (SELECT id FROM remedio WHERE usuario_id = ?)`,
    [agora.toISOString(), limite.toISOString(), usuario_id]
  )
}

export function buscarHistorico(usuario_id: number, dias: number = 30): DoseComRemedio[] {
  return db.getAllSync(
    `SELECT d.*, r.nome as remedio_nome, r.dosagem as remedio_dosagem, r.unidade as remedio_unidade
     FROM dose d
     JOIN remedio r ON d.remedio_id = r.id
     WHERE r.usuario_id = ?
     AND d.agendado_para >= datetime('now', ?)
     ORDER BY d.agendado_para DESC`,
    [usuario_id, `-${dias} days`]
  ) as DoseComRemedio[]
}