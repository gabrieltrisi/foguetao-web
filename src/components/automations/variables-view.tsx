"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { VariableTable } from "@/components/automations/variable-table";
import { useToast } from "@/components/ui/toast";

const TYPES = ["string", "number", "secret", "boolean", "json"].map((t) => ({ value: t, label: t }));
const ENVS = [{ value: "prod", label: "Produção" }, { value: "staging", label: "Staging" }, { value: "dev", label: "Dev" }];
const SCOPES = [{ value: "global", label: "Global" }, { value: "workflow", label: "Workflow" }];

export function VariablesView() {
  const { toast } = useToast();
  const [type, setType] = React.useState("string");
  const [env, setEnv] = React.useState("prod");
  const [scope, setScope] = React.useState("global");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Modal>
          <ModalTrigger asChild><Button size="sm"><Plus />Nova variável</Button></ModalTrigger>
          <ModalContent
            title="Nova variável"
            description="Defina uma variável reutilizável nas automações."
            footer={
              <>
                <ModalClose asChild><Button size="sm" variant="secondary">Cancelar</Button></ModalClose>
                <ModalClose asChild><Button size="sm" onClick={() => toast({ title: "Variável criada (mock)", variant: "success" })}>Salvar</Button></ModalClose>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField id="v-key" label="Chave" required>{(p) => <Input placeholder="EX_MINHA_VARIAVEL" {...p} />}</FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="v-type" label="Tipo">{(p) => <Combobox id={p.id} options={TYPES} value={type} onValueChange={setType} />}</FormField>
                <FormField id="v-env" label="Ambiente">{(p) => <Combobox id={p.id} options={ENVS} value={env} onValueChange={setEnv} />}</FormField>
              </div>
              <FormField id="v-value" label="Valor">{(p) => <Input placeholder="valor" {...p} />}</FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="v-scope" label="Escopo">{(p) => <Combobox id={p.id} options={SCOPES} value={scope} onValueChange={setScope} />}</FormField>
                <FormField id="v-desc" label="Descrição">{(p) => <Input placeholder="Para que serve" {...p} />}</FormField>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>
      <VariableTable />
    </div>
  );
}
