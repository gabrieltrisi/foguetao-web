"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Plus, Star, Trash2, TriangleAlert, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { CustomStagesEditor, DEFAULT_CUSTOM_STAGES } from "@/components/crm/custom-stages-editor";
import { messageForPipelineError } from "@/components/crm/pipeline-form";
import {
  usePipeline,
  usePipelineStages,
  useSetupPipeline,
  useSetDefaultPipeline,
  useDeletePipeline,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  useReorderStages,
} from "@/hooks/crm/use-pipelines";
import {
  pipelineSetupStatus,
  stageCategoryLabel,
  missingRequirementLabel,
} from "@/lib/crm/pipeline-setup";
import { isApiError } from "@/types/api/error";
import type { ApiStage, CustomStageInput, StageCategory } from "@/types/api/crm-deals";

const CATEGORY_OPTIONS = (["OPEN", "WON", "LOST"] as StageCategory[]).map((c) => ({
  value: c,
  label: stageCategoryLabel[c],
}));

const categoryTone: Record<StageCategory, "info" | "success" | "danger"> = {
  OPEN: "info",
  WON: "success",
  LOST: "danger",
};

function messageForStageError(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "STAGE_ALREADY_EXISTS") return "Já existe uma etapa com este nome.";
    if (error.code === "STAGE_HAS_ACTIVE_DEALS") return "A etapa possui oportunidades ativas.";
    if (error.code === "STAGE_REQUIRED_CATEGORY") return "O pipeline precisa manter etapas Aberta, Ganha e Perdida.";
    if (error.code === "STAGE_CATEGORY_CONFLICT") return "Já existe uma etapa desta categoria.";
    if (error.code === "STAGE_REORDER_INVALID") return "Ordenação inválida: envie todas as etapas.";
    if (error.isForbidden) return "Você não tem permissão para esta ação.";
    return error.message;
  }
  return "Não foi possível atualizar a etapa.";
}

export function PipelineDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();

  const pipeline = usePipeline(id);
  const stagesQuery = usePipelineStages(id);
  const setup = useSetupPipeline(id);
  const setDefault = useSetDefaultPipeline();
  const del = useDeletePipeline();
  const createStage = useCreateStage(id);
  const updateStage = useUpdateStage(id);
  const deleteStage = useDeleteStage(id);
  const reorder = useReorderStages(id);

  const canStagesCreate = can("crm.stages.create");
  const canStagesUpdate = can("crm.stages.update");
  const canStagesDelete = can("crm.stages.delete");
  const canReorder = can("crm.stages.reorder");
  const canPipelineUpdate = can("crm.pipelines.update");
  const canPipelineDelete = can("crm.pipelines.delete");

  const [setupMode, setSetupMode] = React.useState<"STANDARD" | "CUSTOM">("STANDARD");
  const [setupStages, setSetupStages] = React.useState<CustomStageInput[]>(DEFAULT_CUSTOM_STAGES);
  const [newStage, setNewStage] = React.useState<CustomStageInput>({ name: "", category: "OPEN", probability: 50 });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (pipeline.isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando pipeline…</p>;
  }
  if (pipeline.isError || !pipeline.data) {
    const notFound = isApiError(pipeline.error) && pipeline.error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Pipeline não encontrado." : "Não foi possível carregar o pipeline."}
        onRetry={notFound ? undefined : () => pipeline.refetch()}
      />
    );
  }

  const p = pipeline.data;
  const stages = [...(stagesQuery.data ?? [])].sort((a, b) => a.position - b.position);
  const status = pipelineSetupStatus(stages);
  const isEmpty = stages.length === 0;

  const doReorder = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= stages.length) return;
    const next = [...stages];
    [next[i], next[j]] = [next[j], next[i]];
    reorder.mutate(
      next.map((s) => s.id),
      { onError: (e) => toast({ title: messageForStageError(e), variant: "error" }) },
    );
  };

  return (
    <DetailPageLayout
      title={p.name}
      subtitle={p.description ?? undefined}
      back={{ href: "/pipelines", label: "Pipelines" }}
      actions={
        <>
          {canPipelineUpdate && !p.isDefault ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={!status.complete}
              title={!status.complete ? "Configure as etapas antes de definir como padrão." : undefined}
              loading={setDefault.isPending}
              onClick={() =>
                setDefault.mutate(id, {
                  onSuccess: () => toast({ title: "Pipeline padrão atualizado", variant: "success" }),
                  onError: (e) => toast({ title: messageForPipelineError(e), variant: "error" }),
                })
              }
            >
              <Star className="size-4" aria-hidden /> Tornar padrão
            </Button>
          ) : null}
          {canPipelineDelete ? (
            <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden /> Excluir
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Status de configuração */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            {p.isDefault ? <Badge tone="brand">Padrão</Badge> : null}
            {status.complete ? (
              <Badge tone="success">Configuração completa</Badge>
            ) : (
              <Badge tone="warning">Configuração incompleta</Badge>
            )}
          </div>
          {!status.complete ? (
            <p className="flex items-center gap-1.5 text-caption text-warning">
              <TriangleAlert className="size-3.5" aria-hidden />
              Falta: {status.missing.map((m) => missingRequirementLabel[m]).join(", ")}.
            </p>
          ) : null}
        </Card>

        {/* Setup de pipeline vazio */}
        {isEmpty && canStagesCreate ? (
          <Card className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Configurar etapas</h2>
              <p className="text-body2 text-ink-2">
                Este pipeline está vazio. Provisione as etapas padrão ou defina as suas.
              </p>
            </div>
            <SegmentedControl
              options={[
                { value: "STANDARD", label: "Padrão" },
                { value: "CUSTOM", label: "Personalizado" },
              ]}
              value={setupMode}
              onValueChange={(v) => setSetupMode(v as "STANDARD" | "CUSTOM")}
            />
            {setupMode === "CUSTOM" ? <CustomStagesEditor stages={setupStages} onChange={setSetupStages} /> : null}
            <Button
              size="sm"
              className="w-fit"
              loading={setup.isPending}
              onClick={() =>
                setup.mutate(
                  { setupMode, stages: setupMode === "CUSTOM" ? setupStages : undefined },
                  {
                    onSuccess: (r) =>
                      toast({
                        title: r.setupComplete ? "Pipeline configurado" : "Configuração ainda incompleta",
                        variant: r.setupComplete ? "success" : "warning",
                      }),
                    onError: (e) => toast({ title: messageForPipelineError(e), variant: "error" }),
                  },
                )
              }
            >
              Configurar pipeline
            </Button>
          </Card>
        ) : null}

        {/* Etapas */}
        <Card className="flex flex-col gap-4 p-5">
          <h2 className="font-display text-h3 font-semibold text-ink">Etapas ({stages.length})</h2>

          {stagesQuery.isLoading ? (
            <p className="text-body2 text-ink-3">Carregando etapas…</p>
          ) : stages.length === 0 ? (
            <p className="text-body2 text-ink-3">Nenhuma etapa configurada.</p>
          ) : (
            <ul aria-label="Etapas do pipeline" className="flex flex-col gap-2">
              {stages.map((s, i) => (
                <li key={s.id}>
                  {editingId === s.id ? (
                    <StageEditRow
                      stage={s}
                      pending={updateStage.isPending}
                      onCancel={() => setEditingId(null)}
                      onSave={(patch) =>
                        updateStage.mutate(
                          { stageId: s.id, ...patch },
                          {
                            onSuccess: () => {
                              toast({ title: "Etapa atualizada", variant: "success" });
                              setEditingId(null);
                            },
                            onError: (e) => toast({ title: messageForStageError(e), variant: "error" }),
                          },
                        )
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-line p-3">
                      <span className="w-6 shrink-0 text-caption text-ink-3 tabular-nums">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{s.name}</p>
                        <p className="text-caption text-ink-3">
                          Probabilidade: {s.probability ?? 0}%
                        </p>
                      </div>
                      <Badge tone={categoryTone[s.category]}>{stageCategoryLabel[s.category]}</Badge>
                      <div className="flex items-center gap-1">
                        {canReorder ? (
                          <>
                            <Button size="icon-sm" variant="ghost" aria-label={`Mover ${s.name} para cima`} disabled={i === 0 || reorder.isPending} onClick={() => doReorder(i, -1)}>
                              <ArrowUp className="size-4" aria-hidden />
                            </Button>
                            <Button size="icon-sm" variant="ghost" aria-label={`Mover ${s.name} para baixo`} disabled={i === stages.length - 1 || reorder.isPending} onClick={() => doReorder(i, 1)}>
                              <ArrowDown className="size-4" aria-hidden />
                            </Button>
                          </>
                        ) : null}
                        {canStagesUpdate ? (
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(s.id)}>Editar</Button>
                        ) : null}
                        {canStagesDelete ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Excluir ${s.name}`}
                            onClick={() =>
                              deleteStage.mutate(s.id, {
                                onSuccess: () => toast({ title: "Etapa excluída", variant: "success" }),
                                onError: (e) => toast({ title: messageForStageError(e), variant: "error" }),
                              })
                            }
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Nova etapa */}
          {canStagesCreate && !isEmpty ? (
            <div className="grid grid-cols-1 items-end gap-2 border-t border-line pt-4 sm:grid-cols-[1fr_140px_110px_auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-stage-name">Nova etapa</Label>
                <Input
                  id="new-stage-name"
                  placeholder="Nome da etapa"
                  value={newStage.name}
                  onChange={(e) => setNewStage((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-stage-cat">Categoria</Label>
                <Combobox
                  id="new-stage-cat"
                  options={CATEGORY_OPTIONS}
                  value={newStage.category}
                  onValueChange={(v) => setNewStage((s) => ({ ...s, category: v as StageCategory }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-stage-prob">Prob. (%)</Label>
                <Input
                  id="new-stage-prob"
                  type="number"
                  min={0}
                  max={100}
                  value={newStage.probability ?? ""}
                  onChange={(e) =>
                    setNewStage((s) => ({ ...s, probability: e.target.value === "" ? undefined : Number(e.target.value) }))
                  }
                />
              </div>
              <Button
                size="sm"
                disabled={!newStage.name.trim() || createStage.isPending}
                onClick={() =>
                  createStage.mutate(newStage, {
                    onSuccess: () => {
                      toast({ title: "Etapa criada", variant: "success" });
                      setNewStage({ name: "", category: "OPEN", probability: 50 });
                    },
                    onError: (e) => toast({ title: messageForStageError(e), variant: "error" }),
                  })
                }
              >
                <Plus className="size-4" aria-hidden /> Adicionar
              </Button>
            </div>
          ) : null}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir pipeline?"
        description="Só é possível excluir pipelines sem oportunidades ativas."
        confirmLabel="Excluir"
        destructive
        onConfirm={() =>
          del.mutate(id, {
            onSuccess: () => {
              toast({ title: "Pipeline excluído", variant: "success" });
              router.push("/pipelines");
            },
            onError: (e) => toast({ title: messageForPipelineError(e), variant: "error" }),
          })
        }
      />
    </DetailPageLayout>
  );
}

/** Edição inline de uma etapa. */
function StageEditRow({
  stage,
  pending,
  onSave,
  onCancel,
}: {
  stage: ApiStage;
  pending: boolean;
  onSave: (patch: Partial<CustomStageInput>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(stage.name);
  const [category, setCategory] = React.useState<StageCategory>(stage.category);
  const [probability, setProbability] = React.useState<number | undefined>(stage.probability ?? undefined);

  return (
    <div className="grid grid-cols-1 items-end gap-2 rounded-lg border border-brand/40 bg-brand-soft/30 p-3 sm:grid-cols-[1fr_140px_110px_auto]">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-name-${stage.id}`}>Nome</Label>
        <Input id={`edit-name-${stage.id}`} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-cat-${stage.id}`}>Categoria</Label>
        <Combobox
          id={`edit-cat-${stage.id}`}
          options={CATEGORY_OPTIONS}
          value={category}
          onValueChange={(v) => setCategory(v as StageCategory)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-prob-${stage.id}`}>Prob. (%)</Label>
        <Input
          id={`edit-prob-${stage.id}`}
          type="number"
          min={0}
          max={100}
          value={probability ?? ""}
          onChange={(e) => setProbability(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon-sm" aria-label="Salvar etapa" loading={pending} onClick={() => onSave({ name: name.trim(), category, probability })}>
          <Check className="size-4" aria-hidden />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Cancelar edição" onClick={onCancel}>
          <X className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
