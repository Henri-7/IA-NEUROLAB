import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AnalysesPage } from './pages/AnalysesPage'
import { AnalysisDetailPage } from './pages/AnalysisDetailPage'
import { ChatPage } from './pages/ChatPage'
import { ComparePage } from './pages/ComparePage'
import { DocumentsPage } from './pages/DocumentsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OverviewPage } from './pages/OverviewPage'
import { ReviewsPage } from './pages/ReviewsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="documentos" element={<DocumentsPage />} />
          <Route path="analises" element={<AnalysesPage />} />
          <Route path="analises/:id" element={<AnalysisDetailPage />} />
          <Route path="comparar" element={<ComparePage />} />
          <Route path="revisoes" element={<ReviewsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
