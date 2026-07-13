"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { NumberInput } from "@/components/ui/number-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Combobox, MultiSelect, SearchableSelect } from "@/components/ui/combobox";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { ShowcaseSection, Example } from "@/components/design-system/showcase-ui";
import { ShowcaseNav } from "@/components/design-system/showcase-nav";

const OPTIONS = [
  { value: "sp", label: "Matriz SP" },
  { value: "rj", label: "Filial RJ" },
  { value: "labs", label: "Foguetão Labs" },
  { value: "mg", label: "Filial MG" },
];

export function FormsShowcase() {
  const [combo, setCombo] = React.useState("sp");
  const [multi, setMulti] = React.useState<string[]>(["sp", "labs"]);
  const [search, setSearch] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>();
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [num, setNum] = React.useState(3);
  const [currency, setCurrency] = React.useState(4280);
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [radio, setRadio] = React.useState("email");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Formulários" description="Campos, seleção, datas e navegação de formulário." />
      <ShowcaseNav />

      <ShowcaseSection title="Campos de texto" description="FormField faz o wiring de label/erro/aria.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="fs-name" label="Nome" required>
            {(p) => <Input placeholder="Nome do contato" {...p} />}
          </FormField>
          <FormField id="fs-email" label="E-mail" error="E-mail inválido.">
            {(p) => <Input defaultValue="foo@" {...p} />}
          </FormField>
          <FormField
            id="fs-notes"
            label="Observações"
            description="Máx. 500 caracteres."
            className="sm:col-span-2"
          >
            {(p) => <Textarea placeholder="Escreva uma nota…" {...p} />}
          </FormField>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Numéricos e mascarados">
        <div className="grid gap-5 sm:grid-cols-3">
          <Example label="Number">
            <NumberInput value={num} onValueChange={setNum} min={0} max={99} />
          </Example>
          <Example label="Moeda (BRL)">
            <CurrencyInput value={currency} onValueChange={setCurrency} />
          </Example>
          <Example label="Telefone">
            <PhoneInput />
          </Example>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Seleção">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Example label="Combobox">
            <Combobox options={OPTIONS} value={combo} onValueChange={setCombo} />
          </Example>
          <Example label="MultiSelect">
            <MultiSelect options={OPTIONS} value={multi} onValueChange={setMulti} />
          </Example>
          <Example label="SearchableSelect">
            <SearchableSelect
              options={OPTIONS}
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar empresa…"
            />
          </Example>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Datas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Example label="DatePicker">
            <DatePicker value={date} onValueChange={setDate} />
          </Example>
          <Example label="DateRangePicker">
            <DateRangePicker value={range} onValueChange={setRange} />
          </Example>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Switch e RadioGroup">
        <div className="grid gap-6 sm:grid-cols-2">
          <Example label="Switch">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-body2 text-ink-2">
                <Switch defaultChecked /> Ativo
              </label>
              <label className="flex items-center gap-2 text-body2 text-ink-3">
                <Switch disabled /> Desabilitado
              </label>
            </div>
          </Example>
          <Example label="RadioGroup">
            <RadioGroup value={radio} onValueChange={setRadio}>
              <RadioOption value="email" id="r-email">
                E-mail
              </RadioOption>
              <RadioOption value="whatsapp" id="r-whats">
                WhatsApp
              </RadioOption>
              <RadioOption value="sms" id="r-sms" disabled>
                SMS (indisponível)
              </RadioOption>
            </RadioGroup>
          </Example>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Navegação de formulário">
        <div className="flex flex-col gap-6">
          <Example label="SegmentedControl">
            <SegmentedControl
              options={[
                { value: "list", label: "Lista", icon: <List className="size-4" /> },
                { value: "grid", label: "Grade", icon: <LayoutGrid className="size-4" /> },
              ]}
              value={view}
              onValueChange={setView}
            />
          </Example>
          <Example label="Tabs">
            <Tabs defaultValue="dados">
              <TabsList>
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="atividade">Atividade</TabsTrigger>
                <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              </TabsList>
              <TabsContent value="dados">
                <p className="text-body2 text-ink-2">Conteúdo da aba Dados.</p>
              </TabsContent>
              <TabsContent value="atividade">
                <p className="text-body2 text-ink-2">Conteúdo da aba Atividade.</p>
              </TabsContent>
              <TabsContent value="arquivos">
                <p className="text-body2 text-ink-2">Conteúdo da aba Arquivos.</p>
              </TabsContent>
            </Tabs>
          </Example>
          <Example label="Stepper">
            <Stepper
              current={1}
              steps={[{ label: "Dados" }, { label: "Contato" }, { label: "Revisão" }]}
            />
          </Example>
        </div>
      </ShowcaseSection>
    </div>
  );
}
