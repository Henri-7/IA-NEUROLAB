from datetime import datetime, timezone
from uuid import UUID

from app.schemas.analyses import (
    AnalysisDetail,
    AnalysisStatus,
    EvidenceStatus,
    ScientificField,
    ScientificFieldKey,
    SourceReference,
)
from app.schemas.documents import DocumentStatus, DocumentSummary, FileType
from app.schemas.reviews import ReviewItem, ReviewStatus

DOCUMENT_A_ID = UUID("11111111-1111-4111-8111-111111111111")
DOCUMENT_B_ID = UUID("22222222-2222-4222-8222-222222222222")
DOCUMENT_C_ID = UUID("33333333-3333-4333-8333-333333333333")

ANALYSIS_A_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1")
ANALYSIS_B_ID = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2")
ANALYSIS_C_ID = UUID("cccccccc-cccc-4ccc-8ccc-ccccccccccc3")

CREATED_AT = datetime(2026, 9, 10, 12, 0, tzinfo=timezone.utc)
UPDATED_AT = datetime(2026, 9, 12, 15, 30, tzinfo=timezone.utc)

DEMO_DOCUMENTS: tuple[DocumentSummary, ...] = (
    DocumentSummary(
        id=DOCUMENT_A_ID,
        title="Documento científico demonstrativo A",
        filename="documento_demo_a.pdf",
        file_type=FileType.PDF,
        version="v1.0",
        status=DocumentStatus.READY,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        demo=True,
    ),
    DocumentSummary(
        id=DOCUMENT_B_ID,
        title="Documento científico demonstrativo B",
        filename="documento_demo_b.pdf",
        file_type=FileType.PDF,
        version="v1.1",
        status=DocumentStatus.READY,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        demo=True,
    ),
    DocumentSummary(
        id=DOCUMENT_C_ID,
        title="Documento científico demonstrativo C",
        filename="documento_demo_c.docx",
        file_type=FileType.DOCX,
        version="v1.0",
        status=DocumentStatus.PROCESSING,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        demo=True,
    ),
)


def _source(document_id: UUID, document_title: str, page: int | None, section: str | None) -> SourceReference:
    return SourceReference(
        document_id=document_id,
        document_title=document_title,
        page=page,
        section=section,
        excerpt="Trecho demonstrativo sem conteúdo científico real.",
        source_type="document",
        demo=True,
    )


def _fields(document_id: UUID, document_title: str, variant: str) -> list[ScientificField]:
    content = f"Conteúdo demonstrativo {variant}; não representa uma afirmação científica."
    source = _source(document_id, document_title, 1, "Seção demonstrativa")
    return [
        ScientificField(key=ScientificFieldKey.IDENTIFICATION, label="Identificação", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.OBJECTIVE, label="Objetivo", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.STUDY_DESIGN, label="Desenho do estudo", value=content, evidence_status=EvidenceStatus.AMBIGUOUS, sources=[source]),
        ScientificField(key=ScientificFieldKey.POPULATION, label="População", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.AGE_RANGE, label="Faixa etária", value=content, evidence_status=EvidenceStatus.UNVERIFIABLE, sources=[]),
        ScientificField(key=ScientificFieldKey.SAMPLE_SIZE, label="Tamanho da amostra", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.EXPOSURE, label="Exposição", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.MEASURES, label="Medidas", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.RESULTS, label="Resultados", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.NULL_RESULTS, label="Resultados nulos", value="Informação ausente no conjunto demonstrativo.", evidence_status=EvidenceStatus.MISSING, sources=[]),
        ScientificField(key=ScientificFieldKey.LIMITATIONS, label="Limitações", value=content, evidence_status=EvidenceStatus.FOUND, sources=[source]),
        ScientificField(key=ScientificFieldKey.OBSERVATIONS, label="Observações", value="Observação exclusivamente demonstrativa; nenhuma IA foi executada.", evidence_status=EvidenceStatus.UNVERIFIABLE, sources=[]),
    ]


DEMO_ANALYSES: tuple[AnalysisDetail, ...] = (
    AnalysisDetail(
        id=ANALYSIS_A_ID,
        document_id=DOCUMENT_A_ID,
        document_title="Documento científico demonstrativo A",
        title="Análise demonstrativa A",
        year=None,
        document_version="v1.0",
        status=AnalysisStatus.PENDING_REVIEW,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        authors=["Autoria demonstrativa"],
        identifier="DEMO-A",
        fields=_fields(DOCUMENT_A_ID, "Documento científico demonstrativo A", "A"),
        demo=True,
    ),
    AnalysisDetail(
        id=ANALYSIS_B_ID,
        document_id=DOCUMENT_B_ID,
        document_title="Documento científico demonstrativo B",
        title="Análise demonstrativa B",
        year=None,
        document_version="v1.1",
        status=AnalysisStatus.REVIEWED,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        authors=["Autoria demonstrativa"],
        identifier="DEMO-B",
        fields=_fields(DOCUMENT_B_ID, "Documento científico demonstrativo B", "B"),
        demo=True,
    ),
    AnalysisDetail(
        id=ANALYSIS_C_ID,
        document_id=DOCUMENT_C_ID,
        document_title="Documento científico demonstrativo C",
        title="Análise demonstrativa C",
        year=None,
        document_version="v1.0",
        status=AnalysisStatus.IN_PROGRESS,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        authors=["Autoria demonstrativa"],
        identifier="DEMO-C",
        fields=_fields(DOCUMENT_C_ID, "Documento científico demonstrativo C", "C"),
        demo=True,
    ),
)

DEMO_REVIEWS: tuple[ReviewItem, ...] = (
    ReviewItem(
        analysis_id=ANALYSIS_A_ID,
        document_id=DOCUMENT_A_ID,
        status=ReviewStatus.PENDING,
        reviewed_at=None,
        reviewer=None,
        demo=True,
    ),
    ReviewItem(
        analysis_id=ANALYSIS_B_ID,
        document_id=DOCUMENT_B_ID,
        status=ReviewStatus.REVIEWED,
        reviewed_at=UPDATED_AT,
        reviewer=None,
        demo=True,
    ),
)

