"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { CustomStagesEditor, DEFAULT_CUSTOM_STAGES } from "@/components/crm/custom-stages-editor";
import { useCreatePipeline } from "@/hooks/crm/use-pipelines";
import { validateCustomStages } from "@/lib/crm/pipeline-setup";
import { isApiError } from "@/types/api/error";
import type { CustomStageInput, PipelineSetupMode } from "@/types/api/crm-deals";

const MODES: { value: PipelineSetupMode; label: string }[] = [
  { value: "STANDARD", label: "Padrão" },
  { value: "CUSTOM", label: "Personalizado" },
  { value: "EMPTY", label: "Vazio" },
];

const MODE_HINT: Record<PipelineSetupMode, string> = {
  STANDARD: "O backend provisiona as etapas padrão (aberta, ganha e perdida). Recomendado.",
  CUSTOM: "Defina suas próprias etapas. Exige ao menos 1 Aberta, exatamente 1 Ganha e 1 Perdida.",
  EMPTY: "Cria o pipeline sem etapas. Ele ficará incompleto até você configurá-lo.",
};

export function messageForPipelineError(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "PIPELINE_ALREADY_EXISTS") return "Já existe um pipeline com este nome.";
    if (error.code === "PIPELINE_ALREADY_CONFIGURED") return "Este pipeline já possui etapas configuradas.";
    if (error.code === "PIPELINE_SETUP_INCOMPLETE") return "Configure as etapas do pipeline antes de continuar.";
    if (error.code === "PIPELINE_HAS_ACTIVE_DEALS") return "Não é possível excluir: há oportunidades ativas neste pipeline.";
    if (error.code === "PIPELINE_LAST_ACTIVE") return "Não é possível excluir o último pipeline ativo.";
    if (error.code === "PIPELINE_DEFAULT_REQUIRED") return "É necessário manter um pipeline padrão.";
    if (error.code === "VALIDATION_ERROR") return "Verifique os campos e tente novamente.";
    if (error.isForbidden) return "Você não tem permissão para esta ação.";
    return error.message;
  }
  return "Não foi possível salvar o pipeline.";
}

export function PipelineForm() {
  const router = useRouter();
  const { toast } = useToast();
  const create = useCreatePipeline();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [mode, setMode] = React.useState<PipelineSetupMode>("STANDARD");
  const [stages, setStages] = React.useState<CustomStageInput[]>(DEFAULT_CUSTOM_STAGES);
  const [stagesError, setStagesError] = React.useState<string | null>(null);

  async function handleSave() {
    setStagesError(null);
    if (mode === "CUSTOM") {
      const error = validateCustomStages(stages);
      if (error) {
        setStagesError(error);
        return;
      }
    }
    try {
      const created = await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        setupMode: mode,
        stages: mode === "CUSTOM" ? stages : undefined,
      });
      toast({
        title: created.setupComplete ? "Pipeline criado" : "Pipeline criado (configuração pendente)",
        variant: created.setupComplete ? "success" : "warning",
      });
      router.push(`/pipelines/${created.id}`);
    } catch (error) {
      toast({ title: messageForPipelineError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title="Novo pipeline"
      description="Crie um funil comercial e defina como as etapas serão configuradas."
      back={{ href: "/pipelines", label: "Pipelines" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/pipelines">Cancelar</Link>
          </Button>
          <Button size="sm" loading={create.isPending} disabled={name.trim().length < 2} onClick={handleSave}>
            Criar pipeline
          </Button>
        </>
      }
    >
      <Card className="flex flex-col gap-5 p-5">
        <FormField id="pf-name" label="Nome" required>
          {(p) => <Input placeholder="Ex.: Funil de vendas" value={name} onChange={(e) => setName(e.target.value)} {...p} />}
        </FormField>
        <FormField id="pf-desc" label="Descrição">
          {(p) => <Textarea placeholder="Opcional" value={description} onChange={(e) => setDescription(e.target.value)} {...p} />}
        </FormField>

        <div>
          <p className="mb-1.5 text-body2 font-semibold text-ink">Configuração das etapas</p>
          <SegmentedControl options={MODES} value={mode} onValueChange={(v) => setMode(v)} />
          <p className="mt-2 flex items-start gap-1.5 text-caption text-ink-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-ink-3" aria-hidden />
            {MODE_HINT[mode]}
          </p>
        </div>

        {mode === "CUSTOM" ? (
          <div>
            <p className="mb-2 text-body2 font-semibold text-ink">Etapas</p>
            <CustomStagesEditor stages={stages} onChange={setStages} />
            {stagesError ? (
              <p role="alert" className="mt-2 text-small text-danger">
                {stagesError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </FormPageLayout>
  );
}
