import db from './database'

export interface Remedio {
  id: number
  usuario_id: number
  nome: string
  dosagem: string
  unidade: string
  estoque_atual: number | null
  estoque_alerta: number
  ativo: number
  criado_em: string
}

export interface NovoRemedio {
  usuario_id: number
  nome: string
  dosagem: string
  unidade: string
  estoque_atual?: number
  estoque_alerta?: number
}

export function inserirRemedio(dados: NovoRemedio): number {
  const resultado = db.runSync(
    `INSERT INTO remedio (usuario_id, nome, dosagem, unidade, estoque_atual, estoque_alerta, ativo, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      dados.usuario_id,
      dados.nome,
      dados.dosagem,
      dados.unidade,
      dados.estoque_atual ?? null,
      dados.estoque_alerta ?? 5,
      new Date().toISOString()
    ]
  )
  return resultado.lastInsertRowId
}

export function listarRemedios(usuario_id: number): Remedio[] {
  return db.getAllSync(
    `SELECT * FROM remedio WHERE usuario_id = ? AND ativo = 1 ORDER BY nome ASC`,
    [usuario_id]
  ) as Remedio[]
}

export function buscarRemedioPorId(id: number): Remedio | null {
  const resultado = db.getFirstSync(
    `SELECT * FROM remedio WHERE id = ? AND ativo = 1`,
    [id]
  ) as Remedio | null
  return resultado
}

export function atualizarRemedio(id: number, dados: Partial<NovoRemedio>): void {
  db.runSync(
    `UPDATE remedio SET nome = ?, dosagem = ?, unidade = ?, estoque_atual = ?, estoque_alerta = ?
     WHERE id = ?`,
    [
      dados.nome!,
      dados.dosagem!,
      dados.unidade!,
      dados.estoque_atual ?? null,
      dados.estoque_alerta ?? 5,
      id
    ]
  )
}

export function desativarRemedio(id: number): void {
  db.runSync(
    `UPDATE remedio SET ativo = 0 WHERE id = ?`,
    [id]
  )
}

export function atualizarEstoque(id: number, quantidade: number): void {
  db.runSync(
    `UPDATE remedio SET estoque_atual = ? WHERE id = ?`,
    [quantidade, id]
  )
}

export function decrementarEstoque(id: number): void {
  db.runSync(
    `UPDATE remedio SET estoque_atual = estoque_atual - 1 WHERE id = ? AND estoque_atual > 0`,
    [id]
  )
}

export function verificarEstoqueBaixo(id: number): boolean {
  const remedio = buscarRemedioPorId(id)
  if (!remedio || remedio.estoque_atual === null) return false
  return remedio.estoque_atual <= remedio.estoque_alerta
}