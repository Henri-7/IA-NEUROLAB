import { ExternalLink, FileText, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { getApiErrorMessage, isRequestCancelled } from '../services/api'
import { listAnalyses } from '../services/analyses'
import { listDocuments } from '../services/documents'
import type { DocumentSummary, ScientificAnalysisSummary } from '../types/scientific'

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (signal?: AbortSignal) => {
    setLoading(true); setError('')
    try {
      const [documentData, analysisData] = await Promise.all([listDocuments(signal), listAnalyses(signal)])
      setDocuments(documentData)
      setAnalyses(analysisData)
    } catch (requestError) {
      if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível carregar os documentos.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR')
    return documents.filter((document) => document.title.toLocaleLowerCase('pt-BR').includes(term) || document.fileName.toLocaleLowerCase('pt-BR').includes(term))
  }, [documents, query])

  return (
    <div className="page-container">
      <PageHeader eyebrow="BIBLIOTECA" title="Documentos" description="Fontes adicionadas ao workspace e suas versões de análise." />
      <section className="surface-card table-card" aria-label="Lista de documentos">
        <div className="toolbar">
          <label className="search-field"><Search size={17} /><span className="visually-hidden">Buscar documentos</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título ou arquivo…" /></label>
          <span className="result-count">{filtered.length} {filtered.length === 1 ? 'documento' : 'documentos'}</span>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState onRetry={() => void load()} title="Não foi possível carregar os documentos" description={error} /> : filtered.length === 0 ? <EmptyState title="Nenhum documento encontrado" description={query ? 'Tente buscar por outro título ou nome de arquivo.' : 'Os documentos adicionados aparecerão aqui.'} /> : (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Documento</th><th>Tipo</th><th>Adicionado em</th><th>Status</th><th>Versão</th><th><span className="visually-hidden">Ação</span></th></tr></thead>
              <tbody>{filtered.map((document) => {
                const analysis = analyses.find((item) => item.documentId === document.id)
                return <tr key={document.id}>
                  <td data-label="Documento"><div className="document-cell"><span className="file-icon"><FileText size={17} /></span><div><strong>{document.title}</strong><small>{document.fileName}</small></div></div></td>
                  <td data-label="Tipo"><span className="mono-value">{document.type}</span></td>
                  <td data-label="Adicionado em">{document.addedAt}</td>
                  <td data-label="Status"><StatusBadge status={document.status} /></td>
                  <td data-label="Versão"><span className="mono-value">{document.version}</span></td>
                  <td><Link className="icon-link" to={analysis ? `/analises/${analysis.id}` : '/analises'} aria-label={`Abrir análise de ${document.title}`}><ExternalLink size={17} /></Link></td>
                </tr>
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
