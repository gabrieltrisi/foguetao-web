"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";

const PRIORITY = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];
const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function NewTaskButton() {
  const { toast } = useToast();
  const [priority, setPriority] = React.useState("media");
  const [owner, setOwner] = React.useState("cr");
  const [due, setDue] = React.useState<Date | undefined>();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova tarefa
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        title="Nova tarefa"
        description="Crie uma tarefa rápida."
        footer={
          <>
            <SheetClose asChild>
              <Button size="sm" variant="secondary">
                Cancelar
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button size="sm" onClick={() => toast({ title: "Tarefa criada (mock)", variant: "success" })}>
                Salvar
              </Button>
            </SheetClose>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField id="nt-title" label="Título" required>
            {(p) => <Input placeholder="O que precisa ser feito?" {...p} />}
          </FormField>
          <FormField id="nt-desc" label="Descrição">
            {(p) => <Textarea placeholder="Detalhes…" rows={3} {...p} />}
          </FormField>
          <FormField id="nt-owner" label="Responsável">
            {(p) => <AssigneeSelector id={p.id} people={PEOPLE} value={owner} onValueChange={setOwner} />}
          </FormField>
          <FormField id="nt-priority" label="Prioridade">
            {(p) => <Combobox id={p.id} options={PRIORITY} value={priority} onValueChange={setPriority} />}
          </FormField>
          <FormField id="nt-due" label="Prazo">
            {(p) => <DatePicker id={p.id} value={due} onValueChange={setDue} />}
          </FormField>
        </div>
      </SheetContent>
    </Sheet>
  );
}
