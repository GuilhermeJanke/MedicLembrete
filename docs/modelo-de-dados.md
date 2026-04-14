# Modelo de dados

Banco de dados local SQLite via `expo-sqlite`. Todos os dados ficam no dispositivo do usuário no MVP.

---

## Tabelas

### `usuario`

Armazena o perfil do usuário autenticado via Google Sign-In.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INTEGER PK | sim | Identificador interno autoincrement |
| `google_id` | TEXT UNIQUE | sim | ID retornado pelo Google OAuth — evita duplicatas |
| `nome` | TEXT | sim | Nome completo vindo do perfil Google |
| `email` | TEXT | sim | E-mail da conta Google |
| `foto_url` | TEXT | não | URL da foto de perfil Google |
| `criado_em` | TEXT (ISO 8601) | sim | Data e hora do primeiro login |

---

### `remedio`

Cada remédio pertence a um usuário. O campo `ativo` permite desativar sem perder histórico.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INTEGER PK | sim | Identificador interno autoincrement |
| `usuario_id` | INTEGER FK | sim | Referência ao usuário dono do remédio |
| `nome` | TEXT | sim | Nome do medicamento |
| `dosagem` | TEXT | sim | Valor da dose (ex: "500") |
| `unidade` | TEXT | sim | Unidade da dose (ex: "mg", "ml", "comprimido") |
| `estoque_atual` | INTEGER | não | Quantidade atual em estoque |
| `estoque_alerta` | INTEGER | não | Limite para disparar alerta de reposição (padrão: 5) |
| `ativo` | INTEGER | sim | 1 = ativo, 0 = inativo (padrão: 1) |
| `criado_em` | TEXT (ISO 8601) | sim | Data e hora do cadastro |

---

### `horario`

Horários de tomada de cada remédio. Um remédio pode ter múltiplos horários por dia.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INTEGER PK | sim | Identificador interno autoincrement |
| `remedio_id` | INTEGER FK | sim | Referência ao remédio |
| `hora` | TEXT ("HH:MM") | sim | Horário da dose (ex: "08:00", "22:30") |
| `dias_semana` | TEXT | sim | Dias de disparo separados por vírgula (ex: "1,2,3,4,5" = seg a sex, "1,2,3,4,5,6,7" = todos os dias) |

> **Por que `hora` é TEXT?** O SQLite não possui tipo nativo `TIME`. O formato `"HH:MM"` é suficiente para horários recorrentes sem data, e a ordenação alfabética coincide com a cronológica. Para data + hora completa (como em `dose`), usa-se TEXT no formato ISO 8601.

---

### `dose`

Registro de cada dose gerada a partir de um horário. É o coração do histórico do app.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INTEGER PK | sim | Identificador interno autoincrement |
| `remedio_id` | INTEGER FK | sim | Referência ao remédio |
| `horario_id` | INTEGER FK | sim | Referência ao horário que originou a dose |
| `status` | TEXT | sim | `pendente`, `tomada`, `adiada` ou `ignorada` |
| `agendado_para` | TEXT (ISO 8601) | sim | Data e hora exata do lembrete agendado |
| `registrado_em` | TEXT (ISO 8601) | não | Data e hora em que o usuário confirmou a ação |

---

## Relacionamentos

```
usuario  ||--o{  remedio  : "possui"
remedio  ||--o{  horario  : "tem"
remedio  ||--o{  dose     : "gera"
horario  ||--o{  dose     : "origina"
```

---

## Regras de negócio refletidas no modelo

- Um remédio excluído deve ter `ativo = 0` — nunca deletar o registro para preservar o histórico de doses.
- O campo `estoque_atual` é decrementado a cada dose com `status = 'tomada'`.
- O alerta de estoque é disparado quando `estoque_atual <= estoque_alerta`.
- Doses são geradas diariamente a partir dos registros de `horario` ativos.
- Uma dose pode ser adiada no máximo 3 vezes — na 4ª tentativa o status muda para `ignorada`.
- A janela de confirmação de uma dose é de 2 horas após `agendado_para`. Após esse prazo, o status muda automaticamente para `ignorada`.

---

## Convenções de tipo no SQLite

| Necessidade | Tipo usado | Exemplo |
|---|---|---|
| Horário recorrente (sem data) | TEXT "HH:MM" | `"08:00"` |
| Data e hora completa | TEXT ISO 8601 | `"2025-04-13 08:00:00"` |
| Booleano | INTEGER | `1` (true) / `0` (false) |
| Chave estrangeira | INTEGER | `usuario_id = 1` |
