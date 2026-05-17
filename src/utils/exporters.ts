import type { Despesa, Obra } from '../types'
import { formatDate, formatPeriod } from './formatters'

const downloadTextFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const exportReportCsv = (obras: Obra[], despesas: Despesa[]) => {
  const rows: string[][] = [
    ['Tipo', 'Data/Periodo', 'Localizacao', 'Natureza', 'Categoria/Servico', 'Descricao', 'Quantidade', 'Unidade', 'Valor', 'Subtotal'],
  ]

  obras.forEach((obra) => {
    obra.itens.forEach((item) => {
      rows.push([
        'Receita',
        formatPeriod(obra.periodoInicio, obra.periodoFim),
        obra.localizacao,
        item.tipo === 'despesa' ? 'Despesa da obra' : 'Receita da obra',
        item.servico,
        item.descricao,
        String(item.quantidade),
        item.unidade,
        item.valorUnitario.toFixed(2),
        item.subtotal.toFixed(2),
      ])
    })
  })

  despesas.forEach((despesa) => {
    rows.push([
      'Despesa',
      formatDate(despesa.data),
      obras.find((obra) => obra.id === despesa.obraId)?.localizacao ?? '-',
      'Despesa avulsa',
      despesa.categoria,
      despesa.descricao,
      '',
      '',
      despesa.valor.toFixed(2),
      despesa.valor.toFixed(2),
    ])
  })

  const csv = rows
    .map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(';'))
    .join('\n')

  downloadTextFile('controle-servico-relatorio.csv', csv, 'text/csv;charset=utf-8;')
}

export const printReport = () => window.print()
