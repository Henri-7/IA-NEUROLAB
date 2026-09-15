from uuid import UUID

from app.core.errors import AppError
from app.repositories.base import ReadRepository
from app.schemas.analyses import AnalysisDetail, AnalysisSummary


class AnalysisService:
    def __init__(self, repository: ReadRepository[AnalysisDetail]) -> None:
        self._repository = repository

    def list_analyses(self) -> list[AnalysisSummary]:
        return [
            AnalysisSummary.model_validate(
                analysis.model_dump(exclude={"authors", "identifier", "fields"})
            )
            for analysis in self._repository.list_all()
        ]

    def get_analysis(self, analysis_id: UUID) -> AnalysisDetail:
        analysis = self._repository.get_by_id(analysis_id)
        if analysis is None:
            raise AppError(status_code=404, code="ANALYSIS_NOT_FOUND", message="Análise não encontrada.")
        return analysis

