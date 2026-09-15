from app.core.errors import AppError
from app.repositories.base import ReadRepository
from app.schemas.analyses import AnalysisDetail, ScientificFieldKey
from app.schemas.comparisons import (
    ComparisonFieldKey,
    ComparisonRequest,
    ComparisonResponse,
    ComparisonRow,
    ComparisonStudy,
)

COMPARISON_FIELDS: tuple[tuple[ComparisonFieldKey, ScientificFieldKey, str], ...] = (
    (ComparisonFieldKey.POPULATION, ScientificFieldKey.POPULATION, "População"),
    (ComparisonFieldKey.AGE_RANGE, ScientificFieldKey.AGE_RANGE, "Faixa etária"),
    (ComparisonFieldKey.SAMPLE_SIZE, ScientificFieldKey.SAMPLE_SIZE, "Tamanho da amostra"),
    (ComparisonFieldKey.STUDY_DESIGN, ScientificFieldKey.STUDY_DESIGN, "Desenho do estudo"),
    (ComparisonFieldKey.EXPOSURE, ScientificFieldKey.EXPOSURE, "Exposição"),
    (ComparisonFieldKey.INSTRUMENTS, ScientificFieldKey.MEASURES, "Instrumentos"),
    (ComparisonFieldKey.RESULTS, ScientificFieldKey.RESULTS, "Resultados"),
    (ComparisonFieldKey.NULL_RESULTS, ScientificFieldKey.NULL_RESULTS, "Resultados nulos"),
    (ComparisonFieldKey.LIMITATIONS, ScientificFieldKey.LIMITATIONS, "Limitações"),
)


class ComparisonService:
    def __init__(self, analysis_repository: ReadRepository[AnalysisDetail]) -> None:
        self._analysis_repository = analysis_repository

    def compare(self, request: ComparisonRequest) -> ComparisonResponse:
        if len(request.analysis_ids) != 2:
            raise AppError(
                status_code=422,
                code="INVALID_COMPARISON",
                message="Envie exatamente dois IDs de análises.",
            )
        if request.analysis_ids[0] == request.analysis_ids[1]:
            raise AppError(
                status_code=422,
                code="INVALID_COMPARISON",
                message="As análises da comparação devem ser diferentes.",
            )

        analyses = [self._analysis_repository.get_by_id(item_id) for item_id in request.analysis_ids]
        if any(analysis is None for analysis in analyses):
            raise AppError(
                status_code=404,
                code="ANALYSIS_NOT_FOUND",
                message="Uma ou mais análises não foram encontradas.",
            )

        left, right = analyses
        assert left is not None and right is not None

        rows = [
            ComparisonRow(
                key=response_key,
                label=label,
                left=self._field_value(left, field_key),
                right=self._field_value(right, field_key),
            )
            for response_key, field_key, label in COMPARISON_FIELDS
        ]
        return ComparisonResponse(
            studies=[
                ComparisonStudy(analysis_id=left.id, title=left.title),
                ComparisonStudy(analysis_id=right.id, title=right.title),
            ],
            rows=rows,
            common_points=["Conteúdo demonstrativo para validar a área de pontos em comum."],
            differences=["Conteúdo demonstrativo para validar a área de diferenças."],
            contradictions=["Nenhuma conclusão científica é produzida nesta etapa demonstrativa."],
            demo=True,
        )

    @staticmethod
    def _field_value(analysis: AnalysisDetail, key: ScientificFieldKey) -> str:
        field = next((item for item in analysis.fields if item.key == key), None)
        return field.value if field else "Informação ausente no conjunto demonstrativo."

